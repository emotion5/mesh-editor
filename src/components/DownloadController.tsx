import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

interface DownloadControllerProps {
  onCapture?: () => void
}

function DownloadController({ onCapture }: DownloadControllerProps) {
  const { gl, scene, camera } = useThree()
  const captureRef = useRef<(() => void) | undefined>(undefined)
  
  useEffect(() => {
    const captureScene = () => {
      // 현재 렌더링 상태 저장
      const originalBackground = scene.background
      
      // 배경을 투명하게 설정
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
    
    captureRef.current = captureScene
    
    // 전역 이벤트 리스너 설정 (외부에서 호출 가능)
    const handleCapture = () => {
      captureScene()
    }
    
    window.addEventListener('capture-3d-scene', handleCapture as EventListener)
    
    return () => {
      window.removeEventListener('capture-3d-scene', handleCapture as EventListener)
    }
  }, [gl, scene, camera])
  
  // 부모 컴포넌트에 캡처 함수 제공
  useEffect(() => {
    if (onCapture) {
      onCapture()
    }
  }, [onCapture])
  
  return null
}

export default DownloadController