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
      const mat = material as any
      console.log(`Material "${name}":`, {
        type: material.constructor.name,
        color: mat.color ? `#${mat.color.getHexString()}` : 'none',
        metalness: mat.metalness || 0,
        roughness: mat.roughness || 0,
        clearcoat: mat.clearcoat || 0,
        clearcoatRoughness: mat.clearcoatRoughness || 0,
        transparent: mat.transparent || false,
        opacity: mat.opacity || 1,
        emissive: mat.emissive ? `#${mat.emissive.getHexString()}` : 'none',
        needsUpdate: mat.needsUpdate
      })
      
      // 머티리얼 새로고침 강제 적용
      if (mat.needsUpdate !== undefined) {
        mat.needsUpdate = true
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