import { useGLTF } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ModelViewerProps {
  modelPath: string
  modelScale: number
  modelPosition: [number, number, number]
  onMaterialsFound: (materials: Record<string, THREE.Material>) => void
}

function ModelViewer({ modelPath, modelScale, modelPosition, onMaterialsFound }: ModelViewerProps) {
  const { scene } = useGLTF(modelPath)
  const modelRef = useRef<THREE.Group>(null)

  useEffect(() => {
    const materialsMap: Record<string, THREE.Material> = {}
    
    // 모델 내부의 모든 메시 탐색하여 머티리얼 수집
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mesh = child as THREE.Mesh
        
        // 머티리얼 수집 (중복 제거)
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat, index) => {
              const matName = mat.name || `Material_${mesh.name}_${index}`
              materialsMap[matName] = mat
            })
          } else {
            const matName = mesh.material.name || `Material_${mesh.name}`
            materialsMap[matName] = mesh.material
          }
        }
      }
    })
    
    // 머티리얼 상세 속성 확인
    Object.entries(materialsMap).forEach(([name, material]) => {
      console.log(`Material "${name}":`, {
        type: material.constructor.name,
        color: 'color' in material && material.color ? `#${(material.color as THREE.Color).getHexString()}` : 'none',
        metalness: 'metalness' in material ? material.metalness || 0 : 0,
        roughness: 'roughness' in material ? material.roughness || 0 : 0,
        clearcoat: 'clearcoat' in material ? material.clearcoat || 0 : 0,
        clearcoatRoughness: 'clearcoatRoughness' in material ? material.clearcoatRoughness || 0 : 0,
        transparent: 'transparent' in material ? material.transparent || false : false,
        opacity: 'opacity' in material ? material.opacity || 1 : 1,
        emissive: 'emissive' in material && material.emissive ? `#${(material.emissive as THREE.Color).getHexString()}` : 'none',
        needsUpdate: material.needsUpdate
      })
      
      // 머티리얼 새로고침 강제 적용
      if (material.needsUpdate !== undefined) {
        material.needsUpdate = true
      }
    })
    
    onMaterialsFound(materialsMap)
  }, [scene, onMaterialsFound])

  return (
    <group ref={modelRef}>
      <primitive 
        object={scene} 
        scale={[modelScale, modelScale, modelScale]}
        position={modelPosition}
        rotation={[0, 0, 0]}
      />
    </group>
  )
}

export default ModelViewer