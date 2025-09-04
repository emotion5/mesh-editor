'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './GeneratorInterface.module.css'

interface GeneratorInterfaceProps {
  onModelGenerated: (modelUrl: string) => void
}

interface GenerationStatus {
  isGenerating: boolean
  progress: number
  message: string
}

export default function GeneratorInterface({ onModelGenerated }: GeneratorInterfaceProps) {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<GenerationStatus>({
    isGenerating: false,
    progress: 0,
    message: ''
  })
  const [generatedModels, setGeneratedModels] = useState<string[]>([])
  const [backendStatus, setBackendStatus] = useState<any>(null)

  useEffect(() => {
    // 백엔드 상태 확인
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/status')
      const data = await response.json()
      setBackendStatus(data)
    } catch (error) {
      console.error('Backend status check failed:', error)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || status.isGenerating) return

    setStatus({
      isGenerating: true,
      progress: 0,
      message: 'AI가 3D 모델을 생성하고 있습니다...'
    })

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setStatus(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 500)

      // API 호출
      const formData = new FormData()
      formData.append('prompt', prompt)

      const response = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Generation failed')
      }

      // 생성된 파일을 Blob으로 받기
      const blob = await response.blob()
      const modelUrl = URL.createObjectURL(blob)

      setStatus({
        isGenerating: false,
        progress: 100,
        message: '3D 모델 생성 완료!'
      })

      // 생성된 모델을 목록에 추가
      setGeneratedModels(prev => [modelUrl, ...prev])
      
      // 부모 컴포넌트에 알림
      onModelGenerated(modelUrl)

      // 2초 후 상태 초기화
      setTimeout(() => {
        setStatus({ isGenerating: false, progress: 0, message: '' })
      }, 2000)

    } catch (error) {
      console.error('Generation failed:', error)
      setStatus({
        isGenerating: false,
        progress: 0,
        message: `오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      })

      // 5초 후 에러 메시지 초기화
      setTimeout(() => {
        setStatus({ isGenerating: false, progress: 0, message: '' })
      }, 5000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const handleModelSelect = (modelUrl: string) => {
    onModelGenerated(modelUrl)
  }

  const downloadModel = (modelUrl: string, index: number) => {
    const a = document.createElement('a')
    a.href = modelUrl
    a.download = `generated_model_${index + 1}.glb`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>🎨 AI 3D 모델 생성</h3>
        {backendStatus && (
          <div className={styles.status}>
            <span className={styles.statusDot} 
                  style={{ backgroundColor: backendStatus.capabilities.model_generation ? '#00ff00' : '#ff0000' }}>
            </span>
            {backendStatus.capabilities.model_generation ? 'Blender 연결됨' : 'Blender 없음'}
          </div>
        )}
      </div>

      <div className={styles.inputSection}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="원하는 3D 모델을 설명해주세요...&#10;예: '빨간색 운동화', '파란색 구', '간단한 자동차'"
          className={styles.promptInput}
          disabled={status.isGenerating}
          rows={3}
        />
        
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || status.isGenerating}
          className={styles.generateButton}
        >
          {status.isGenerating ? (
            <>
              <div className={styles.spinner}></div>
              생성 중...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
              생성하기
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      {status.isGenerating && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${status.progress}%` }}
            ></div>
          </div>
          <p className={styles.progressText}>{status.message}</p>
        </div>
      )}

      {/* Status Message */}
      {status.message && !status.isGenerating && (
        <div className={`${styles.message} ${
          status.message.startsWith('오류') ? styles.error : styles.success
        }`}>
          {status.message}
        </div>
      )}

      {/* Generated Models History */}
      {generatedModels.length > 0 && (
        <div className={styles.historySection}>
          <h4 className={styles.historyTitle}>생성된 모델들</h4>
          <div className={styles.modelGrid}>
            {generatedModels.slice(0, 6).map((modelUrl, index) => (
              <div key={index} className={styles.modelCard}>
                <div className={styles.modelPreview}>
                  <span className={styles.modelIcon}>📦</span>
                </div>
                <div className={styles.modelActions}>
                  <button
                    onClick={() => handleModelSelect(modelUrl)}
                    className={styles.actionButton}
                    title="이 모델 보기"
                  >
                    👀
                  </button>
                  <button
                    onClick={() => downloadModel(modelUrl, index)}
                    className={styles.actionButton}
                    title="다운로드"
                  >
                    ⬇️
                  </button>
                </div>
                <span className={styles.modelLabel}>모델 {index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examples */}
      <div className={styles.examplesSection}>
        <h4 className={styles.examplesTitle}>💡 예시 프롬프트</h4>
        <div className={styles.examplesList}>
          {[
            "빨간색 구",
            "파란색 자동차",
            "흰색 운동화",
            "초록색 원뿔",
            "노란색 도넛",
            "분홍색 실린더"
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example)}
              className={styles.exampleButton}
              disabled={status.isGenerating}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}