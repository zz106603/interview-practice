import { useEffect, useMemo, useState } from 'react'
import { useQuestions } from '../context/QuestionsContext'
import { WebcamPreview } from '../components/WebcamPreview'
import { QuestionForm } from '../components/QuestionForm'
import type { PracticeMode } from '../types/question'
import { shuffle } from '../utils/shuffle'

interface PracticeStep {
  parentId: string
  question: string
  answer: string
  category: string
  mainPosition: number
  followUpPosition: number | null
  followUpCount: number
}

export function PracticePage() {
  const { questions, folders, activeFolderId, setActiveFolderId, updateQuestion } = useQuestions()
  const practiceQuestions = useMemo(() => questions.filter((item) => item.folderId === activeFolderId), [questions, activeFolderId])
  const [mode, setMode] = useState<PracticeMode>('sequential')
  const [order, setOrder] = useState<string[]>(() => practiceQuestions.map(({ id }) => id))
  const [stepIndex, setStepIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const ids = practiceQuestions.map(({ id }) => id)
    setOrder((current) => {
      const valid = current.filter((id) => ids.includes(id))
      const additions = ids.filter((id) => !valid.includes(id))
      return mode === 'random' ? [...valid, ...shuffle(additions)] : ids
    })
    setStepIndex(0)
    setShowAnswer(false)
  }, [practiceQuestions, mode])

  const steps = useMemo<PracticeStep[]>(() => order.flatMap((id, mainPosition) => {
    const parent = practiceQuestions.find((item) => item.id === id)
    if (!parent) return []
    return [
      { parentId: parent.id, question: parent.question, answer: parent.answer, category: parent.category, mainPosition, followUpPosition: null, followUpCount: parent.followUps.length },
      ...parent.followUps.map((item, followUpPosition) => ({
        parentId: parent.id, question: item.question, answer: item.answer, category: parent.category, mainPosition, followUpPosition, followUpCount: parent.followUps.length,
      })),
    ]
  }), [order, practiceQuestions])

  useEffect(() => setStepIndex((current) => Math.min(current, Math.max(steps.length - 1, 0))), [steps.length])

  const current = steps[stepIndex]
  const currentParent = questions.find((item) => item.id === current?.parentId)
  const changeMode = (nextMode: PracticeMode) => {
    setMode(nextMode)
    setOrder(nextMode === 'random' ? shuffle(practiceQuestions.map(({ id }) => id)) : practiceQuestions.map(({ id }) => id))
    setStepIndex(0)
    setShowAnswer(false)
  }

  const move = (offset: number) => {
    setStepIndex((currentIndex) => currentIndex + offset)
    setShowAnswer(false)
  }

  if (!practiceQuestions.length || !current) return (
    <main className="page practice-page">
      <div className="practice-folder-picker"><label>연습 폴더<select value={activeFolderId} onChange={(event) => setActiveFolderId(event.target.value)}>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label></div>
      <div className="practice-empty"><p className="eyebrow">PRACTICE</p><h2>이 폴더에 질문이 없습니다</h2><p>질문 관리에서 질문을 추가하거나 다른 폴더를 선택해주세요.</p></div>
    </main>
  )

  const isFollowUp = current.followUpPosition !== null
  const isLastStep = stepIndex === steps.length - 1

  return (
    <main className="page practice-page">
      <div className="practice-toolbar">
        <div className="practice-toolbar-left">
          <label className="practice-folder-select">폴더<select value={activeFolderId} onChange={(event) => setActiveFolderId(event.target.value)}>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label>
          <div className="segmented" aria-label="연습 순서">
          <button className={mode === 'sequential' ? 'active' : ''} onClick={() => changeMode('sequential')}>순차</button>
          <button className={mode === 'random' ? 'active' : ''} onClick={() => changeMode('random')}>랜덤</button>
          </div>
        </div>
        <strong className="progress">{current.mainPosition + 1} <span>/ {order.length}</span></strong>
      </div>

      <div className="interview-stage">
        <WebcamPreview />
        <div className="interviewer-panel" aria-hidden="true">
          <img
            src="/assets/interview-panel.png"
            alt=""
            onError={(event) => { event.currentTarget.parentElement?.setAttribute('hidden', '') }}
          />
        </div>
      </div>

      <article className={`practice-card ${isFollowUp ? 'follow-up-card' : ''}`}>
        <div className="card-meta">
          <p className="card-label">{isFollowUp ? `꼬리질문 ${current.followUpPosition! + 1} / ${current.followUpCount}` : '메인 질문'}</p>
          <div className="card-meta-actions">
            <span>{current.category}</span>
            <button type="button" onClick={() => setIsEditing(true)}>질문 수정</button>
          </div>
        </div>
        <h2>{current.question}</h2>
        <div className={`answer-area ${showAnswer ? 'revealed' : ''}`}>
          {showAnswer ? <><p className="answer-label">준비한 답변</p><p className={!current.answer ? 'empty-answer' : ''}>{current.answer || '아직 준비된 답변이 없습니다.'}</p></> : (
            <button className="reveal-button" type="button" onClick={() => setShowAnswer(true)}>답변 보기</button>
          )}
        </div>
      </article>

      <div className="practice-actions">
        <button className="button secondary navigation-button" type="button" disabled={stepIndex === 0} onClick={() => move(-1)}>← 이전 질문</button>
        {showAnswer && <button className="button subtle" type="button" onClick={() => setShowAnswer(false)}>답변 숨기기</button>}
        <button className="button primary navigation-button" type="button" disabled={isLastStep} onClick={() => move(1)}>{isLastStep ? '연습 완료' : '다음 질문 →'}</button>
      </div>

      {isEditing && currentParent && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsEditing(false)
        }}>
          <section className="edit-modal" role="dialog" aria-modal="true" aria-labelledby="practice-edit-title">
            <div className="edit-modal-header">
              <div>
                <p className="eyebrow">QUICK EDIT</p>
                <h2 id="practice-edit-title">질문 내용 수정</h2>
              </div>
              <button type="button" className="modal-close" aria-label="닫기" onClick={() => setIsEditing(false)}>×</button>
            </div>
            <p className="edit-modal-description">현재 메인 질문과 연결된 꼬리질문을 함께 수정합니다.</p>
            <QuestionForm
              editing={currentParent}
              onCancel={() => setIsEditing(false)}
              onSubmit={(input) => {
                updateQuestion(currentParent.id, input)
                setIsEditing(false)
                setShowAnswer(false)
              }}
            />
          </section>
        </div>
      )}
    </main>
  )
}
