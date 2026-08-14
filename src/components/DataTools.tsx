import { useRef, useState, type ChangeEvent } from 'react'
import { useQuestions } from '../context/QuestionsContext'
import { parseImport } from '../utils/storage'

interface Props {
  folderId: string
  folderName: string
}

export function DataTools({ folderId, folderName }: Props) {
  const { questions, importQuestions } = useQuestions()
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const items = parseImport(await file.text())
      importQuestions(items.map((item) => ({ ...item, folderId })))
      setMessage(`${folderName}에 ${items.length}개의 질문을 추가했습니다.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '가져오기에 실패했습니다.')
    } finally {
      event.target.value = ''
    }
  }

  const handleExport = () => {
    const folderQuestions = questions.filter((item) => item.folderId === folderId)
    const blob = new Blob([JSON.stringify(folderQuestions, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    const safeName = folderName.replace(/[\\/:*?"<>|]/g, '-').trim() || 'folder'
    anchor.download = `${safeName}-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage(`${folderQuestions.length}개의 질문을 내보냈습니다.`)
  }

  return (
    <div className="data-tools">
      <input ref={inputRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={handleImport} />
      <button className="button secondary" type="button" onClick={() => inputRef.current?.click()}>이 폴더로 가져오기</button>
      <button className="button secondary" type="button" onClick={handleExport} disabled={!questions.some((item) => item.folderId === folderId)}>이 폴더 내보내기</button>
      {message && <span className="tool-message" role="status">{message}</span>}
    </div>
  )
}
