import { useState } from 'react'
import { QuestionsProvider, useQuestions } from './context/QuestionsContext'
import { PracticePage } from './pages/PracticePage'
import { QuestionsPage } from './pages/QuestionsPage'

type Page = 'practice' | 'questions'

function AppContent() {
  const [page, setPage] = useState<Page>('practice')
  const { questions } = useQuestions()

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" onClick={() => setPage('practice')} aria-label="연습 화면으로 이동">
          <span className="brand-mark">IF</span>
          <span><strong>Interview</strong><small>Flashcards</small></span>
        </button>
        <nav aria-label="주요 메뉴">
          <button className={page === 'practice' ? 'active' : ''} onClick={() => setPage('practice')}>연습하기</button>
          <button className={page === 'questions' ? 'active' : ''} onClick={() => setPage('questions')}>질문 관리 <span>{questions.length}</span></button>
        </nav>
      </header>
      {page === 'practice' ? <PracticePage /> : <QuestionsPage />}
    </div>
  )
}

export default function App() {
  return <QuestionsProvider><AppContent /></QuestionsProvider>
}
