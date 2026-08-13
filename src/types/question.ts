export interface FollowUp {
  id: string
  question: string
  answer: string
}

export interface QuestionFolder {
  id: string
  name: string
}

export interface Question {
  id: string
  folderId: string
  category: string
  question: string
  answer: string
  followUps: FollowUp[]
  createdAt: string
  updatedAt: string
}

export type QuestionInput = Pick<Question, 'folderId' | 'category' | 'question' | 'answer' | 'followUps'>
export type PracticeMode = 'sequential' | 'random'
