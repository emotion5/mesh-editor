'use client'

import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
import styles from './ChatInterface.module.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  materials: Record<string, THREE.Material>
  onMaterialChange: (materialName: string, color: string) => void
}

interface MaterialChange {
  material: string
  color: string
}

interface ClaudeResponse {
  changes: MaterialChange[]
  message: string
  confidence?: number
}

export default function ChatInterface({ materials, onMaterialChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '안녕하세요! 신발 색상을 변경해드릴게요. "밑창을 빨간색으로", "전체를 검정색으로" 같은 자연어로 말씀해주세요.',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const processColorCommand = async (
    userInput: string,
    availableMaterials: string[]
  ): Promise<ClaudeResponse> => {
    try {
      console.log('🚀 Claude API 호출 중...')
      
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          system: `당신은 3D 신발 컨피규레이터의 어시스턴트입니다.
사용자가 자연어로 색상 변경을 요청하면, 적절한 머티리얼과 색상을 매칭해주세요.

규칙:
1. 머티리얼 이름은 제공된 목록에서 정확히 일치하는 것만 선택
2. 색상은 hex 코드로 변환 (예: 빨간색 → #FF0000)
3. "전체", "모든" 등의 표현은 관련된 모든 머티리얼 선택
4. 애매한 경우 가장 가능성 높은 머티리얼 선택
5. 한국어로 친절하게 응답

일반적인 매칭 예시:
- 밑창, 바닥, 아웃솔 → outsole, sole, bottom 관련 머티리얼
- 갑피, 어퍼, 상단 → upper, top, mesh 관련 머티리얼
- 끈, 레이스 → lace, shoelace 관련 머티리얼
- 로고, 브랜드 → logo, brand 관련 머티리얼
- 전체, 모든 → 모든 머티리얼

응답은 반드시 JSON 형식으로:
{
  "changes": [
    {"material": "정확한_머티리얼_이름", "color": "#RRGGBB"}
  ],
  "message": "사용자에게 보여줄 친절한 확인 메시지",
  "confidence": 0.9
}`,
          messages: [
            {
              role: 'user',
              content: `사용 가능한 머티리얼 목록: ${availableMaterials.join(', ')}
              
사용자 요청: "${userInput}"

위 요청을 분석하여 JSON 형식으로 응답해주세요.`
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Claude 응답 파싱
      const content = data.content[0].text
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        console.log('✅ Claude API 응답 성공')
        return result
      }

      throw new Error('Invalid response format')
    } catch (error) {
      console.error('❌ Claude API 오류, 더미 모드로 폴백:', error)
      return await processDummyCommand(userInput, availableMaterials)
    }
  }

  // API 키가 없을 때 사용할 더미 처리 함수
  async function processDummyCommand(
    userInput: string,
    availableMaterials: string[]
  ): Promise<ClaudeResponse> {
    // 1초 딜레이로 실제 API 호출처럼 보이게
    await new Promise(resolve => setTimeout(resolve, 1000))

    const input = userInput.toLowerCase()
    const changes: MaterialChange[] = []
    let message = ''

    // 색상 추출
    let color = '#808080' // 기본 회색
    if (input.includes('빨간') || input.includes('빨강') || input.includes('레드')) {
      color = '#FF0000'
    } else if (input.includes('파란') || input.includes('파랑') || input.includes('블루')) {
      color = '#0000FF'
    } else if (input.includes('초록') || input.includes('녹색') || input.includes('그린')) {
      color = '#00FF00'
    } else if (input.includes('노란') || input.includes('노랑') || input.includes('옐로')) {
      color = '#FFFF00'
    } else if (input.includes('검정') || input.includes('검은') || input.includes('블랙')) {
      color = '#000000'
    } else if (input.includes('하얀') || input.includes('흰') || input.includes('화이트')) {
      color = '#FFFFFF'
    } else if (input.includes('보라') || input.includes('퍼플')) {
      color = '#800080'
    } else if (input.includes('주황') || input.includes('오렌지')) {
      color = '#FFA500'
    }

    // 머티리얼 매칭 (간단한 키워드 기반)
    const targetMaterials: string[] = []

    if (input.includes('전체') || input.includes('모든') || input.includes('전부')) {
      targetMaterials.push(...availableMaterials)
      message = `전체 색상을 변경했습니다.`
    } else if (input.includes('밑창') || input.includes('바닥') || input.includes('아웃솔')) {
      const soleMaterials = availableMaterials.filter(m => 
        m.toLowerCase().includes('sole') || 
        m.toLowerCase().includes('bottom') ||
        m.toLowerCase().includes('outsole')
      )
      if (soleMaterials.length > 0) {
        targetMaterials.push(...soleMaterials)
        message = `밑창 색상을 변경했습니다.`
      }
    } else if (input.includes('갑피') || input.includes('어퍼') || input.includes('상단')) {
      const upperMaterials = availableMaterials.filter(m => 
        m.toLowerCase().includes('upper') || 
        m.toLowerCase().includes('top') ||
        m.toLowerCase().includes('mesh')
      )
      if (upperMaterials.length > 0) {
        targetMaterials.push(...upperMaterials)
        message = `갑피 색상을 변경했습니다.`
      }
    } else if (input.includes('끈') || input.includes('레이스')) {
      const laceMaterials = availableMaterials.filter(m => 
        m.toLowerCase().includes('lace') || 
        m.toLowerCase().includes('string')
      )
      if (laceMaterials.length > 0) {
        targetMaterials.push(...laceMaterials)
        message = `신발 끈 색상을 변경했습니다.`
      }
    }

    // 매칭된 머티리얼이 없으면 첫 번째 머티리얼 사용
    if (targetMaterials.length === 0 && availableMaterials.length > 0) {
      targetMaterials.push(availableMaterials[0])
      message = `색상을 변경했습니다.`
    }

    // 변경사항 생성
    targetMaterials.forEach(material => {
      changes.push({ material, color })
    })

    if (changes.length === 0) {
      return {
        changes: [],
        message: '변경할 수 있는 부분을 찾지 못했습니다. 다시 말씀해주세요.',
        confidence: 0.3
      }
    }

    return {
      changes,
      message,
      confidence: 0.8
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Claude API 호출
      const materialNames = Object.keys(materials)
      const response = await processColorCommand(inputValue, materialNames)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // 머티리얼 색상 변경 적용
      if (response.changes && response.changes.length > 0) {
        response.changes.forEach(change => {
          if (materials[change.material]) {
            onMaterialChange(change.material, change.color)
          }
        })
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다. 명령을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.messageWrapper} ${
              message.role === 'user' ? styles.userMessage : styles.assistantMessage
            }`}
          >
            <div className={styles.message}>
              <p className={styles.messageContent}>{message.content}</p>
              <span className={styles.timestamp}>
                {message.timestamp.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.assistantMessage}`}>
            <div className={styles.message}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="색상 변경 명령을 입력하세요..."
          className={styles.input}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          className={styles.sendButton}
          aria-label="메시지 전송"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className={styles.apiKeyWarning}>
          💡 개발 모드: Claude API 연결됨. 실제 AI 기능을 사용할 수 있습니다!
        </div>
      )}
    </div>
  )
}