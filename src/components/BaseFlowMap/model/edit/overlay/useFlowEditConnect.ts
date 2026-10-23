import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { useEditContext } from '../useFlowEditing'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { connectPending } from '../pointer/editLink'
import { centerOf, toScreen } from '../geometry/editGeometry'
import type { FlowEditContext } from '../../../types/internal/edit/flowEditApi.types'

function connectChosen(context: FlowEditContext, ends: { from: string; to: string }): Promise<void> {
	const { nodes } = context.env.model.layout.value
	const origin = nodes[ends.from]
	const goal = nodes[ends.to]
	if (!origin || !goal) return context.commands.connect([{ node: ends.from }, { node: ends.to }]).then(() => undefined)
	return connectPending(context, {
		source: { node: ends.from },
		target: { node: ends.to },
		from: centerOf(origin),
		to: centerOf(goal),
		verdict: 'ok',
	})
}

export function useFlowEditConnect() {
	const context = useEditContext()
	const { model, state, element } = context.env
	const source = state.linkFrom
	const options = computed(() => {
		const from = source.value
		if (!from) return []
		return model.data.value.nodes
			.filter(node => node.id !== from)
			.map(node => {
				const rejected = context.commands.verify([{ node: from }, { node: node.id }])
				return { value: node.id, label: node.label, description: rejected?.message, isDisabled: Boolean(rejected) }
			})
	})
	return {
		isOpen: computed(() => source.value !== null),
		options,
		title: UI_FLOW_EDITOR.CONNECT_TITLE,
		placeholder: UI_FLOW_EDITOR.CONNECT_PLACEHOLDER,
		anchor: computed(() => {
			const rect = source.value ? model.layout.value.nodes[source.value] : undefined
			const box = element.value?.getBoundingClientRect()
			if (!rect) return { x: 0, y: 0 }
			const point = toScreen(centerOf(rect), context.view())
			return { x: (box?.left ?? 0) + point.x, y: (box?.top ?? 0) + point.y }
		}),
		close: () => (source.value = null),
		choose: (value: string | number | null) => {
			const from = source.value
			source.value = null
			if (from && value !== null) void connectChosen(context, { from, to: String(value) })
		},
		describe: (label: string, message: string) => formatMessage(UI_FLOW_EDITOR.CONNECT_DENIED, { label, message }),
	}
}
