import { computed, ref, watch } from 'vue'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { SCENE_3D_CAMERA_PRESETS } from '@/scene3d/types/scene3d.types'
import type { FlowMap3DPreset } from '../../types/internal/flowMap3dInternal.types'
import { FLOW_MAP_3D_DOCK_PRESETS } from '../../types/internal/flowMap3dInternal.types'
import type { BaseFlowMap3DEmits, FlowMap3DProps } from '../../types/BaseFlowMap3D.types'
import type { FlowModelInternal } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'
import type { FlowMap3DDockParts, FlowMap3DDockPreset, FlowMap3DDockProps } from '../../types/internal/flowMap3dUi.types'

const DEFAULT_PARTICLES = 400
const VIEW_OPTIONS = [
	{ value: '3d', label: UI_FLOW_MAP_3D.VIEW_3D },
	{ value: '2d', label: UI_FLOW_MAP_3D.VIEW_2D },
]
const DOCK_PRESETS: FlowMap3DDockPreset[] = [
	{ value: FLOW_MAP_3D_DOCK_PRESETS[0], text: '1', label: UI_FLOW_MAP_3D.PRESET_1 },
	{ value: FLOW_MAP_3D_DOCK_PRESETS[1], text: '2', label: UI_FLOW_MAP_3D.PRESET_2 },
]

function presetOf(value: string | undefined): FlowMap3DPreset {
	return (SCENE_3D_CAMERA_PRESETS as readonly string[]).includes(value ?? '') ? (value as FlowMap3DPreset) : 'iso'
}

export function useFlowMap3DSettings(props: FlowMap3DProps, emit: BaseFlowMap3DEmits, model: FlowModelInternal) {
	const preset = ref<FlowMap3DPreset>(presetOf(props.camera ?? model.data.value.view3d?.camera))
	const isLayered = ref(props.isLayered ?? model.data.value.view3d?.isLayered ?? false)
	const hasParticles = ref(props.particles !== false && props.particles !== 0)
	watch(
		() => props.isLayered,
		value => value !== undefined && (isLayered.value = value),
	)
	watch(
		() => props.particles,
		value => (hasParticles.value = value !== false && value !== 0),
	)
	return {
		preset,
		isLayered,
		hasParticles,
		getQuality: () => props.quality ?? model.data.value.view3d?.quality ?? 'auto',
		getParticleCount: () => (typeof props.particles === 'number' ? props.particles : DEFAULT_PARTICLES),
		setLayered(value: boolean): void {
			if (isLayered.value === value) return
			isLayered.value = value
			emit('update:isLayered', value)
		},
	}
}

export function useFlowMap3DDock(props: FlowMap3DProps, parts: FlowMap3DDockParts) {
	return computed((): FlowMap3DDockProps => ({
		className: parts.className(),
		shownView: parts.shownView(),
		hasViewSwitch: Boolean(props.has2dToggle) && parts.isSupported() !== false,
		hasLayers: Boolean(props.hasLayersToggle),
		hasCamera: Boolean(props.hasCameraControls),
		hasEdit: Boolean(props.modes?.includes('edit')) && !parts.isNarrow(),
		isEditing: parts.isEditing(),
		hasParticles: parts.hasParticles(),
		isLayered: parts.isLayered(),
		preset: parts.preset(),
		viewOptions: VIEW_OPTIONS,
		presets: DOCK_PRESETS,
	}))
}
