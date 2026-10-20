/** Данные: таблица встроенных 3D-моделей (набор, вид, анимация, значок) — без three, её читает и основной вход */

import { MODEL3D_PRESET_IDS } from '../types/model3d.types'
import type { Model3DAnimation, Model3DPresetId, Model3DPresetInfo, Model3DSet } from '../types/model3d.types'

const service = (kind: string, animation: Model3DAnimation, icon: string): Model3DPresetInfo => ({ set: 'service', kind, animation, icon })
const learning = (icon: string, animation: Model3DAnimation = 'pulse'): Model3DPresetInfo => ({
	set: 'learning',
	kind: null,
	animation,
	icon,
})
const base = (kind: string | null, icon: string): Model3DPresetInfo => ({ set: 'base', kind, animation: 'pulse', icon })

/** Встроенные модели: id — ключи мокапа FlowModels3D; значок — ближайший из набора кита */
export const MODEL3D_PRESETS: Readonly<Record<Model3DPresetId, Model3DPresetInfo>> = {
	laptop: service('client', 'pulse', 'home'),
	phone: service('client', 'pulse', 'cast'),
	gateway: service('gateway', 'gate', 'arrow-right'),
	lock: service('service', 'unlock', 'file-lock'),
	cart: service('service', 'roll', 'inbox'),
	rack: service('service', 'pulse', 'folder'),
	terminal: service('service', 'swipe', 'check-circle'),
	bank: service('external', 'pulse', 'pin'),
	bell: service('service', 'ring', 'bell'),
	ram: service('store', 'blink', 'file-env'),
	db: service('store', 'spin', 'file-sql'),
	conveyor: service('queue', 'flow', 'list-bullet'),
	globe: service('gateway', 'spin', 'link'),
	scales: service('gateway', 'flow', 'sort'),
	search: service('service', 'scan', 'search'),
	analytics: service('service', 'pulse', 'file-json'),
	bucket: service('store', 'pulse', 'folder-open'),
	mailbox: service('service', 'send', 'send'),
	clock: service('service', 'spin', 'calendar'),
	scroll: service('store', 'flow', 'file-txt'),
	monitor: service('service', 'blink', 'eye-open-icon'),
	ai: service('service', 'think', 'star'),
	user: service('actor', 'pulse', 'smile'),
	cloud: service('external', 'pulse', 'upload'),
	server: base('service', 'file-config'),
	shape: base(null, 'tool-polygon'),
	window: learning('file-html'),
	code: learning('code'),
	gear: learning('settings', 'spin'),
	layers: learning('folder'),
	flask: learning('star-filled'),
	rocket: learning('play'),
	book: learning('file-md'),
	shield: learning('file-lock'),
	flag: learning('pin'),
}

/** Запасная модель по виду узла: карта и нотация «сервисы» (client → laptop, store → db…) */
export const MODEL3D_KIND_FALLBACK: Readonly<Record<string, Model3DPresetId>> = {
	client: 'laptop',
	gateway: 'gateway',
	service: 'server',
	store: 'db',
	queue: 'conveyor',
	external: 'cloud',
	actor: 'user',
	laptop: 'laptop',
	phone: 'phone',
	shield: 'lock',
	db: 'db',
	cache: 'ram',
	bus: 'conveyor',
	bank: 'bank',
	server: 'server',
}

/** Это id встроенной модели */
export function isModel3DPreset(id: string): id is Model3DPresetId {
	return Object.hasOwn(MODEL3D_PRESETS, id)
}

/** Id встроенных моделей набора в порядке таблицы */
export function presetsOfSet(set: Model3DSet): Model3DPresetId[] {
	return MODEL3D_PRESET_IDS.filter(id => MODEL3D_PRESETS[id].set === set)
}

/** Запасная модель вида: неизвестный вид — `server` */
export function fallbackForKind(kind: string | undefined): Model3DPresetId {
	return (kind !== undefined && MODEL3D_KIND_FALLBACK[kind]) || 'server'
}
