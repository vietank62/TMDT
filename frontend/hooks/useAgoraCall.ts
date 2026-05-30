'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng'
import type { SessionToken } from '@/types'

export interface AgoraCallState {
  joined: boolean
  connecting: boolean
  error: string | null
  micOn: boolean
  camOn: boolean
  hasRemoteUser: boolean
  localVideoRef: React.RefObject<HTMLDivElement | null>
  remoteVideoRef: React.RefObject<HTMLDivElement | null>
  toggleMic: () => Promise<void>
  toggleCam: () => Promise<void>
  leave: () => Promise<void>
}

export function useAgoraCall(session: SessionToken | null): AgoraCallState {
  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const micRef = useRef<IMicrophoneAudioTrack | null>(null)
  const camRef = useRef<ICameraVideoTrack | null>(null)
  const localVideoRef = useRef<HTMLDivElement | null>(null)
  const remoteVideoRef = useRef<HTMLDivElement | null>(null)

  const [joined, setJoined] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [hasRemoteUser, setHasRemoteUser] = useState(false)

  // Stable channel string drives the effect — avoids re-joining on object identity changes.
  const channel = session?.channel ?? null

  useEffect(() => {
    if (!channel || !session) return

    const s = session
    let active = true

    async function join() {
      setConnecting(true)
      setError(null)

      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
        AgoraRTC.setLogLevel(4) // suppress verbose logs

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
        clientRef.current = client

        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType)
          if (mediaType === 'video' && remoteVideoRef.current) {
            user.videoTrack?.play(remoteVideoRef.current)
          }
          if (mediaType === 'audio') {
            user.audioTrack?.play()
          }
          if (active) setHasRemoteUser(true)
        })

        client.on('user-unpublished', () => {
          if (active) setHasRemoteUser(client.remoteUsers.length > 0)
        })

        client.on('user-left', () => {
          if (active) setHasRemoteUser(client.remoteUsers.length > 0)
        })

        await client.join(
          s.appId,
          s.channel,
          s.token || null,
          s.uid,
        )

        // Subscribe to any users already in the channel.
        for (const user of client.remoteUsers) {
          if (user.hasVideo) {
            await client.subscribe(user, 'video')
            if (remoteVideoRef.current) user.videoTrack?.play(remoteVideoRef.current)
          }
          if (user.hasAudio) {
            await client.subscribe(user, 'audio')
            user.audioTrack?.play()
          }
        }
        if (active && client.remoteUsers.length > 0) setHasRemoteUser(true)

        const [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks()
        micRef.current = mic
        camRef.current = cam

        if (localVideoRef.current) cam.play(localVideoRef.current)
        await client.publish([mic, cam])

        if (active) {
          setJoined(true)
          setConnecting(false)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Không thể kết nối phòng tư vấn')
          setConnecting(false)
        }
      }
    }

    join()

    return () => {
      active = false
      micRef.current?.close()
      camRef.current?.close()
      clientRef.current?.leave().catch(() => {})
      micRef.current = null
      camRef.current = null
      clientRef.current = null
      setJoined(false)
      setHasRemoteUser(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel])

  const toggleMic = useCallback(async () => {
    if (!micRef.current) return
    const next = !micOn
    await micRef.current.setEnabled(next)
    setMicOn(next)
  }, [micOn])

  const toggleCam = useCallback(async () => {
    if (!camRef.current) return
    const next = !camOn
    await camRef.current.setEnabled(next)
    setCamOn(next)
  }, [camOn])

  const leave = useCallback(async () => {
    micRef.current?.close()
    camRef.current?.close()
    await clientRef.current?.leave().catch(() => {})
    micRef.current = null
    camRef.current = null
    clientRef.current = null
    setJoined(false)
    setHasRemoteUser(false)
  }, [])

  return {
    joined,
    connecting,
    error,
    micOn,
    camOn,
    hasRemoteUser,
    localVideoRef,
    remoteVideoRef,
    toggleMic,
    toggleCam,
    leave,
  }
}
