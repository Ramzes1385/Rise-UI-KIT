import { edgeColor } from '../../flowMap3dPalette'
import { ConeGeometry, DoubleSide, InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, Vector3 } from 'three'
import type { FlowMap3DArrows, FlowMap3DEdgeItem, FlowMap3DPalette } from '../../../../types/internal/flowMap3dInternal.types'

const ARROW_MARKERS = new Set(['arrow', 'open-arrow', 'double-arrow'])
const ARROW_RADIUS = 0.15
const ARROW_LENGTH = 0.34
const ARROW_FLAT = 0.35
const ARROW_LIFT = 0.02
const DIM_OPACITY = 0.25
const UP = new Vector3(0, 1, 0)

function arrowGeometry(): ConeGeometry {
	const geometry = new ConeGeometry(ARROW_RADIUS, ARROW_LENGTH, 3)
	geometry.rotateZ(-Math.PI / 2)
	geometry.scale(1, ARROW_FLAT, 1)
	geometry.translate(-ARROW_LENGTH / 2, 0, 0)
	return geometry
}

function matrixOf(item: FlowMap3DEdgeItem): Matrix4 {
	const [before, end] = item.points.slice(-2)
	const angle = Math.atan2(-(end.z - before.z), end.x - before.x)
	return new Matrix4().compose(
		new Vector3(end.x, end.y + ARROW_LIFT, end.z),
		new Quaternion().setFromAxisAngle(UP, angle),
		new Vector3(1, 1, 1),
	)
}

export function buildArrows(items: readonly FlowMap3DEdgeItem[], palette: FlowMap3DPalette): FlowMap3DArrows {
	const arrows = items.filter(item => ARROW_MARKERS.has(item.kind.endMarker ?? 'none'))
	const material = new MeshBasicMaterial({ transparent: true, side: DoubleSide })
	if (arrows.length === 0) return { mesh: null, setOpacity: () => undefined, recolor: () => undefined, dispose: () => material.dispose() }
	const mesh = new InstancedMesh(arrowGeometry(), material, arrows.length)
	const paint = (next: FlowMap3DPalette): void => {
		arrows.forEach((item, index) => mesh.setColorAt(index, edgeColor(item, next)))
		mesh.instanceColor!.needsUpdate = true
	}
	arrows.forEach((item, index) => mesh.setMatrixAt(index, matrixOf(item)))
	mesh.frustumCulled = false
	paint(palette)
	return {
		mesh,
		setOpacity: isDim => void (material.opacity = isDim ? DIM_OPACITY : 1),
		recolor: paint,
		dispose: () => {
			mesh.geometry.dispose()
			material.dispose()
		},
	}
}
