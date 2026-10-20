import type { Color } from 'three'
import { toWorld } from '../roadmap3dSpace'
import { roadmapColors } from '../roadmap3dPalette'
import type { IslandModel, IslandTree } from '../../../types/roadmap3dIsland.types'
import type { Roadmap3DColors, Roadmap3DDecor, Roadmap3DDetail, Roadmap3DPalette } from '../../../types/internal/roadmap3dInternal.types'
import {
	BoxGeometry,
	ConeGeometry,
	CylinderGeometry,
	DoubleSide,
	Group,
	IcosahedronGeometry,
	InstancedMesh,
	Matrix4,
	Mesh,
	MeshStandardMaterial,
	Quaternion,
	Vector3,
} from 'three'

const CLOUD_PUFFS: ReadonlyArray<readonly [number, number, number]> = [
	[0, 0, 1],
	[0.55, -0.1, 0.75],
	[-0.5, -0.12, 0.7],
]
const DRIFT = { span: 0.5, speed: 0.12 }
const IDENTITY = new Quaternion()

function standard(flat = true): MeshStandardMaterial {
	return new MeshStandardMaterial({ roughness: 0.8, flatShading: flat })
}

function place(mesh: InstancedMesh, index: number, pose: { position: Vector3; scale: Vector3 }): void {
	mesh.setMatrixAt(index, new Matrix4().compose(pose.position, IDENTITY, pose.scale))
}

function paintAll(mesh: InstancedMesh, color: Color): void {
	for (let index = 0; index < mesh.count; index++) mesh.setColorAt(index, color)
	if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
}

function buildMountains(island: IslandModel, group: Group) {
	const body = standard()
	const snow = standard()
	for (const mountain of island.mountains) {
		const peak = new Mesh(new ConeGeometry(mountain.radius, mountain.height, 7, 1), body)
		peak.position.copy(toWorld(mountain, mountain.height / 2))
		peak.castShadow = true
		const capHeight = mountain.height * mountain.snow
		const cap = new Mesh(new ConeGeometry(mountain.radius * mountain.snow, capHeight, 7, 1), snow)
		cap.position.copy(toWorld(mountain, mountain.height - capHeight / 2))
		group.add(peak, cap)
	}
	return { body, snow }
}

function createFoliage(kinds: readonly (readonly IslandTree[])[]): InstancedMesh[] {
	const cone = (count: number) => new InstancedMesh(new ConeGeometry(0.34, 0.8, 7), standard(), Math.max(count, 1))
	const ball = (count: number) => new InstancedMesh(new IcosahedronGeometry(0.34, 0), standard(), Math.max(count, 1))
	const meshes = [cone(kinds[0].length), ball(kinds[1].length), cone(kinds[2].length * 2)]
	meshes.forEach((mesh, index) => (mesh.count = index === 2 ? kinds[2].length * 2 : kinds[index].length))
	return meshes
}

function placeTree(
	parts: { trunk: InstancedMesh; foliage: InstancedMesh[] },
	tree: IslandTree,
	slots: { trunk: number; index: number },
): void {
	const size = new Vector3(tree.scale, tree.scale, tree.scale)
	const at = (lift: number) => toWorld(tree, lift * tree.scale)
	place(parts.trunk, slots.trunk, { position: at(0.15), scale: size })
	if (tree.kind === 0) place(parts.foliage[0], slots.index, { position: at(0.7), scale: size })
	if (tree.kind === 1) place(parts.foliage[1], slots.index, { position: at(0.55), scale: size })
	if (tree.kind === 2) {
		place(parts.foliage[2], slots.index * 2, { position: at(0.55), scale: size })
		place(parts.foliage[2], slots.index * 2 + 1, { position: at(0.95), scale: size.clone().multiplyScalar(0.75) })
	}
}

function buildTrees(trees: readonly IslandTree[], group: Group) {
	const kinds = [0, 1, 2].map(kind => trees.filter(tree => tree.kind === kind))
	const trunk = new InstancedMesh(new CylinderGeometry(0.06, 0.08, 0.3, 6), standard(false), Math.max(trees.length, 1))
	trunk.count = trees.length
	const parts = { trunk, foliage: createFoliage(kinds) }
	let slot = 0
	kinds.forEach(list => list.forEach((tree, index) => placeTree(parts, tree, { trunk: slot++, index })))
	;[trunk, ...parts.foliage].forEach(mesh => {
		mesh.castShadow = true
		group.add(mesh)
	})
	return parts
}

function buildClouds(island: IslandModel, group: Group) {
	const puffs = island.clouds.length * CLOUD_PUFFS.length
	const material = new MeshStandardMaterial({ roughness: 1, flatShading: true })
	const mesh = new InstancedMesh(new IcosahedronGeometry(0.5, 1), material, Math.max(puffs, 1))
	mesh.count = puffs
	group.add(mesh)
	function drift(time: number): void {
		island.clouds.forEach((cloud, index) => {
			const sway = Math.sin(time * DRIFT.speed + index * 1.7) * DRIFT.span
			CLOUD_PUFFS.forEach(([x, y, size], puff) => {
				const position = toWorld(cloud, cloud.y + y * cloud.scale).add(new Vector3(x * cloud.scale + sway, 0, 0))
				const scale = new Vector3(size * cloud.scale, size * cloud.scale * 0.8, size * cloud.scale)
				place(mesh, index * CLOUD_PUFFS.length + puff, { position, scale })
			})
		})
		mesh.instanceMatrix.needsUpdate = true
	}
	drift(0)
	return { mesh, drift }
}

function buildGoal(island: IslandModel, group: Group) {
	const { goal } = island.layout
	const pole = new Mesh(new CylinderGeometry(0.04, 0.04, 1.6, 8), standard(false))
	const flag = new Mesh(new BoxGeometry(0.7, 0.4, 0.02), new MeshStandardMaterial({ roughness: 0.6, side: DoubleSide }))
	const peak = island.mountains.reduce((best, item) => (item.height > best.height ? item : best), { height: 0, x: goal.x, z: goal.z })
	const base = toWorld(peak)
	pole.position.copy(base).setY(peak.height + 0.8)
	flag.position.copy(base).add(new Vector3(0.38, peak.height + 1.4, 0))
	group.add(pole, flag)
	return { pole, flag }
}

function paintTrees(parts: ReturnType<typeof buildTrees>, colors: Roadmap3DColors): void {
	paintAll(parts.trunk, colors.trunk)
	const kinds: Color[] = [colors.cones[0], colors.round, colors.cones[1]]
	parts.foliage.forEach((mesh, index) => paintAll(mesh, kinds[index]))
}

export function buildDecor(island: IslandModel, source: Roadmap3DPalette, detail: Roadmap3DDetail): Roadmap3DDecor {
	const group = new Group()
	const mountains = buildMountains(island, group)
	const goal = buildGoal(island, group)
	const trees = detail.hasTrees ? buildTrees(island.trees, group) : null
	const clouds = detail.hasClouds ? buildClouds(island, group) : null

	function recolor(next: Roadmap3DPalette): void {
		const colors = roadmapColors(next)
		mountains.body.color.copy(colors.mountain)
		mountains.snow.color.copy(colors.snow)
		;(goal.flag.material as MeshStandardMaterial).color.copy(next.resolve('var(--rise-chart-2)'))
		;(goal.pole.material as MeshStandardMaterial).color.copy(colors.snow)
		if (trees) paintTrees(trees, colors)
		if (clouds) (clouds.mesh.material as MeshStandardMaterial).color.copy(colors.cloud)
	}

	recolor(source)
	return { group, recolor, drift: time => clouds?.drift(time) }
}
