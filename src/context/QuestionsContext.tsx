import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Question, QuestionFolder, QuestionInput } from '../types/question'
import { createQuestion, defaultFolder, loadFolders, loadQuestions, saveFolders, saveQuestions } from '../utils/storage'

interface QuestionsContextValue {
  questions: Question[]
  folders: QuestionFolder[]
  activeFolderId: string
  setActiveFolderId: (id: string) => void
  addFolder: (name: string) => void
  renameFolder: (id: string, name: string) => void
  deleteFolder: (id: string) => void
  addQuestion: (input: QuestionInput) => void
  updateQuestion: (id: string, input: QuestionInput) => void
  deleteQuestion: (id: string) => void
  deleteAllQuestions: () => void
  moveQuestion: (id: string, offset: -1 | 1) => void
  importQuestions: (items: QuestionInput[]) => void
}

const QuestionsContext = createContext<QuestionsContextValue | null>(null)

export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>(loadQuestions)
  const [folders, setFolders] = useState<QuestionFolder[]>(loadFolders)
  const [activeFolderId, setActiveFolderId] = useState(defaultFolder.id)

  useEffect(() => saveQuestions(questions), [questions])
  useEffect(() => saveFolders(folders), [folders])

  const value = useMemo<QuestionsContextValue>(() => ({
    questions,
    folders,
    activeFolderId,
    setActiveFolderId,
    addFolder: (name) => {
      const trimmed = name.trim()
      if (!trimmed) return
      const folder = { id: crypto.randomUUID(), name: trimmed }
      setFolders((current) => [...current, folder])
      setActiveFolderId(folder.id)
    },
    renameFolder: (id, name) => setFolders((current) => current.map((folder) => folder.id === id ? { ...folder, name: name.trim() || folder.name } : folder)),
    deleteFolder: (id) => {
      if (id === defaultFolder.id) return
      setQuestions((current) => current.map((item) => item.folderId === id ? { ...item, folderId: defaultFolder.id } : item))
      setFolders((current) => current.filter((folder) => folder.id !== id))
      setActiveFolderId(defaultFolder.id)
    },
    addQuestion: (input) => setQuestions((current) => [...current, createQuestion(input)]),
    updateQuestion: (id, input) => setQuestions((current) => current.map((item) => item.id === id
      ? { ...item, folderId: input.folderId, category: input.category.trim() || '미분류', question: input.question.trim(), answer: input.answer.trim(), followUps: input.followUps, updatedAt: new Date().toISOString() }
      : item)),
    deleteQuestion: (id) => setQuestions((current) => current.filter((item) => item.id !== id)),
    deleteAllQuestions: () => setQuestions([]),
    moveQuestion: (id, offset) => setQuestions((current) => {
      const from = current.findIndex((item) => item.id === id)
      if (from < 0) return current
      const siblings = current.map((item, index) => ({ item, index })).filter(({ item }) => item.folderId === current[from].folderId)
      const siblingPosition = siblings.findIndex(({ item }) => item.id === id)
      const target = siblings[siblingPosition + offset]
      if (!target) return current
      const next = [...current]
      ;[next[from], next[target.index]] = [next[target.index], next[from]]
      return next
    }),
    importQuestions: (items) => setQuestions((current) => [...current, ...items.map(createQuestion)]),
  }), [questions, folders, activeFolderId])

  return <QuestionsContext.Provider value={value}>{children}</QuestionsContext.Provider>
}

export const useQuestions = () => {
  const context = useContext(QuestionsContext)
  if (!context) throw new Error('useQuestions must be used within QuestionsProvider')
  return context
}
