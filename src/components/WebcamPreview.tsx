import { useEffect, useRef, useState } from 'react'

export function WebcamPreview() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mountedRef = useRef(true)
  const [isStarting, setIsStarting] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState('')

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setIsActive(false)
    setIsStarting(false)
  }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = async () => {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('이 브라우저에서는 카메라를 사용할 수 없습니다.')
      return
    }

    setIsStarting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setIsActive(true)
    } catch (reason) {
      const denied = reason instanceof DOMException && reason.name === 'NotAllowedError'
      setError(denied ? '카메라 권한이 허용되지 않았습니다.' : '사용 가능한 카메라를 찾을 수 없습니다.')
    } finally {
      if (mountedRef.current) setIsStarting(false)
    }
  }

  return (
    <section className={`webcam-card ${isActive ? 'active' : ''}`} aria-label="내 카메라 미리보기">
      <div className="webcam-viewport">
        <video ref={videoRef} autoPlay muted playsInline />
        {!isActive && (
          <div className="webcam-placeholder">
            <span aria-hidden="true">●</span>
            <p>표정과 시선을 확인해보세요</p>
          </div>
        )}
      </div>
      <div className="webcam-controls">
        <div>
          <strong>내 화면</strong>
          {error && <p role="status">{error}</p>}
        </div>
        {isActive ? (
          <button type="button" onClick={stopCamera}>카메라 끄기</button>
        ) : (
          <button type="button" onClick={startCamera} disabled={isStarting}>{isStarting ? '연결 중…' : '카메라 켜기'}</button>
        )}
      </div>
    </section>
  )
}
