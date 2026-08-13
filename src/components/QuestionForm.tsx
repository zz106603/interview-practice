import { useEffect, useState, type FormEvent } from 'react'
import type { FollowUp, Question, QuestionInput } from '../types/question'
import { useQuestions } from '../context/QuestionsContext'

interface Props {
  editing?: Question | null
  onSubmit: (input: QuestionInput) => void
  onCancel?: () => void
}

const emptyFollowUp = (): FollowUp => ({ id: crypto.randomUUID(), question: '', answer: '' })

export function QuestionForm({ editing, onSubmit, onCancel }: Props) {
  const { folders, activeFolderId } = useQuestions()
  const [folderId, setFolderId] = useState(activeFolderId)
  const [category, setCategory] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [followUps, setFollowUps] = useState<FollowUp[]>([])

  useEffect(() => {
    setFolderId(editing?.folderId ?? activeFolderId)
    setCategory(editing?.category ?? '')
    setQuestion(editing?.question ?? '')
    setAnswer(editing?.answer ?? '')
    setFollowUps(editing?.followUps.map((item) => ({ ...item })) ?? [])
  }, [editing, activeFolderId])

  const updateFollowUp = (id: string, field: 'question' | 'answer', value: string) => {
    setFollowUps((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!question.trim() || !answer.trim() || followUps.some((item) => !item.question.trim())) return
    onSubmit({ folderId, category, question, answer, followUps: followUps.map((item) => ({ ...item, question: item.question.trim(), answer: item.answer.trim() })) })
    if (!editing) {
      setCategory('')
      setQuestion('')
      setAnswer('')
      setFollowUps([])
    }
  }

  return (
    <form className="question-form" onSubmit={handleSubmit}>
      <label>
        폴더
        <select value={folderId} onChange={(event) => setFolderId(event.target.value)}>
          {folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
        </select>
      </label>
      <label>
        카테고리
        <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="예: 기술, 경험, 공통" />
      </label>
      <label>
        메인 질문
        <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={3} placeholder="면접 질문을 입력하세요" required />
      </label>
      <label>
        준비한 답변
        <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={5} placeholder="준비한 답변을 입력하세요" required />
      </label>

      <div className="follow-up-editor">
        <div className="follow-up-heading">
          <strong>꼬리질문 <span>{followUps.length}</span></strong>
          <button className="text-button add-follow-up" type="button" onClick={() => setFollowUps((current) => [...current, emptyFollowUp()])}>+ 추가</button>
        </div>
        {followUps.map((item, index) => (
          <fieldset key={item.id} className="follow-up-fields">
            <legend>꼬리질문 {index + 1}</legend>
            <button className="text-button danger remove-follow-up" type="button" onClick={() => setFollowUps((current) => current.filter(({ id }) => id !== item.id))}>삭제</button>
            <label>
              질문
              <textarea value={item.question} onChange={(event) => updateFollowUp(item.id, 'question', event.target.value)} rows={2} required />
            </label>
            <label>
              답변
              <textarea value={item.answer} onChange={(event) => updateFollowUp(item.id, 'answer', event.target.value)} rows={3} placeholder="아직 준비하지 않았다면 비워둘 수 있습니다" />
            </label>
          </fieldset>
        ))}
      </div>

      <div className="form-actions">
        {editing && <button type="button" className="button secondary" onClick={onCancel}>취소</button>}
        <button className="button primary" type="submit">{editing ? '수정 완료' : '질문 추가'}</button>
      </div>
    </form>
  )
}
