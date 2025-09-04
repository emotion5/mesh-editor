'use client'

import { useState } from 'react'
import styles from './ModeSelector.module.css'

interface ModeSelectorProps {
  currentMode: 'manual' | 'chat' | 'generator'
  onChange: (mode: 'manual' | 'chat' | 'generator') => void
}

export default function ModeSelector({ currentMode, onChange }: ModeSelectorProps) {
  const modes = [
    {
      key: 'manual' as const,
      label: '수동 편집',
      icon: '🎨',
      description: '색상을 직접 선택'
    },
    {
      key: 'chat' as const,
      label: '색상 AI',
      icon: '💬',
      description: '자연어로 색상 변경'
    },
    {
      key: 'generator' as const,
      label: '3D 생성',
      icon: '🚀',
      description: 'AI로 3D 모델 생성'
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.modeButtons}>
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => onChange(mode.key)}
            className={`${styles.modeButton} ${
              currentMode === mode.key ? styles.active : ''
            }`}
            title={mode.description}
          >
            <span className={styles.icon}>{mode.icon}</span>
            <span className={styles.label}>{mode.label}</span>
          </button>
        ))}
      </div>
      
      {/* Mode Description */}
      <div className={styles.description}>
        {modes.find(m => m.key === currentMode)?.description}
      </div>
    </div>
  )
}