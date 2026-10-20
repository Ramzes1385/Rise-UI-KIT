import type { FlowMap3DBlobs } from '../../../../types/internal/flowMap3dMotion.types'
import type { FlowMap3DNodeItem, FlowMap3DSnapshot } from '../../../../types/internal/flowMap3dInternal.types'
import { DataTexture, DoubleSide, Group, InstancedMesh, LinearFilter, Matrix4, MeshBasicMaterial, PlaneGeometry, RGBAFormat } from 'three'

const TEXTURE_SIZE = 32
const BLOB_SCALE = 1.25
const BLOB_OPACITY = 0.24
const BLOB_LIFT = 0.012
const BLOB_ORDER = 1

function gradient(): DataTexture {
	const data = new Uint8Array(TEXTURE_SIZE * TEXTURE_SIZE * 4)
	for (let y = 0; y < TEXTURE_SIZE; y += 1) {
		for (let x = 0; x < TEXTURE_SIZE; x += 1) {
			const distance = Math.hypot((x + 0.5) / TEXTURE_SIZE - 0.5, (y + 0.5) / TEXTURE_SIZE - 0.5) * 2
			data[(y * TEXTURE_SIZE + x) * 4 + 3] = Math.round(255 * Math.max(0, 1 - distance) ** 1.6)
		}
	}
	const texture = new DataTexture(data, TEXTURE_SIZE, TEXTURE_SIZE, RGBAFormat)
	texture.magFilter = LinearFilter
	texture.minFilter = LinearFilter
	texture.needsUpdate = true
	return texture
}

function matrixOf(item: FlowMap3DNodeItem, cell: FlowMap3DSnapshot['cell']): Matrix4 {
	const size = cell.width * item.scale * BLOB_SCALE
	return new Matrix4().makeScale(size, size, size).setPosition(item.x, item.elevation + BLOB_LIFT, item.z)
}

export function buildBlobs(snapshot: FlowMap3DSnapshot): FlowMap3DBlobs | null {
	if (snapshot.nodes.length === 0) return null
	const geometry = new PlaneGeometry(1, 1)
	geometry.rotateX(-Math.PI / 2)
	const material = new MeshBasicMaterial({
		color: 0x000000,
		map: gradient(),
		transparent: true,
		opacity: BLOB_OPACITY,
		depthWrite: false,
		side: DoubleSide,
	})
	const mesh = new InstancedMesh(geometry, material, snapshot.nodes.length)
	snapshot.nodes.forEach((item, index) => mesh.setMatrixAt(index, matrixOf(item, snapshot.cell)))
	mesh.renderOrder = BLOB_ORDER
	mesh.frustumCulled = false
	const group = new Group()
	group.add(mesh)
	return { group, recolor: () => undefined }
}
