import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  AlertCircle,
  Loader2,
  ScreenShare,
  ScreenShareOff,
  Monitor,
} from 'lucide-react';
import { useAgora, type RemoteParticipant } from '../hooks/useAgora';
import type { ICameraVideoTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';

const APP_ID = import.meta.env.VITE_AGORA_APP_ID as string;

// ── VideoPlayer ──────────────────────────────────────────────────────────────
// Mounts any Agora video track (local camera, local screen, remote camera/screen)
// into a DOM div using the SDK's built-in renderer. Stops the renderer on cleanup.
function VideoPlayer({
  track,
  className = '',
  mirror = false,
}: Readonly<{
  track: ICameraVideoTrack | ILocalVideoTrack | NonNullable<RemoteParticipant['videoTrack']>;
  className?: string;
  mirror?: boolean;
}>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!track || !containerRef.current) return;
    track.play(containerRef.current);
    return () => {
      track.stop();
    };
  }, [track]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : undefined}
    />
  );
}

// ── RemoteParticipantTile ─────────────────────────────────────────────────────
// Camera feed card used in both the normal grid and the presentation-mode strip.
function RemoteParticipantTile({
  participant,
  compact = false,
}: Readonly<{
  participant: RemoteParticipant;
  compact?: boolean;
}>) {
  return (
    <div
      className={`relative bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 ${
        compact ? 'w-40 h-24 sm:w-48 sm:h-28' : 'aspect-video'
      }`}
    >
      {participant.hasVideo && participant.videoTrack ? (
        <VideoPlayer track={participant.videoTrack} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div
            className={`rounded-full bg-gray-700 flex items-center justify-center ${
              compact ? 'w-10 h-10' : 'w-16 h-16'
            }`}
          >
            <Users size={compact ? 18 : 28} />
          </div>
          {!compact && <span className="text-sm">Camera tắt</span>}
        </div>
      )}

      {!participant.hasAudio && (
        <div className="absolute top-2 left-2 p-1 bg-red-500/80 rounded-lg">
          <MicOff size={12} className="text-white" />
        </div>
      )}

      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/50 rounded text-xs text-white truncate max-w-[80%]">
        Người dùng {String(participant.uid)}
      </div>
    </div>
  );
}

// ── ScreenStage ───────────────────────────────────────────────────────────────
// Full-width main stage that shows a screen-share track (local or remote).
function ScreenStage({
  localScreenTrack,
  screenParticipant,
  isLocalSharing,
}: Readonly<{
  localScreenTrack: ILocalVideoTrack | null;
  screenParticipant: RemoteParticipant | undefined;
  isLocalSharing: boolean;
}>) {
  const track = isLocalSharing
    ? localScreenTrack
    : screenParticipant?.videoTrack ?? null;

  return (
    <div className="relative flex-grow bg-gray-900 rounded-2xl overflow-hidden min-h-0">
      {track ? (
        <VideoPlayer track={track} className="w-full h-full" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col gap-3">
          <Monitor size={48} />
          <span className="text-sm">Đang tải màn hình...</span>
        </div>
      )}

      {/* "Screen sharing" badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)]/90 backdrop-blur-sm rounded-xl text-white text-xs font-semibold shadow-lg">
        <ScreenShare size={14} />
        <span>{isLocalSharing ? 'Bạn đang chia sẻ màn hình' : 'Đang chia sẻ màn hình'}</span>
      </div>
    </div>
  );
}

// ── NormalGrid ────────────────────────────────────────────────────────────────
// Remote camera grid rendered when no one is sharing their screen.
// Extracted to keep VideoCall's cognitive complexity within bounds.
function NormalGrid({ participants }: Readonly<{ participants: RemoteParticipant[] }>) {
  if (participants.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center text-gray-500 space-y-3">
          <Users size={48} className="mx-auto" />
          <p className="text-lg">Chờ người khác tham gia...</p>
        </div>
      </div>
    );
  }

  let gridCols: string;
  if (participants.length === 1) {
    gridCols = 'grid-cols-1';
  } else if (participants.length <= 4) {
    gridCols = 'grid-cols-1 sm:grid-cols-2';
  } else {
    gridCols = 'grid-cols-2 sm:grid-cols-3';
  }

  return (
    <div className={`grid gap-4 flex-grow ${gridCols}`}>
      {participants.map((p) => (
        <RemoteParticipantTile key={String(p.uid)} participant={p} />
      ))}
    </div>
  );
}

// ── VideoCall (page) ──────────────────────────────────────────────────────────
export default function VideoCall() {
  const { channelName } = useParams<{ channelName: string }>();
  const navigate = useNavigate();

  const channel = channelName ?? 'default';
  const {
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
  } = useAgora({ appId: APP_ID, channel });

  // Auto-join once on mount
  useEffect(() => {
    if (APP_ID) join();
    // join is stable across renders; the empty-dep lint suppression is intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLeave = async () => {
    await leave();
    navigate('/dashboard');
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  // Split remote participants: screen sharers go to main stage, cameras go to grid/strip
  const cameraParticipants = remoteParticipants.filter((p) => !screenShareUids.has(p.uid));

  const screenParticipant = remoteParticipants.find(
    (p) => screenShareUids.has(p.uid) && !isScreenSharing
  );

  // Presentation mode = someone (local or remote) is sharing their screen
  const isPresenting = isScreenSharing || screenShareUids.size > 0;
  const totalParticipants = remoteParticipants.length + 1;

  // ── Missing App ID guard ────────────────────────────────────────────────────
  if (!APP_ID) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center text-white space-y-4 max-w-md">
          <AlertCircle size={48} className="mx-auto text-red-400" />
          <h2 className="text-xl font-bold">Chưa cấu hình Agora</h2>
          <p className="text-gray-400 text-sm">
            Vui lòng thêm{' '}
            <code className="bg-gray-800 px-1 rounded">VITE_AGORA_APP_ID</code> vào file{' '}
            <code className="bg-gray-800 px-1 rounded">.env</code>.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-[var(--accent)] rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Page ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col select-none">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white font-semibold text-sm">
            Phòng:{' '}
            <span className="text-[var(--accent)]">{channel}</span>
          </span>
          {isPresenting && (
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold rounded-full border border-[var(--accent)]/30">
              <ScreenShare size={12} />
              Đang chia sẻ màn hình
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Users size={16} />
          <span>{totalParticipants} người tham gia</span>
        </div>
      </div>

      {/* ── Main video area ── */}
      <div className="flex-grow relative p-4 overflow-hidden flex flex-col gap-4 min-h-0">

        {/* Joining spinner */}
        {callState === 'joining' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-white space-y-4">
              <Loader2 size={48} className="mx-auto animate-spin text-[var(--accent)]" />
              <p className="text-lg font-semibold">Đang kết nối...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {callState === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
            <div className="text-center text-white space-y-4 max-w-sm">
              <AlertCircle size={48} className="mx-auto text-red-400" />
              <h2 className="text-xl font-bold">Không thể kết nối</h2>
              <p className="text-gray-400 text-sm">{error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={join}
                  className="px-6 py-3 bg-[var(--accent)] rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-gray-700 rounded-xl font-bold hover:bg-gray-600 transition-colors"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {callState === 'connected' && (
            <motion.div
              key={isPresenting ? 'presenting' : 'grid'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4 h-full"
            >
              {/* ── Presentation mode ── */}
              {isPresenting && (
                <>
                  {/* Primary: screen share stage */}
                  <ScreenStage
                    localScreenTrack={localScreenTrack}
                    screenParticipant={screenParticipant}
                    isLocalSharing={isScreenSharing}
                  />

                  {/* Secondary: horizontal camera strip */}
                  {cameraParticipants.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-1 shrink-0">
                      {cameraParticipants.map((p) => (
                        <RemoteParticipantTile key={String(p.uid)} participant={p} compact />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ── Normal grid mode ── */}
              {!isPresenting && <NormalGrid participants={cameraParticipants} />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Local camera PiP (always visible when connected) ── */}
        {callState === 'connected' && (
          <div className="absolute bottom-6 right-6 w-40 sm:w-52 aspect-video rounded-2xl overflow-hidden border-2 border-gray-700 shadow-2xl bg-gray-900 z-20">
            {!isCameraOff && localVideoTrack ? (
              <VideoPlayer
                track={localVideoTrack}
                className="w-full h-full object-cover"
                mirror
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <VideoOff size={24} />
              </div>
            )}
            <div className="absolute bottom-1.5 left-2 text-xs text-white/70 font-medium">
              Bạn
            </div>
          </div>
        )}
      </div>

      {/* ── Controls toolbar ── */}
      <div className="px-6 py-5 border-t border-gray-800 shrink-0">
        <div className="flex items-center justify-center gap-3 sm:gap-4">

          {/* Mute */}
          <ControlButton
            onClick={toggleMute}
            disabled={callState !== 'connected'}
            active={isMuted}
            title={isMuted ? 'Bật mic' : 'Tắt mic'}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </ControlButton>

          {/* Camera */}
          <ControlButton
            onClick={toggleCamera}
            disabled={callState !== 'connected'}
            active={isCameraOff}
            title={isCameraOff ? 'Bật camera' : 'Tắt camera'}
          >
            {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
          </ControlButton>

          {/* Screen share */}
          <ControlButton
            onClick={handleScreenShare}
            disabled={callState !== 'connected'}
            active={isScreenSharing}
            activeColor="accent"
            title={isScreenSharing ? 'Dừng chia sẻ' : 'Chia sẻ màn hình'}
          >
            {isScreenSharing ? <ScreenShareOff size={22} /> : <ScreenShare size={22} />}
          </ControlButton>

          {/* End call */}
          <button
            onClick={handleLeave}
            title="Rời cuộc gọi"
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-lg shadow-red-600/30"
          >
            <PhoneOff size={26} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ControlButton ─────────────────────────────────────────────────────────────
// Shared button component for toolbar controls.
function ControlButton({
  onClick,
  disabled,
  active,
  activeColor = 'red',
  title,
  children,
}: Readonly<{
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  activeColor?: 'red' | 'accent';
  title?: string;
  children: React.ReactNode;
}>) {
  const activeClass =
    activeColor === 'accent'
      ? 'bg-[var(--accent)] hover:opacity-90 text-white'
      : 'bg-red-500 hover:bg-red-600 text-white';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
        active ? activeClass : 'bg-gray-700 hover:bg-gray-600 text-white'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}
