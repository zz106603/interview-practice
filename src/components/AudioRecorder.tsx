import { useEffect, useRef, useState } from 'react'

export function AudioRecorder({ sessionKey }: { sessionKey: string }) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const discardRef = useRef(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')
  const [error, setError] = useState('')

  const releaseStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  const clearRecording = () => {
    setAudioUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return ''
    })
  }

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }

  useEffect(() => {
    return () => {
      discardRef.current = true
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      releaseStream()
    }
  }, [])

  useEffect(() => {
    discardRef.current = true
    stopRecording()
    clearRecording()
    setError('')
  }, [sessionKey])

  const startRecording = async () => {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('이 브라우저에서는 음성 녹음을 사용할 수 없습니다.')
      return
    }
    try {
      clearRecording()
      discardRef.current = false
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        if (blob.size && !discardRef.current) setAudioUrl(URL.createObjectURL(blob))
        releaseStream()
        setIsRecording(false)
      }
      recorder.start()
      setIsRecording(true)
    } catch (reason) {
      releaseStream()
      const denied = reason instanceof DOMException && reason.name === 'NotAllowedError'
      setError(denied ? '마이크 권한이 허용되지 않았습니다.' : '사용 가능한 마이크를 찾을 수 없습니다.')
    }
  }

  return (
    <section className="audio-recorder" aria-label="답변 녹음">
      <div className="recorder-info">
        <span className={isRecording ? 'recording-dot active' : 'recording-dot'} aria-hidden="true" />
        <div><strong>{isRecording ? '답변 녹음 중' : '내 답변 녹음'}</strong><p>{error || (audioUrl ? '녹음한 답변을 확인해보세요.' : '말하는 속도와 전달력을 들어보세요.')}</p></div>
      </div>
      {audioUrl && <audio controls src={audioUrl}>오디오 재생을 지원하지 않는 브라우저입니다.</audio>}
      <div className="recorder-actions">
        {isRecording ? <button className="button recording-stop" type="button" onClick={stopRecording}>■ 녹음 중지</button> : <button className="button recording-start" type="button" onClick={startRecording}>● {audioUrl ? '다시 녹음' : '녹음 시작'}</button>}
        {audioUrl && !isRecording && <button className="button secondary" type="button" onClick={clearRecording}>삭제</button>}
      </div>
    </section>
  )
}
