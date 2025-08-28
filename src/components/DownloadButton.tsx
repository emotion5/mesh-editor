import { useThree } from '@react-three/fiber'
import styles from './DownloadButton.module.css'

function DownloadButton() {
  const { gl, scene, camera } = useThree()
  
  const handleDownload = () => {
    
    // 현재 렌더링 상태 저장
    const originalBackground = scene.background
    
    // 배경을 투명하게 설정 (선택사항)
    scene.background = null
    
    // 렌더링
    gl.render(scene, camera)
    
    // Canvas를 이미지로 변환
    gl.domElement.toBlob(
      (blob) => {
        if (!blob) return
        
        // 다운로드 링크 생성
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        
        // 파일명에 타임스탬프 추가
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        link.download = `3d-model-${timestamp}.png`
        
        link.click()
        
        // 메모리 정리
        URL.revokeObjectURL(url)
      },
      'image/png',
      1.0
    )
    
    // 원래 배경 복원
    scene.background = originalBackground
    gl.render(scene, camera)
  }
  
  return (
    <button 
      className={styles.downloadButton}
      onClick={handleDownload}
      title="이미지 다운로드"
      aria-label="3D 모델 이미지 다운로드"
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  )
}

export default DownloadButton