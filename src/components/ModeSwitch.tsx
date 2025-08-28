'use client'

import styles from './ModeSwitch.module.css'

interface ModeSwitchProps {
  isChecked: boolean
  onChange: (checked: boolean) => void
}

export default function ModeSwitch({ isChecked, onChange }: ModeSwitchProps) {
  return (
    <div className={styles.container}>
      <div className={styles.switchWrapper}>
        <label className={styles.switchLabel}>
          <span className={styles.labelText}>채팅 모드</span>
          <div className={styles.switch}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => onChange(e.target.checked)}
              className={styles.switchInput}
            />
            <span className={styles.switchSlider}></span>
          </div>
        </label>
      </div>
    </div>
  )
}