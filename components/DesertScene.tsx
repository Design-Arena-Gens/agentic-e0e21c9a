'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import * as THREE from 'three'

function Vehicle({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* 车身 */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[2.2, 1, 4.5]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 驾驶舱 */}
      <mesh position={[0, 1.4, -0.3]} castShadow>
        <boxGeometry args={[2, 0.9, 2.5]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* 前窗 */}
      <mesh position={[0, 1.5, 0.8]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 0.7, 0.1]} />
        <meshStandardMaterial color="#4a90e2" transparent opacity={0.3} metalness={1} roughness={0} />
      </mesh>

      {/* 轮胎 */}
      {[[-1.1, 0.4, 1.8], [1.1, 0.4, 1.8], [-1.1, 0.4, -1.8], [1.1, 0.4, -1.8]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.6, 16]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* 防滚架 */}
      <mesh position={[0, 1.9, -0.3]} castShadow>
        <boxGeometry args={[2.2, 0.1, 2.6]} />
        <meshStandardMaterial color="#ff4500" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* 引擎盖装饰 */}
      <mesh position={[0, 0.8, 1.5]} castShadow>
        <boxGeometry args={[1.8, 0.05, 1]} />
        <meshStandardMaterial color="#ff6600" metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  )
}

function DesertTerrain() {
  const terrainRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(500, 500, 128, 128)
    const positions = geo.attributes.position.array as Float32Array

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const wave1 = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 4
      const wave2 = Math.sin(x * 0.05 + y * 0.05) * 2
      const wave3 = Math.sin(x * 0.01) * Math.sin(y * 0.01) * 6
      positions[i + 2] = wave1 + wave2 + wave3
    }

    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh ref={terrainRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial
        color="#d4a574"
        roughness={0.95}
        metalness={0.05}
      />
    </mesh>
  )
}

function DustParticles() {
  const particlesRef = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100
      positions[i * 3 + 1] = Math.random() * 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100

      velocities[i * 3] = (Math.random() - 0.5) * 0.5
      velocities[i * 3 + 1] = Math.random() * 0.2
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5
    }

    return { positions, velocities }
  }, [])

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += particles.velocities[i] * 0.5
        positions[i + 1] += particles.velocities[i + 1] * 0.3
        positions[i + 2] += particles.velocities[i + 2] * 0.5

        if (positions[i + 1] > 20) {
          positions[i] = (Math.random() - 0.5) * 100
          positions[i + 1] = 0
          positions[i + 2] = (Math.random() - 0.5) * 100
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color="#d4a574"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function CinematicCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const startTime = useRef(Date.now())

  useFrame(() => {
    if (!cameraRef.current) return

    const elapsed = (Date.now() - startTime.current) / 1000
    const camera = cameraRef.current

    // 0-3秒: 从沙丘中景开始，极速前移，360度绕过车头，过渡到车队后方低空追逐
    if (elapsed < 3) {
      const t = elapsed / 3
      const radius = 25 - t * 15
      const angle = t * Math.PI * 2 + Math.PI
      const height = 8 - t * 5

      camera.position.x = Math.cos(angle) * radius
      camera.position.y = height
      camera.position.z = Math.sin(angle) * radius + t * 20
      camera.lookAt(0, 1.5, t * 10)
    }
    // 3-6秒: 低空高速，贴沙丘表面掠过第二辆车侧面
    else if (elapsed < 6) {
      const t = (elapsed - 3) / 3
      camera.position.x = -8 + t * 16
      camera.position.y = 2.5 - t * 0.5
      camera.position.z = -15 + t * 5
      camera.lookAt(5 * t, 1.5, -12 + t * 5)
    }
    // 6-9秒: 从第三辆车底盘下穿过，极度贴近沙地，然后拉升
    else if (elapsed < 9) {
      const t = (elapsed - 6) / 3
      camera.position.x = 8 - t * 8
      camera.position.y = 0.8 + t * t * 8
      camera.position.z = -25 + t * 8
      camera.lookAt(0, 1 + t * 5, -20 + t * 10)
    }
    // 9-11秒: 爆发性陡峭向上爬升，持续拉远
    else if (elapsed < 11) {
      const t = (elapsed - 9) / 2
      camera.position.x = 0
      camera.position.y = 8 + t * t * 40
      camera.position.z = -17 - t * 25
      camera.lookAt(0, 0, -10)
    }
    // 11-13秒: 高空俯瞰，保持微小倾角
    else if (elapsed < 13) {
      const t = (elapsed - 11) / 2
      camera.position.x = 0
      camera.position.y = 48 + t * 10
      camera.position.z = -42 - t * 15
      camera.lookAt(0, 0, 0)
    }
    // 13-15秒: 缓慢横向漂移侧滑，定格沙漠全景
    else if (elapsed < 15) {
      const t = (elapsed - 13) / 2
      camera.position.x = t * 30
      camera.position.y = 58 + t * 5
      camera.position.z = -57 - t * 10
      camera.lookAt(t * 20, 0, -10)
    }
    // 15秒后: 保持最终位置
    else {
      camera.position.x = 30
      camera.position.y = 63
      camera.position.z = -67
      camera.lookAt(20, 0, -10)
    }
  })

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={75} near={0.1} far={1000} />
}

function Scene() {
  return (
    <>
      <CinematicCamera />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 80, 50]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <directionalLight position={[-30, 40, -30]} intensity={0.5} color="#ffa566" />

      <hemisphereLight args={['#87ceeb', '#d4a574', 0.6]} />

      <DesertTerrain />

      {/* 车队 - 三辆越野车 */}
      <Vehicle position={[0, 0, 0]} rotation={0} />
      <Vehicle position={[-6, 0, -15]} rotation={0.1} />
      <Vehicle position={[5, 0, -25]} rotation={-0.15} />

      <DustParticles />

      <fog attach="fog" args={['#e8d5c4', 50, 200]} />
    </>
  )
}

export default function DesertScene() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas shadows gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={['#e8d5c4']} />
        <Scene />
        <Environment preset="sunset" />
      </Canvas>

      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#fff',
        fontSize: '14px',
        textAlign: 'center',
        background: 'rgba(0,0,0,0.6)',
        padding: '15px 30px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
          沙漠越野竞速 - 电影级镜头序列
        </div>
        <div style={{ opacity: 0.9, lineHeight: '1.6' }}>
          0-3s: 360°绕车头动态追踪 | 3-6s: 低空侧面掠过 | 6-9s: 底盘穿梭拉升<br/>
          9-11s: 爆发式陡峭爬升 | 11-13s: 高空俯瞰 | 13-15s: 横向漂移全景
        </div>
      </div>
    </div>
  )
}
