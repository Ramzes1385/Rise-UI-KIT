import type { FLOW_MAP_3D_DOCK_PRESETS } from './flowMap3dInternal.types'

/** Кнопка пресета камеры в нижней панели */
export interface FlowMap3DDockPreset {
	value: (typeof FLOW_MAP_3D_DOCK_PRESETS)[number]
	text: string
	label: string
}

/** Пропсы нижней панели */
export interface FlowMap3DDockProps {
	className: string
	shownView: '3d' | '2d'
	hasViewSwitch: boolean
	hasLayers: boolean
	hasCamera: boolean
	hasEdit: boolean
	isEditing: boolean
	hasParticles: boolean
	isLayered: boolean
	preset: string
	viewOptions: Array<{ value: string; label: string }>
	presets: FlowMap3DDockPreset[]
}

/** Пропсы колонки масштаба */
export interface FlowMap3DZoomProps {
	className: string
	isMax: boolean
	isMin: boolean
}

/** Источники пропсов нижней панели */
export interface FlowMap3DDockParts {
	className: () => string
	shownView: () => '3d' | '2d'
	isSupported: () => boolean | null
	isNarrow: () => boolean
	isEditing: () => boolean
	hasParticles: () => boolean
	isLayered: () => boolean
	preset: () => string
}
