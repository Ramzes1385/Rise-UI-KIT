import { Color } from 'three'
import { buildRoad } from '../../../model/scene/build/buildRoad'
import { stagesData } from '../../fixtures/roadmap3d.test-utils'
import { InstancedMesh, Mesh, type ShaderMaterial } from 'three'
import { buildDecor } from '../../../model/scene/build/buildDecor'
import { buildIsland } from '../../../model/scene/build/buildIsland'
import { roadmapColors } from '../../../model/scene/roadmap3dPalette'
import { buildMarkers } from '../../../model/scene/build/buildMarkers'
import { snapshotOf, testPalette } from '../../fixtures/model.test-utils'
import { buildPedestals } from '../../../model/scene/build/buildPedestals'
import { createRoadMaterial } from '../../../model/scene/build/roadMaterial'
import { buildIsland as buildIslandModel } from '../../../model/island/islandDecor'
import { GEM, gemPoints, ringArc, topicColor } from '../../../model/scene/build/pedestalParts'
import type { Roadmap3DStageItem, Roadmap3DStates } from '../../../types/internal/roadmap3dInternal.types'

const IDLE: Roadmap3DStates = { hover: null, focus: null, selected: null, currentId: null }
const DETAIL = { hasTrees: true, hasClouds: true, hasShadows: true }

function meshes(group: { traverse: (visit: (item: object) => void) => void }): Mesh[] {
	const found: Mesh[] = []
	group.traverse(item => item instanceof Mesh && found.push(item))
	return found
}

describe('buildIsland', () => {
	it('плита, кайма и уступы', () => {
		const snapshot = snapshotOf()
		const part = buildIsland(snapshot.island, testPalette())
		expect(part.group.children).toHaveLength(2 + snapshot.island.terraces.length)
		part.recolor(testPalette())
	})

	it('без уступов нет каймы; у слишком короткого внутреннего контура нет дыры', () => {
		const island = snapshotOf().island
		const none = buildIsland({ ...island, terraces: [] }, testPalette())
		expect(none.group.children).toHaveLength(1)
		const tiny = buildIsland({ ...island, terraces: [{ level: 0, points: island.terraces[0].points.slice(0, 2) }] }, testPalette())
		expect(tiny.group.children).toHaveLength(3)
		tiny.recolor(testPalette())
	})
})

describe('buildRoad', () => {
	it('четыре ленты; пройденная часть ограничена 0..1', () => {
		const road = snapshotOf().island.layout.road
		const part = buildRoad(road, testPalette())
		expect(part.group.children).toHaveLength(4)
		const done = (part.group.children[2] as Mesh).material as ShaderMaterial
		part.setProgress(0.4)
		expect(done.uniforms.uProgress.value).toBe(0.4)
		part.setProgress(3)
		expect(done.uniforms.uProgress.value).toBe(1)
		part.setProgress(-1)
		expect(done.uniforms.uProgress.value).toBe(0)
		part.recolor(testPalette())
	})

	it('материал дороги: цвета и ширина копируются', () => {
		const material = createRoadMaterial(new Color('#ff0000'), new Color('#00ff00'), 2)
		expect(material.uniforms.uWidth.value).toBe(2)
		expect(material.uniforms.uFrom.value.r).toBe(1)
	})
})

describe('buildMarkers', () => {
	it('машинка ставится на дорогу и поворачивается вдоль неё', () => {
		const snapshot = snapshotOf()
		const markers = buildMarkers({ road: snapshot.island.layout.road, table: snapshot.table, hasCar: true }, testPalette())
		const car = markers.group.children[0]
		expect(car.visible).toBe(true)
		markers.setCar(0)
		const start = car.position.clone()
		markers.setCar(0.5)
		expect(car.position.distanceTo(start)).toBeGreaterThan(1)
		markers.setCar(1)
		markers.recolor(testPalette())
	})

	it('без машинки или с дорогой из одной точки её не видно и она не двигается', () => {
		const snapshot = snapshotOf()
		const noCar = buildMarkers({ road: snapshot.island.layout.road, table: snapshot.table, hasCar: false }, testPalette())
		expect(noCar.group.children[0].visible).toBe(false)
		const short = buildMarkers({ road: [{ x: 0, z: 0 }], table: { cumulative: [0], total: 0 }, hasCar: true }, testPalette())
		expect(short.group.children[0].visible).toBe(false)
		short.setCar(0.5)
		expect(short.group.children[0].position.x).toBe(0)
	})

	it('пин: ставится над этапом, прячется на null, качается по времени', () => {
		const snapshot = snapshotOf()
		const markers = buildMarkers({ road: snapshot.island.layout.road, table: snapshot.table, hasCar: true }, testPalette())
		const pin = markers.group.children[1]
		expect(pin.visible).toBe(false)
		markers.setPin(snapshot.stages[1].position)
		expect(pin.visible).toBe(true)
		const base = pin.position.y
		markers.bob(Math.PI / 4.8)
		expect(pin.position.y).not.toBe(base)
		markers.setPin(null)
		expect(pin.visible).toBe(false)
	})
})

describe('pedestalParts', () => {
	it('ringArc строит дугу по доле круга', () => {
		expect(ringArc(0.5).parameters.thetaLength).toBeCloseTo(-Math.PI)
	})

	it('topicColor: альтернатива, пройдено, идёт, закрыто, остальное', () => {
		const colors = roadmapColors(testPalette())
		expect(topicColor('done', true, colors)).toBe(colors.alternative)
		expect(topicColor('done', false, colors)).toBe(colors.success)
		expect(topicColor('current', false, colors)).toBe(colors.primary)
		expect(topicColor('locked', false, colors)).toBe(colors.locked)
		expect(topicColor('available', false, colors)).toBe(colors.neutral)
	})

	it('gemPoints: по камню на тему, не больше лимита; один камень — по центру дуги', () => {
		const snapshot = snapshotOf()
		const gems = gemPoints(snapshot.stages)
		expect(gems.map(gem => gem.id)).toEqual(['html', 'css', 'vue', 'react', 'svelte', 'vite'])
		const single = gemPoints([snapshot.stages[2]])
		expect(single).toHaveLength(1)
		const many: Roadmap3DStageItem = {
			...snapshot.stages[0],
			topics: Array.from({ length: GEM.limit + 5 }, (_, index) => ({
				id: `g${index}`,
				title: 'G',
				status: 'available',
				isAlternative: false,
				isOptional: false,
			})),
		}
		expect(gemPoints([many])).toHaveLength(GEM.limit)
	})
})

describe('buildPedestals', () => {
	it('пьедестал на этап, якоря этапов и тем, камни как InstancedMesh', () => {
		const snapshot = snapshotOf()
		const part = buildPedestals(snapshot.stages, testPalette())
		expect(part.anchors.size).toBe(4 + 6)
		const gemMesh = part.group.children.at(-1) as InstancedMesh
		expect(gemMesh.count).toBe(6)
		expect(part.group.children).toHaveLength(5)
	})

	it('состояния: наведённый и сфокусированный приподняты, кольцо видно при проценте > 0', () => {
		const snapshot = snapshotOf()
		const part = buildPedestals(snapshot.stages, testPalette())
		part.setStates({ ...IDLE, hover: 'basics', focus: 'frame' })
		expect(part.group.children[0].position.y).toBeGreaterThan(0)
		expect(part.group.children[1].position.y).toBeGreaterThan(0)
		expect(part.group.children[2].position.y).toBe(0)
		const arcOf = (index: number) => part.group.children[index].children[4]
		expect(arcOf(0).visible).toBe(true)
		expect(arcOf(2).visible).toBe(false)
		part.setStates(IDLE)
		expect(part.group.children[0].position.y).toBe(0)
	})

	it('update пересобирает дугу при новом проценте, при том же — оставляет', () => {
		const snapshot = snapshotOf()
		const part = buildPedestals(snapshot.stages, testPalette())
		const arc = part.group.children[1].children[4] as Mesh
		const geometry = arc.geometry
		part.update(snapshot.stages)
		expect(arc.geometry).toBe(geometry)
		part.update(snapshot.stages.map((item, index) => (index === 1 ? { ...item, percent: 70 } : item)))
		expect(arc.geometry).not.toBe(geometry)
		expect(arc.visible).toBe(true)
		part.recolor(testPalette())
	})

	it('тема без записи в снимке красится нейтральным цветом', () => {
		const snapshot = snapshotOf()
		const part = buildPedestals(snapshot.stages, testPalette())
		part.update(snapshot.stages.map(item => ({ ...item, topics: [] })))
		const gemMesh = part.group.children.at(-1) as InstancedMesh
		expect(gemMesh.instanceColor).not.toBeNull()
	})
})

describe('buildDecor', () => {
	it('горы, флаг, деревья и облака; облака плывут', () => {
		const island = snapshotOf(stagesData(24), undefined).island
		const part = buildDecor(island, testPalette(), DETAIL)
		const instanced = part.group.children.filter((item): item is InstancedMesh => item instanceof InstancedMesh)
		expect(instanced.length).toBe(5)
		const cloud = instanced.at(-1) as InstancedMesh
		const before = cloud.instanceMatrix.array.slice()
		part.drift(5)
		expect(Array.from(cloud.instanceMatrix.array)).not.toEqual(Array.from(before))
		part.recolor(testPalette())
	})

	it('без деревьев и облаков они не строятся, drift ничего не делает', () => {
		const island = buildIslandModel(3, 2, 5)
		const part = buildDecor(island, testPalette(), { ...DETAIL, hasTrees: false, hasClouds: false })
		expect(part.group.children.some(item => item instanceof InstancedMesh)).toBe(false)
		expect(() => part.drift(1)).not.toThrow()
	})

	it('мелкая выборка: каждый вид дерева размещён', () => {
		const island = buildIslandModel(24, 4, 11)
		const kinds = new Set(island.trees.map(tree => tree.kind))
		expect(kinds).toEqual(new Set([0, 1, 2]))
		expect(meshes(buildDecor(island, testPalette(), DETAIL).group).length).toBeGreaterThan(0)
	})
})
