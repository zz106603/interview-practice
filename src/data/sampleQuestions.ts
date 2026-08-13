import type { Question } from '../types/question'

const initialDate = '2026-01-01T00:00:00.000Z'

export const sampleQuestions: Question[] = [
  {
    id: 'sample-1',
    folderId: 'default',
    category: '공통',
    question: '자기소개를 1분 이내로 해주세요.',
    answer: '현재 역할과 핵심 경험, 지원 직무와 연결되는 강점, 입사 후 기여하고 싶은 점의 순서로 간결하게 답변합니다.',
    followUps: [
      { id: 'sample-1-follow-1', question: '말씀하신 강점을 발휘한 구체적인 사례가 있나요?', answer: '상황과 행동, 결과를 수치나 관찰 가능한 변화와 함께 설명합니다.' },
    ],
    createdAt: initialDate,
    updatedAt: initialDate,
  },
  {
    id: 'sample-2',
    folderId: 'default',
    category: '경험',
    question: '가장 어려웠던 문제를 해결한 경험을 말씀해주세요.',
    answer: '상황과 목표를 먼저 설명하고, 내가 취한 행동과 판단 근거, 정량적인 결과, 배운 점을 STAR 방식으로 답변합니다.',
    followUps: [
      { id: 'sample-2-follow-1', question: '다시 같은 상황을 겪는다면 무엇을 다르게 하겠어요?', answer: '당시의 한계를 인정하고, 배운 점을 바탕으로 개선할 행동을 구체적으로 설명합니다.' },
      { id: 'sample-2-follow-2', question: '해결 과정에서 본인이 직접 기여한 부분은 무엇인가요?', answer: '팀의 결과와 구분하여 내가 내린 결정과 실행한 일을 명확히 답변합니다.' },
    ],
    createdAt: initialDate,
    updatedAt: initialDate,
  },
  {
    id: 'sample-3',
    folderId: 'default',
    category: '지원 동기',
    question: '우리 회사에 지원한 이유는 무엇인가요?',
    answer: '회사의 방향성과 직무의 역할을 나의 경험 및 커리어 목표와 연결하고, 구체적으로 기여할 수 있는 부분을 설명합니다.',
    followUps: [],
    createdAt: initialDate,
    updatedAt: initialDate,
  },
]
