import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion } from 'framer-motion'
import * as THREE from 'three'

interface JarvisOrbProps {
  isListening: boolean
  isSpeaking: boolean
  size?: number
}

function AnimatedSphere({ isActive }: { isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005
      meshRef.current.rotation.y += 0.005

      if (isActive) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
        meshRef.current.scale.set(scale, scale, scale)
      }
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001
    }
  })

  // Create particle system
  const particleCount = 1000
  const positions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(Math.random() * 2 - 1)
    const radius = 2 + Math.random() * 1

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)
  }

  return (
    <>
      {/* Main orb */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={isActive ? 0.5 : 0.2}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={isActive ? 0.3 : 0.1}
        />
      </mesh>

      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#00d4ff"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#00d4ff" />
    </>
  )
}

export default function JarvisOrb({ isListening, isSpeaking, size = 300 }: JarvisOrbProps) {
  const isActive = isListening || isSpeaking

  return (
    <motion.div
      animate={{
        scale: isActive ? [1, 1.05, 1] : 1,
      }}
      transition={{
        duration: 1,
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut",
      }}
      style={{ width: size, height: size }}
      className="relative"
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <AnimatedSphere isActive={isActive} />
      </Canvas>

      {/* Glow rings */}
      {isActive && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-jarvis-blue"
            animate={{
              scale: [1, 1.5],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-jarvis-blue"
            animate={{
              scale: [1, 1.5],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5,
            }}
          />
        </>
      )}
    </motion.div>
  )
}
