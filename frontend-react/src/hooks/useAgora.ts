import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC, {
  type IAgoraRTCClient,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
  type IAgoraRTCRemoteUser,
  type ILocalVideoTrack,
  type UID,
} from 'agora-rtc-sdk-ng';

export interface RemoteParticipant {
  uid: UID;
  videoTrack: IAgoraRTCRemoteUser['videoTrack'];
  audioTrack: IAgoraRTCRemoteUser['audioTrack'];
  hasVideo: boolean;
  hasAudio: boolean;
}

export type CallState = 'idle' | 'joining' | 'connected' | 'error';

interface UseAgoraOptions {
  appId: string;
  channel: string;
  token?: string;
  uid?: number;
}

export interface UseAgoraReturn {
  callState: CallState;
  error: string | null;
  localVideoTrack: ICameraVideoTrack | null;
  localScreenTrack: ILocalVideoTrack | null;
  remoteParticipants: RemoteParticipant[];
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  // UIDs identified as screen-share clients (local only — no backend signaling).
  // Used to filter the local screen client's entry out of the camera grid.
  screenShareUids: Set<UID>;
  join: () => Promise<void>;
  leave: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
}

export function useAgora({ appId, channel, token, uid = 0 }: UseAgoraOptions): UseAgoraReturn {
  // ── Main call refs ──────────────────────────────────────────────────────────
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoRef = useRef<ICameraVideoTrack | null>(null);

  // ── Screen-share refs ───────────────────────────────────────────────────────
  // A separate client joins the same channel so camera + screen publish simultaneously.
  const screenClientRef = useRef<IAgoraRTCClient | null>(null);
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);
  // Ref mirrors isScreenSharing so callbacks never capture stale state.
  const isScreenSharingRef = useRef(false);

  // ── React state ─────────────────────────────────────────────────────────────
  const [callState, setCallState] = useState<CallState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localScreenTrack, setLocalScreenTrack] = useState<ILocalVideoTrack | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareUids, setScreenShareUids] = useState<Set<UID>>(new Set());

  // ── Remote participant handlers ─────────────────────────────────────────────
  const handleUserPublished = useCallback(
    async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      if (!clientRef.current) return;
      await clientRef.current.subscribe(user, mediaType);

      // Audio tracks play without a DOM element
      if (mediaType === 'audio') user.audioTrack?.play();

      setRemoteParticipants((prev) => {
        const existing = prev.find((p) => p.uid === user.uid);
        const updated: RemoteParticipant = {
          uid: user.uid,
          videoTrack: user.videoTrack ?? existing?.videoTrack ?? undefined,
          audioTrack: user.audioTrack ?? existing?.audioTrack ?? undefined,
          hasVideo: mediaType === 'video' ? true : (existing?.hasVideo ?? false),
          hasAudio: mediaType === 'audio' ? true : (existing?.hasAudio ?? false),
        };
        return existing
          ? prev.map((p) => (p.uid === user.uid ? updated : p))
          : [...prev, updated];
      });
    },
    []
  );

  const handleUserUnpublished = useCallback(
    (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      setRemoteParticipants((prev) =>
        prev.map((p) => {
          if (p.uid !== user.uid) return p;
          return {
            ...p,
            videoTrack: mediaType === 'video' ? undefined : p.videoTrack,
            audioTrack: mediaType === 'audio' ? undefined : p.audioTrack,
            hasVideo: mediaType === 'video' ? false : p.hasVideo,
            hasAudio: mediaType === 'audio' ? false : p.hasAudio,
          };
        })
      );
    },
    []
  );

  const handleUserLeft = useCallback((user: IAgoraRTCRemoteUser) => {
    setRemoteParticipants((prev) => prev.filter((p) => p.uid !== user.uid));
    // Clean up any screen-share UID entry when the screen client leaves
    setScreenShareUids((prev) => {
      const next = new Set(prev);
      next.delete(user.uid);
      return next;
    });
  }, []);

  // ── Screen share lifecycle ──────────────────────────────────────────────────

  // stopScreenShare reads only refs, so it is safe to call from the
  // track-ended event handler without capturing stale state.
  const stopScreenShare = useCallback(async () => {
    if (!isScreenSharingRef.current) return;
    isScreenSharingRef.current = false;

    // Capture the screen UID before tearing down the client.
    // Assign into a typed const so TypeScript preserves the narrowing inside
    // the setState callback below (closures can lose narrowing on UID | undefined).
    const rawUid = screenClientRef.current?.uid;

    screenTrackRef.current?.stop();
    screenTrackRef.current?.close();
    screenTrackRef.current = null;

    if (screenClientRef.current) {
      await screenClientRef.current.leave().catch(() => {});
      screenClientRef.current = null;
    }

    if (rawUid !== undefined) {
      const screenUid: UID = rawUid; // narrowed — safe to use in callback
      setScreenShareUids((prev) => {
        const next = new Set(prev);
        next.delete(screenUid);
        return next;
      });
    }

    setLocalScreenTrack(null);
    setIsScreenSharing(false);
  }, []);

  const startScreenShare = useCallback(async () => {
    if (!clientRef.current || isScreenSharingRef.current) return;

    let screenTrack: ILocalVideoTrack;
    try {
      // 'disable' keeps mic audio on the main client; no screen-audio capture.
      screenTrack = await AgoraRTC.createScreenVideoTrack(
        { optimizationMode: 'detail' },
        'disable'
      );
    } catch (err) {
      // User dismissed the browser share-picker — not an error worth surfacing.
      if (err instanceof Error && err.name === 'NotAllowedError') return;
      throw err;
    }

    try {
      const screenClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      screenClientRef.current = screenClient;
      screenTrackRef.current = screenTrack;
      isScreenSharingRef.current = true;

      // Screen client joins the same channel with an auto-assigned UID.
      await screenClient.join(appId, channel, token ?? null, 0);
      await screenClient.publish(screenTrack);

      const rawUid = screenClient.uid;
      if (rawUid !== undefined) {
        const screenUid: UID = rawUid; // narrowed — safe to use inside the callback
        // Track the screen UID locally so the camera grid can filter it out.
        setScreenShareUids((prev) => new Set([...prev, screenUid]));
      }

      // The browser "Stop sharing" button fires track-ended.
      // stopScreenShare uses only refs, so the closure is always fresh.
      screenTrack.on('track-ended', () => stopScreenShare());

      setLocalScreenTrack(screenTrack);
      setIsScreenSharing(true);
    } catch (err) {
      // Clean up the track we already created before re-throwing.
      screenTrack.stop();
      screenTrack.close();
      screenTrackRef.current = null;
      isScreenSharingRef.current = false;
      if (screenClientRef.current) {
        await screenClientRef.current.leave().catch(() => {});
        screenClientRef.current = null;
      }
      throw err;
    }
  }, [appId, channel, token, stopScreenShare]);

  // ── Main call join / leave ──────────────────────────────────────────────────
  const join = useCallback(async () => {
    if (callState === 'joining' || callState === 'connected') return;

    try {
      setCallState('joining');
      setError(null);

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      client.on('user-published', handleUserPublished);
      client.on('user-unpublished', handleUserUnpublished);
      client.on('user-left', handleUserLeft);

      await client.join(appId, channel, token ?? null, uid);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localAudioRef.current = audioTrack;
      localVideoRef.current = videoTrack;

      await client.publish([audioTrack, videoTrack]);

      setLocalVideoTrack(videoTrack);
      setCallState('connected');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join call';
      setError(message);
      setCallState('error');
    }
  }, [appId, channel, token, uid, callState, handleUserPublished, handleUserUnpublished, handleUserLeft]);

  const leave = useCallback(async () => {
    if (isScreenSharingRef.current) await stopScreenShare();

    localAudioRef.current?.stop();
    localAudioRef.current?.close();
    localVideoRef.current?.stop();
    localVideoRef.current?.close();
    localAudioRef.current = null;
    localVideoRef.current = null;

    if (clientRef.current) {
      clientRef.current.off('user-published', handleUserPublished);
      clientRef.current.off('user-unpublished', handleUserUnpublished);
      clientRef.current.off('user-left', handleUserLeft);
      await clientRef.current.leave();
      clientRef.current = null;
    }

    setLocalVideoTrack(null);
    setLocalScreenTrack(null);
    setRemoteParticipants([]);
    setScreenShareUids(new Set());
    setIsMuted(false);
    setIsCameraOff(false);
    setIsScreenSharing(false);
    setCallState('idle');
  }, [handleUserPublished, handleUserUnpublished, handleUserLeft, stopScreenShare]);

  const toggleMute = useCallback(async () => {
    if (!localAudioRef.current) return;
    const next = !isMuted;
    await localAudioRef.current.setMuted(next);
    setIsMuted(next);
  }, [isMuted]);

  const toggleCamera = useCallback(async () => {
    if (!localVideoRef.current) return;
    const next = !isCameraOff;
    await localVideoRef.current.setMuted(next);
    setIsCameraOff(next);
  }, [isCameraOff]);

  // ── Hard cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      screenTrackRef.current?.stop();
      screenTrackRef.current?.close();
      screenClientRef.current?.leave().catch(() => {});
      localAudioRef.current?.stop();
      localAudioRef.current?.close();
      localVideoRef.current?.stop();
      localVideoRef.current?.close();
      clientRef.current?.leave().catch(() => {});
    };
  }, []);

  return {
    callState,
    error,
    localVideoTrack,
    localScreenTrack,
    remoteParticipants,
    isMuted,
    isCameraOff,
    isScreenSharing,
    screenShareUids,
    join,
    leave,
    toggleMute,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
  };
}
