import { computed } from 'vue'
import { useEditContext } from '../useFlowEditing'
import { toScreen } from '../geometry/editGeometry'
import { UI_FLOW_EDITOR } from '@/locales/messages'

export function useFlowEditPending() {
	const context = useEditContext()
	const link = context.env.state.link
	return {
		isPending: computed(() => link.value?.verdict === 'pending'),
		label: UI_FLOW_EDITOR.CONNECT_PENDING,
		style: computed(() => {
			const point = link.value ? toScreen(link.value.to, context.view()) : { x: 0, y: 0 }
			return { left: `${point.x + 8}px`, top: `${point.y + 8}px` }
		}),
	}
}
