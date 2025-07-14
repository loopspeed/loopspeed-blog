'use client'
import { useGLTF } from '@react-three/drei'
import { ThreeElements } from '@react-three/fiber'

type MeshProps = ThreeElements['mesh']
import React, { forwardRef } from 'react'
import { BufferGeometry, Mesh } from 'three'
import { type GLTF } from 'three-stdlib'

type LoopGLTF = GLTF & {
  nodes: {
    INFINITY_ThickMesh: Mesh
  }
  materials: object
}

const LoopModel = forwardRef<Mesh<BufferGeometry>, MeshProps>((props, ref) => {
  const { nodes } = useGLTF('/models/loopspeed.glb') as unknown as LoopGLTF

  return (
    <mesh ref={ref} geometry={nodes.INFINITY_ThickMesh.geometry} {...props}>
      <meshStandardMaterial color="#fff" />
    </mesh>
  )
})

useGLTF.preload('/models/loopspeed.glb')

LoopModel.displayName = 'LoopModel'

export default LoopModel
