import { ref } from 'vue'
import { MODEL3D_PRESETS } from '@/flow3d'
import { LIBRARY_TITLES } from '../../demo/libraryTitles'
import type { FlowMapData } from '@components/BaseFlowMap'
import type { FlowMap3DController, Model3DPresetId } from '@/flow3d'

const SETS = [
	{ id: 'scheme', label: 'На схеме оформления заказа' },
	{ id: 'more', label: 'Ещё в реестре' },
	{ id: 'learning', label: 'Пьедесталы роадмапа' },
	{ id: 'base', label: 'Запасные' },
]
const SCHEME = ['laptop', 'phone', 'gateway', 'lock', 'cart', 'rack', 'terminal', 'bank', 'bell', 'ram', 'db', 'conveyor']
const COLUMNS = 6
const CELL = { x: 200, y: 190 }

const groupOf = (key: string, set: string): string => {
	if (set === 'service') return SCHEME.includes(key) ? 'scheme' : 'more'
	return set === 'learning' ? 'learning' : 'base'
}

export function setup() {
	const controller = ref<FlowMap3DController | null>(null)
	const models = Object.entries(MODEL3D_PRESETS).map(([key, info]) => ({
		key: key as Model3DPresetId,
		title: LIBRARY_TITLES[key],
		kind: info.kind,
		animation: info.animation,
		group: groupOf(key, info.set),
	}))
	const data: FlowMapData = {
		version: 1,
		title: 'Библиотека 3D-моделей',
		layout: { algorithm: 'manual' },
		groups: SETS.map(set => ({ id: set.id, kind: 'group', label: set.label })),
		nodes: models.map((model, index) => ({
			id: model.key,
			kind: 'service',
			label: model.title,
			group: model.group,
			position: { x: (index % COLUMNS) * CELL.x, y: Math.floor(index / COLUMNS) * CELL.y },
			model3d: { model: model.key },
		})),
		edges: [],
	}
	const play = (key: Model3DPresetId, animation: string) => void controller.value?.getModel(key)?.play(animation)

	return { controller, models, data, play }
}
