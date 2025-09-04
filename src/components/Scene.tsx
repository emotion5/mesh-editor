import { OrbitControls, Environment, Grid } from '@react-three/drei'
import ModelViewer from './ModelViewer'
import SmartModelViewer from './UniversalModelViewer'
import * as THREE from 'three'

interface SceneProps {
  modelPath?: string
  generatedModelUrl?: string
  modelScale: number
  modelPosition: [number, number, number]
  onMaterialsFound: (materials: Record<string, THREE.Material>) => void
}

function Scene({ modelPath, generatedModelUrl, modelScale, modelPosition, onMaterialsFound }: SceneProps) {
  // 사용할 모델 URL 결정 (생성된 모델이 우선)
  const activeModelUrl = generatedModelUrl || modelPath
  return (
    <>
      {/* PBR을 위한 환경맵 - metalness/roughness 효과 극대화 */}
      <Environment 
        preset="studio" 
        background={false}
        environmentIntensity={0.4}
      />
      
      {/* 조명 설정 - PBR 최적화 */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.0} 
      />
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={0.5} 
      />
      
      {/* 카메라 컨트롤 - 마우스로 회전/줌 가능 */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
      />
      
      {/* 그리드 뷰어 */}
      <Grid 
        position={[0, -0.01, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#374151"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
      
      {/* 3D 모델 */}
      {activeModelUrl && (
        <SmartModelViewer 
          modelPath={activeModelUrl}
          modelScale={modelScale}
          modelPosition={modelPosition}
          onMaterialsFound={onMaterialsFound}
          key={`model-${activeModelUrl}`} // URL이 변경될 때마다 컴포넌트 재마운트
        />
      )}
    </>
  )
}

export default Scene