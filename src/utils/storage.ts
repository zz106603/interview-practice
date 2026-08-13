import { sampleQuestions } from '../data/sampleQuestions'
import type { FollowUp, Question, QuestionFolder, QuestionInput } from '../types/question'

const STORAGE_KEY = 'interview-flashcards.questions.v1'
const FOLDERS_KEY = 'interview-flashcards.folders.v1'
export const defaultFolder: QuestionFolder = { id: 'default', name: '기본 폴더' }

const isQuestionInput = (value: unknown): value is QuestionInput => {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  const validFollowUps = item.followUps === undefined || (Array.isArray(item.followUps) && item.followUps.every(isFollowUp))
  return typeof item.question === 'string' && item.question.trim().length > 0
    && typeof item.answer === 'string' && item.answer.trim().length > 0 && validFollowUps
}

const isFollowUp = (value: unknown): value is FollowUp => {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.question === 'string' && item.question.trim().length > 0
    && typeof item.answer === 'string'
}

const normalizeFollowUps = (items: FollowUp[] | undefined): FollowUp[] => (items ?? []).map((item) => ({
  id: typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID(),
  question: item.question.trim(),
  answer: item.answer.trim(),
}))

export const createQuestion = (input: QuestionInput): Question => {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    folderId: input.folderId || defaultFolder.id,
    category: input.category?.trim() || '미분류',
    question: input.question.trim(),
    answer: input.answer.trim(),
    followUps: normalizeFollowUps(input.followUps),
    createdAt: now,
    updatedAt: now,
  }
}

export const loadQuestions = (): Question[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return sampleQuestions

  try {
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.every(isQuestionInput)
      ? parsed.map((item) => {
          const candidate = item as Partial<Question>
          const fallback = createQuestion(item)
          return {
            ...fallback,
            id: typeof candidate.id === 'string' ? candidate.id : fallback.id,
            folderId: typeof candidate.folderId === 'string' ? candidate.folderId : defaultFolder.id,
            category: typeof candidate.category === 'string' && candidate.category.trim() ? candidate.category.trim() : '미분류',
            followUps: normalizeFollowUps(candidate.followUps),
            createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : fallback.createdAt,
            updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : fallback.updatedAt,
          }
        })
      : sampleQuestions
  } catch {
    return sampleQuestions
  }
}

export const saveQuestions = (questions: Question[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
}

export const loadFolders = (): QuestionFolder[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(FOLDERS_KEY) ?? '[]')
    if (Array.isArray(parsed) && parsed.every((item) => item && typeof item.id === 'string' && typeof item.name === 'string')) {
      return parsed.some((item) => item.id === defaultFolder.id) ? parsed : [defaultFolder, ...parsed]
    }
  } catch { /* use default */ }
  return [defaultFolder]
}

export const saveFolders = (folders: QuestionFolder[]) => localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders))

export const parseImport = (raw: string): QuestionInput[] => {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('올바른 JSON 형식이 아닙니다.')
  }

  if (!Array.isArray(parsed) || !parsed.every(isQuestionInput)) {
    throw new Error('각 메인/꼬리질문은 question과 answer 문자열을 가져야 합니다.')
  }
  return parsed.map((item) => {
    const candidate = item as Partial<Question>
    return {
      folderId: typeof candidate.folderId === 'string' ? candidate.folderId : defaultFolder.id,
      category: typeof candidate.category === 'string' && candidate.category.trim() ? candidate.category.trim() : '미분류',
      question: item.question.trim(),
      answer: item.answer.trim(),
      followUps: normalizeFollowUps(candidate.followUps),
    }
  })
}
