import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows, Html } from '@react-three/drei'
import { motion, useTime } from 'framer-motion/three'
import { useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
import { MathUtils } from 'three'

export default function App() {
  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [-2.5, 0, 4], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={[512, 512]} castShadow />
      <BouncyControls>
        <Watch
          initial={{ scale: 0.002 }}
          animate={{ scale: 0.003 }}
          whileHover={{ scale: 0.004 }}
          position={[0, 0.25, 0]}
          transition={{ type: 'spring', stiffness: 300, damping: 10, restDelta: 0.0000001 }}
        />
      </BouncyControls>
      <ContactShadows rotation-x={Math.PI / 2} position={[0, -1.4, 0]} opacity={0.75} width={10} height={10} blur={2.6} far={2} />
      <Environment preset="city" />
    </Canvas>
  )
}

function BouncyControls({ children }) {
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, settings)
  const springY = useSpring(rotateY, settings)

  const { size, gl } = useThree()
  useDrag(
    ({ movement: [x, y], down }) => {
      y = MathUtils.clamp(y / size.height, -1, 1) * Math.PI
      x = MathUtils.clamp(x / size.width, -1, 1) * Math.PI
      rotateX.set(down ? y / 2 : 0)
      rotateY.set(down ? x * 1.25 : 0)
    },
    { target: gl.domElement }
  )
  return <motion.group rotation={[springX, springY, 0]}>{children}</motion.group>
}

function Watch(props) {
  const time = useTime(0)
  const rotateX = useTransform(time, (t) => -Math.PI / 1.75 + Math.cos(t / 4) / 8)
  const rotateY = useTransform(time, (t) => Math.sin(t / 4) / 8)
  const rotateZ = useTransform(time, (t) => -0.2 - (1 + Math.sin(t / 1.5)) / 20)
  const y = 0 ///useTransform(time, (t) => (1 + Math.sin(t / 1.5)) / 10)

  const { nodes, materials } = useGLTF('/watch-v1.glb')

  return (
    <motion.group {...props} position-y={y} rotation={[rotateX, rotateY, rotateZ]} dispose={null}>
      <mesh geometry={nodes.Object005_glass_0.geometry} material={materials.glass}>
        <Html scale={100} rotation={[Math.PI / 2, 0, 0]} position={[180, -350, 50]} transform occlude>
          <div className="annotation">Want to save time?</div>
        </Html>
      </mesh>
      <mesh castShadow receiveShadow geometry={nodes.Object006_watch_0.geometry} material={materials.watch} />
    </motion.group>
  )
}

const settings = {
  damping: 20,
  stiffness: 1000,
  restDelta: 0.0000001
}
