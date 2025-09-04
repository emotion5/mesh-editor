'use client'

import { useGLTF, useLoader } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface UniversalModelViewerProps {
  modelPath: string
  modelScale: number
  modelPosition: [number, number, number]
  onMaterialsFound: (materials: Record<string, THREE.Material>) => void
}

function UniversalModelViewer({ modelPath, modelScale, modelPosition, onMaterialsFound }: UniversalModelViewerProps) {
  const modelRef = useRef<THREE.Group>(null)
  const [modelScene, setModelScene] = useState<THREE.Object3D | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 파일 확장자에 따라 로더 결정
  const getFileExtension = (path: string) => {
    // blob URL인 경우 GLB로 가정 (백엔드에서 GLB를 반환하므로)
    if (path.startsWith('blob:')) {
      return 'glb'
    }
    return path.split('.').pop()?.toLowerCase() || ''
  }

  const extension = getFileExtension(modelPath)
  console.log('🔍 Detected extension:', extension, 'for path:', modelPath)

  useEffect(() => {
    const loadModel = async () => {
      console.log('🔄 Loading model:', modelPath, 'extension:', extension)
      setIsLoading(true)
      setError(null)

      try {
        let scene: THREE.Object3D

        if (extension === 'obj') {
          console.log('📦 Loading as OBJ file')
          // OBJ 로더 사용
          const objLoader = new OBJLoader()
          scene = await new Promise<THREE.Group>((resolve, reject) => {
            objLoader.load(
              modelPath,
              (object) => resolve(object),
              undefined,
              (error) => reject(error)
            )
          })
          
          // OBJ 파일은 기본 머티리얼이 없으므로 기본 머티리얼 추가
          scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (!child.material) {
                child.material = new THREE.MeshStandardMaterial({ 
                  color: 0x808080,
                  name: 'Default_Material'
                })
              }
            }
          })
          
        } else {
          console.log('📦 Loading as GLB/GLTF file')
          // GLB/GLTF 로더 사용 (수동 로드)
          const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader')
          const gltfLoader = new GLTFLoader()
          
          const gltf = await new Promise<any>((resolve, reject) => {
            gltfLoader.load(
              modelPath,
              (gltf) => {
                console.log('✅ GLB loaded successfully:', gltf)
                resolve(gltf)
              },
              undefined,
              (error) => {
                console.error('❌ GLB loading failed:', error)
                reject(error)
              }
            )
          })
          scene = gltf.scene
        }

        console.log('✅ Model loaded, setting scene')
        console.log('🔍 Scene children count:', scene.children.length)
        scene.traverse((child) => {
          console.log('🔍 Scene child:', child.type, child.name, child)
          if (child instanceof THREE.Mesh) {
            console.log('  📦 Mesh geometry:', child.geometry)
            console.log('  📊 Geometry attributes:', child.geometry.attributes)
            console.log('  📍 Geometry position count:', child.geometry.attributes.position?.count)
            console.log('  📐 Geometry boundingBox:', child.geometry.boundingBox)
            console.log('  🎨 Mesh material:', child.material)
            
            // BoundingBox 계산 (없으면 계산)
            if (!child.geometry.boundingBox) {
              child.geometry.computeBoundingBox()
            }
            console.log('  📏 Computed boundingBox:', child.geometry.boundingBox)
          }
        })
        
        setModelScene(scene.clone())
        setIsLoading(false)

      } catch (err) {
        console.error('Model loading failed:', err)
        setError(`모델을 로드할 수 없습니다: ${err}`)
        setIsLoading(false)
      }
    }

    if (modelPath) {
      loadModel()
    }
  }, [modelPath, extension])

  useEffect(() => {
    if (!modelScene) return

    const materialsMap: Record<string, THREE.Material> = {}
    
    // 모델 내부의 모든 메시 탐색하여 머티리얼 수집
    modelScene.traverse((child) => {
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
            const mat = mesh.material as THREE.Material
            const matName = mat.name || mesh.name || 'Unnamed_Material'
            materialsMap[matName] = mat
          }
        }
      }
    })
    
    console.log('Materials found in UniversalModelViewer:', Object.keys(materialsMap))
    onMaterialsFound(materialsMap)
  }, [modelScene, onMaterialsFound])

  if (isLoading) {
    console.log('🔄 Still loading, showing loading box')
    return (
      <mesh position={modelPosition}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#ffff00" transparent opacity={0.7} />
      </mesh>
    )
  }

  if (error) {
    return (
      <mesh position={modelPosition}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
    )
  }

  if (!modelScene) {
    return null
  }

  return (
    <group ref={modelRef} position={modelPosition} scale={[modelScale, modelScale, modelScale]}>
      <primitive object={modelScene} />
    </group>
  )
}

// GLB/GLTF용 기존 컴포넌트 (성능 최적화)
function GLTFModelViewer({ modelPath, modelScale, modelPosition, onMaterialsFound }: UniversalModelViewerProps) {
  const { scene } = useGLTF(modelPath)
  const modelRef = useRef<THREE.Group>(null)

  useEffect(() => {
    const materialsMap: Record<string, THREE.Material> = {}
    
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mesh = child as THREE.Mesh
        
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat, index) => {
              const matName = mat.name || `Material_${mesh.name}_${index}`
              materialsMap[matName] = mat
            })
          } else {
            const mat = mesh.material as THREE.Material
            const matName = mat.name || mesh.name || 'Unnamed_Material'
            materialsMap[matName] = mat
          }
        }
      }
    })
    
    console.log('Materials found in GLTFModelViewer:', Object.keys(materialsMap))
    onMaterialsFound(materialsMap)
  }, [scene, onMaterialsFound])

  return (
    <group ref={modelRef} position={modelPosition} scale={[modelScale, modelScale, modelScale]}>
      <primitive object={scene} />
    </group>
  )
}

// 메인 컴포넌트 - 파일 형식에 따라 적절한 로더 선택
export default function SmartModelViewer(props: UniversalModelViewerProps) {
  const extension = props.modelPath.split('.').pop()?.toLowerCase() || ''
  
  // GLB/GLTF는 최적화된 로더 사용
  if (extension === 'glb' || extension === 'gltf') {
    return <GLTFModelViewer {...props} />
  }
  
  // 기타 형식은 범용 로더 사용
  return <UniversalModelViewer {...props} />
}