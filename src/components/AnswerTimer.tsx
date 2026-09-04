import { useEffect, useRef, useState } from 'react'

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export function AnswerTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startedAtRef = useRef(0)
  const accumulatedRef = useRef(0)

  useEffect(() => {
    if (!isRunning) return

    startedAtRef.current = Date.now()
    const update = () => {
      const currentSeconds = Math.floor((accumulatedRef.current + Date.now() - startedAtRef.current) / 1000)
      setElapsedSeconds(currentSeconds)
    }
    update()
    const timerId = window.setInterval(update, 250)
    return () => window.clearInterval(timerId)
  }, [isRunning])

  const pause = () => {
    accumulatedRef.current += Date.now() - startedAtRef.current
    setElapsedSeconds(Math.floor(accumulatedRef.current / 1000))
    setIsRunning(false)
  }

  const reset = () => {
    accumulatedRef.current = 0
    startedAtRef.current = Date.now()
    setElapsedSeconds(0)
  }

  return (
    <section className={`answer-timer ${isRunning ? 'running' : ''}`} aria-label="총 답변 시간">
      <div className="timer-heading">
        <span className="timer-status" aria-hidden="true" />
        <span>총 답변 시간</span>
      </div>
      <time dateTime={`PT${elapsedSeconds}S`}>{formatTime(elapsedSeconds)}</time>
      <div className="timer-actions">
        {isRunning ? (
          <button type="button" onClick={pause}>일시정지</button>
        ) : (
          <button type="button" className="timer-primary" onClick={() => setIsRunning(true)}>{elapsedSeconds ? '계속' : '시작'}</button>
        )}
        <button type="button" onClick={reset} disabled={!elapsedSeconds}>초기화</button>
      </div>
    </section>
  )
}
