import { useState } from 'react'
import * as THREE from 'three'
import styles from './MaterialList.module.css'

interface MaterialListProps {
  materials: Record<string, THREE.Material>
}

function MaterialList({ materials }: MaterialListProps) {
  const [colors, setColors] = useState<Record<string, string>>({})

  const handleColorChange = (materialName: string, color: string) => {
    // 색상 상태 업데이트
    setColors(prev => ({ ...prev, [materialName]: color }))
    
    // Three.js 머티리얼 색상 변경
    const material = materials[materialName]
    if (material && 'color' in material) {
      const mat = material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | THREE.MeshBasicMaterial
      mat.color = new THREE.Color(color)
      mat.needsUpdate = true  // 머티리얼 새로고침 강제
      
      // 투명도가 있는 머티리얼은 특별 처리
      if ('transparent' in mat && 'opacity' in mat && mat.transparent && mat.opacity < 1) {
        mat.transparent = true
        mat.needsUpdate = true
      }
    }
  }

  const getMaterialColor = (material: THREE.Material): string => {
    if ('color' in material) {
      const mat = material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | THREE.MeshBasicMaterial
      return '#' + mat.color.getHexString()
    }
    return '#ffffff'
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>머티리얼 목록</h3>
      <div className={styles.materialsList}>
        {Object.entries(materials).map(([name, material]) => {
          const displayName = name.length > 25 
            ? name.substring(0, 25) + '...' 
            : name
          
          return (
            <div key={name} className={styles.materialItem}>
              <div className={styles.materialInfo}>
                <span 
                  className={styles.materialName}
                  title={name} // 툴팁으로 전체 이름 표시
                >
                  {displayName}
                </span>
              </div>
              <input
                type="color"
                className={styles.colorPicker}
                value={colors[name] || getMaterialColor(material)}
                onChange={(e) => handleColorChange(name, e.target.value)}
              />
            </div>
          )
        })}
      </div>
      {Object.keys(materials).length === 0 && (
        <p className={styles.noMaterials}>머티리얼을 찾을 수 없습니다.</p>
      )}
    </div>
  )
}

export default MaterialList