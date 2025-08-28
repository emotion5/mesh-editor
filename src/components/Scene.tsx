import { OrbitControls, Environment, useTexture } from '@react-three/drei'
import ModelViewer from './ModelViewer'
import * as THREE from 'three'

interface SceneProps {
  modelPath: string
  modelScale: number
  modelPosition: [number, number, number]
  onMaterialsFound: (materials: Record<string, THREE.Material>) => void
}

function GroundPlane() {
  const soilTexture = useTexture('/textures/soil.png')
  
  // 텍스처 설정
  soilTexture.wrapS = soilTexture.wrapT = THREE.RepeatWrapping
  soilTexture.repeat.set(8, 8) // 8x8 반복
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <circleGeometry args={[30, 64]} />
      <meshStandardMaterial
        map={soilTexture}
        transparent
        opacity={0.05}  // 조금 더 진하게
        roughness={0.8}
        metalness={0}
        color="#808080"  // 회색 틴트로 더 어둡게
      />
    </mesh>
  )
}

function Scene({ modelPath, modelScale, modelPosition, onMaterialsFound }: SceneProps) {
  return (
    <>
      {/* PBR을 위한 환경맵 - metalness/roughness 효과 극대화 */}
      <Environment 
        preset="studio" 
        background={false}
        environmentIntensity={0.4}
      />
      
      {/* 조명 설정 - PBR 최적화 */}
      <ambientLight intensity={0.2} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2} 
      />
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={0.6} 
      />
      
      {/* 카메라 컨트롤 - 마우스로 회전/줌 가능 */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
      />
      
      {/* 바닥 텍스처 */}
      <GroundPlane />
      
      {/* 3D 모델 */}
      <ModelViewer 
        modelPath={modelPath}
        modelScale={modelScale}
        modelPosition={modelPosition}
        onMaterialsFound={onMaterialsFound}
      />
      
      {/* 배경은 CSS 그라데이션 + 바닥 텍스처 조합 */}
    </>
  )
}

export default Scene