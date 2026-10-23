import { computed } from 'vue'
import { writer } from './editFields'
import { getFlowEditing } from '../useFlowEditing'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { useFlowMapContext } from '../../context/flowContext'
import type { FlowNode3D } from '../../../types/data/flowData3d.types'

const COLORS = [
	{ value: '', name: () => UI_FLOW_EDITOR.COLOR_NONE },
	{ value: 'var(--rise-info)', name: () => UI_FLOW_EDITOR.COLOR_BLUE },
	{ value: 'var(--rise-primary)', name: () => UI_FLOW_EDITOR.COLOR_INDIGO },
	{ value: 'var(--rise-success)', name: () => UI_FLOW_EDITOR.COLOR_GREEN },
	{ value: 'var(--rise-warning)', name: () => UI_FLOW_EDITOR.COLOR_AMBER },
	{ value: 'var(--rise-error)', name: () => UI_FLOW_EDITOR.COLOR_RED },
	{ value: 'var(--rise-text-muted)', name: () => UI_FLOW_EDITOR.COLOR_GRAY },
]

const ICONS = ['server', 'database', 'shield', 'bell', 'cloud', 'zap', 'user', 'layers', 'monitor', 'smartphone']

function modelPatch(id: string, current: FlowNode3D | undefined): FlowNode3D | undefined {
	if (id === 'auto') return undefined
	return id === 'custom' ? { ...current, url: current?.url ?? '' } : { ...current, model: id, url: undefined }
}

export function useFlowEditStyle(props: { id: string }) {
	const { model } = useFlowMapContext()
	const { context } = getFlowEditing(model)
	const write = writer(context, 'node', props.id)
	const node = computed(() => model.graph.value.nodes.get(props.id))
	const models = computed(() => {
		const ids = new Set(Object.values(model.notation.value.nodeKinds).flatMap(def => (def.model3d ? [def.model3d] : [])))
		return [
			{ value: 'auto', label: UI_FLOW_EDITOR.MODEL_AUTO },
			...[...ids].map(value => ({ value, label: value })),
			{ value: 'custom', label: UI_FLOW_EDITOR.MODEL_CUSTOM },
		]
	})
	const modelValue = computed(() => (node.value?.model3d?.url !== undefined ? 'custom' : (node.value?.model3d?.model ?? 'auto')))
	return {
		node,
		models,
		modelValue,
		isCustom: computed(() => modelValue.value === 'custom'),
		url: computed(() => node.value?.model3d?.url ?? ''),
		colors: computed(() =>
			COLORS.map(item => ({ value: item.value, name: item.name(), isOn: (node.value?.color ?? '') === item.value })),
		),
		icons: ICONS.map(name => ({ name, isOn: () => node.value?.icon === name })),
		appearances: [
			{ value: 'card', label: UI_FLOW_EDITOR.APPEARANCE_CARD },
			{ value: 'compact', label: UI_FLOW_EDITOR.APPEARANCE_COMPACT },
		],
		appearance: computed(() => node.value?.appearance ?? 'card'),
		setColor: (value: string) => write({ color: value || undefined }),
		setIcon: (name: string) => write({ icon: name }),
		setAppearance: (value: string | number | null) => write({ appearance: value }),
		setModel: (value: string | number | (string | number)[]) => {
			const id = String(value)
			const current = node.value?.model3d
			write({ model3d: modelPatch(id, current) })
		},
		setUrl: (value: string | number | null) => write({ model3d: { ...node.value?.model3d, url: String(value ?? '') } }),
		text: {
			color: UI_FLOW_EDITOR.STYLE_COLOR,
			appearance: UI_FLOW_EDITOR.STYLE_APPEARANCE,
			icon: UI_FLOW_EDITOR.STYLE_ICON,
			model: UI_FLOW_EDITOR.STYLE_MODEL,
			url: UI_FLOW_EDITOR.MODEL_URL,
			hint: UI_FLOW_EDITOR.MODEL_HINT,
			setColor: UI_FLOW_EDITOR.COLOR_SET,
		},
	}
}
