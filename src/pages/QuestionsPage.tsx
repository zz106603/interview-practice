import { useState } from 'react'
import { DataTools } from '../components/DataTools'
import { QuestionForm } from '../components/QuestionForm'
import { useQuestions } from '../context/QuestionsContext'
import type { Question, QuestionInput } from '../types/question'

export function QuestionsPage() {
  const { questions, folders, activeFolderId, setActiveFolderId, addFolder, renameFolder, deleteFolder, addQuestion, updateQuestion, deleteQuestion, deleteAllQuestions, moveQuestion } = useQuestions()
  const [editing, setEditing] = useState<Question | null>(null)
  const visibleQuestions = questions.filter((item) => item.folderId === activeFolderId)

  const createFolder = () => {
    const name = window.prompt('새 폴더 이름을 입력하세요.')
    if (name?.trim()) addFolder(name)
  }

  const editFolderName = () => {
    const folder = folders.find((item) => item.id === activeFolderId)
    if (!folder) return
    const name = window.prompt('폴더 이름을 수정하세요.', folder.name)
    if (name?.trim()) renameFolder(folder.id, name)
  }

  const removeFolder = () => {
    const folder = folders.find((item) => item.id === activeFolderId)
    if (!folder || folder.id === 'default') return
    if (window.confirm(`“${folder.name}” 폴더를 삭제할까요?\n폴더 안의 질문은 기본 폴더로 이동합니다.`)) deleteFolder(folder.id)
  }

  const handleSubmit = (input: QuestionInput) => {
    if (editing) {
      updateQuestion(editing.id, input)
      setEditing(null)
    } else addQuestion(input)
  }

  const handleDelete = (item: Question) => {
    if (window.confirm(`“${item.question}” 질문을 삭제할까요?`)) {
      deleteQuestion(item.id)
      if (editing?.id === item.id) setEditing(null)
    }
  }

  const handleDeleteAll = () => {
    if (window.confirm(`등록된 질문 ${questions.length}개와 모든 꼬리질문을 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`)) {
      deleteAllQuestions()
      setEditing(null)
    }
  }

  return (
    <main className="page management-page">
      <section className="panel form-panel">
        <div className="section-heading">
          <div><p className="eyebrow">QUESTION BANK</p><h2>{editing ? '질문 수정' : '새 질문 등록'}</h2></div>
        </div>
        <QuestionForm editing={editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />
      </section>

      <section className="panel list-panel">
        <div className="folder-toolbar">
          <div className="folder-tabs">
            {folders.map((folder) => <button key={folder.id} className={folder.id === activeFolderId ? 'active' : ''} onClick={() => setActiveFolderId(folder.id)}>{folder.name}<span>{questions.filter((item) => item.folderId === folder.id).length}</span></button>)}
          </div>
          <div className="folder-actions">
            <button type="button" onClick={createFolder}>+ 폴더</button>
            <button type="button" onClick={editFolderName}>이름 변경</button>
            <button type="button" className="danger" disabled={activeFolderId === 'default'} onClick={removeFolder}>폴더 삭제</button>
          </div>
        </div>
        <div className="section-heading list-heading">
          <div><p className="eyebrow">MY QUESTIONS</p><h2>질문 목록 <span className="count">{questions.length}</span></h2></div>
          <div className="list-tools">
            <DataTools />
            <button className="button delete-all-button" type="button" onClick={handleDeleteAll} disabled={!questions.length}>전체 삭제</button>
          </div>
        </div>
        {visibleQuestions.length === 0 ? (
          <div className="empty-state"><p>등록된 질문이 없습니다.</p><span>왼쪽 폼에서 첫 질문을 추가해보세요.</span></div>
        ) : (
          <div className="question-list">
            {visibleQuestions.map((item, index) => (
              <article className="question-item" key={item.id}>
                <span className="item-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="item-content">
                  <div className="item-meta"><span>{item.category}</span><span>꼬리질문 {item.followUps.length}개</span></div>
                  <h3>{item.question}</h3><p>{item.answer}</p>
                </div>
                <div className="item-actions">
                  <div className="order-actions" aria-label="질문 순서 변경">
                    <button type="button" className="icon-button" aria-label={`${index + 1}번 질문을 위로 이동`} title="위로 이동" disabled={index === 0} onClick={() => moveQuestion(item.id, -1)}>↑</button>
                    <button type="button" className="icon-button" aria-label={`${index + 1}번 질문을 아래로 이동`} title="아래로 이동" disabled={index === visibleQuestions.length - 1} onClick={() => moveQuestion(item.id, 1)}>↓</button>
                  </div>
                  <button type="button" className="text-button" onClick={() => setEditing(item)}>수정</button>
                  <button type="button" className="text-button danger" onClick={() => handleDelete(item)}>삭제</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
