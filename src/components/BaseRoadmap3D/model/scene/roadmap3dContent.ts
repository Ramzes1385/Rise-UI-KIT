import { Group } from 'three'
import type { Vector3 } from 'three'
import { warn } from '@/locales/warn'
import { buildRoad } from './build/buildRoad'
import { buildDecor } from './build/buildDecor'
import { buildIsland } from './build/buildIsland'
import { UI_ROADMAP_3D } from '@/locales/messages'
import { buildMarkers } from './build/buildMarkers'
import { buildPedestals } from './build/buildPedestals'
import { createSceneLights } from '@/scene3d/scene/lights'
import { disposeObject } from '@/scene3d/scene/disposeObject'
import { createModelRegistry } from '@/scene3d/models/registry'
import { PEDESTAL, roadmapFrame, toWorld } from './roadmap3dSpace'
import { ROADMAP_3D_GOAL, ROADMAP_3D_START } from '../data/roadmap3dTags'
import type {
	Roadmap3DBuildOptions,
	Roadmap3DContent,
	Roadmap3DFrame,
	Roadmap3DPalette,
	Roadmap3DSnapshot,
	Roadmap3DStageItem,
	Roadmap3DStates,
} from '../../types/internal/roadmap3dInternal.types'

const CELL = { width: 1.3, depth: 1.3, height: 1.4 }
const IDLE: Roadmap3DStates = { hover: null, focus: null, selected: null, currentId: null }

function createRegistry(options: Roadmap3DBuildOptions, getPalette: () => Roadmap3DPalette) {
	const { runtime } = options
	return createModelRegistry({
		cache: runtime.cache,
		loop: runtime.loop,
		getPalette: () => getPalette().palette,
		resolveColor: css => getPalette().resolve(css),
		getModels: runtime.getModels,
		appModels: options.appModels,
		modelResolver: options.modelResolver,
		fallback: 'book',
		wordSets: ['learning'],
		cell: CELL,
		isReducedMotion: runtime.isReducedMotion,
		gltf: options.gltf,
		onModelReady: runtime.onModelReady,
		onFocus: runtime.onFocus,
		warn: message => warn(UI_ROADMAP_3D.WARN_MODEL, { message }),
	})
}

function selectionKey(item: Roadmap3DStageItem): string {
	const { model3d } = item.selection
	return [item.title, model3d?.model ?? '', model3d?.url ?? ''].join('|')
}

function createModels(options: Roadmap3DBuildOptions, getPalette: () => Roadmap3DPalette, root: Group) {
	const registry = createRegistry(options, getPalette)
	const models = new Group()
	options.snapshot.stages.forEach(item => {
		const node = registry.add(item.id, item.selection)
		node.position.set(item.position.x, PEDESTAL, item.position.z)
		models.add(node)
	})
	models.add(registry.object)
	root.add(models)
	registry.commit()
	registry.sync()
	const tints = new Map<string, string>()
	const keys = new Map(options.snapshot.stages.map(item => [item.id, selectionKey(item)]))

	function paint(items: readonly Roadmap3DStageItem[], states: Roadmap3DStates): void {
		items.forEach(item => {
			registry.setState(item.id, {
				isHovered: states.hover === item.id,
				isSelected: states.selected === item.id,
				isActive: states.currentId === item.id,
				isDimmed: states.focus !== null && states.focus !== item.id,
				isFocused: states.focus === item.id,
				tone: item.status === 'locked' ? 'muted' : 'none',
				isDragging: false,
				isInvalid: false,
			})
			if (tints.get(item.id) === item.tint) return
			tints.set(item.id, item.tint)
			registry.getHandle(item.id)?.setColor(item.tint, 'body')
		})
	}

	function refresh(items: readonly Roadmap3DStageItem[]): void {
		items.forEach(item => {
			if (keys.get(item.id) === selectionKey(item)) return
			keys.set(item.id, selectionKey(item))
			registry.update(item.id, item.selection)
			tints.delete(item.id)
		})
		registry.commit()
		registry.sync()
	}

	return { registry, paint, refresh }
}

function anchorsOf(snapshot: Roadmap3DSnapshot, base: ReadonlyMap<string, Vector3>): Map<string, Vector3> {
	const anchors = new Map(base)
	const { layout, mountains } = snapshot.island
	const peak = mountains.reduce((best, item) => (item.height > best.height ? item : best), {
		height: 0,
		x: layout.goal.x,
		z: layout.goal.z,
	})
	if (layout.road[0]) anchors.set(ROADMAP_3D_START, toWorld(layout.road[0], 0.7))
	anchors.set(ROADMAP_3D_GOAL, toWorld(peak, peak.height + 1.9))
	return anchors
}

function createLights(options: Roadmap3DBuildOptions, frame: Roadmap3DFrame) {
	const lights = createSceneLights(options.palette.palette.isDark)
	lights.key.castShadow = options.detail.hasShadows
	lights.fitShadow(frame.bounds)
	return lights
}

function buildParts(options: Roadmap3DBuildOptions, frame: Roadmap3DFrame) {
	const { snapshot, palette } = options
	const lights = createLights(options, frame)
	const road = buildRoad(snapshot.island.layout.road, palette)
	const pedestals = buildPedestals(snapshot.stages, palette)
	const markers = buildMarkers({ road: snapshot.island.layout.road, table: snapshot.table, hasCar: snapshot.hasCar }, palette)
	const decor = buildDecor(snapshot.island, palette, options.detail)
	const island = buildIsland(snapshot.island, palette)
	const root = new Group()
	root.add(island.group, road.group, pedestals.group, markers.group, decor.group, lights.group)
	return { root, lights, road, pedestals, markers, decor, island }
}

export function buildContent(options: Roadmap3DBuildOptions): Roadmap3DContent {
	const { snapshot } = options
	let palette = options.palette
	const frame = roadmapFrame(snapshot.island.bounds)
	const { root, lights, road, pedestals, markers, decor, island } = buildParts(options, frame)
	const models = createModels(options, () => palette, root)
	const themed = [island, road, pedestals, markers, decor]
	let items = snapshot.stages
	models.paint(items, IDLE)
	markers.setPin(snapshot.currentIndex >= 0 ? items[snapshot.currentIndex].position : null)

	return {
		root,
		registry: models.registry,
		road,
		markers,
		pedestals,
		decor,
		anchors: anchorsOf(snapshot, pedestals.anchors),
		bounds: frame.bounds,
		setStates: states => {
			pedestals.setStates(states)
			models.paint(items, states)
		},
		update: (next, states) => {
			items = next.stages
			models.refresh(items)
			pedestals.update(items)
			markers.setPin(next.currentIndex >= 0 ? items[next.currentIndex].position : null)
			pedestals.setStates(states)
			models.paint(items, states)
		},
		recolor: next => {
			palette = next
			themed.forEach(part => part.recolor(next))
			lights.setDark(next.palette.isDark)
			models.registry.refreshTheme()
		},
		dispose: () => {
			disposeObject(root)
			models.registry.dispose()
			lights.dispose()
		},
	}
}
