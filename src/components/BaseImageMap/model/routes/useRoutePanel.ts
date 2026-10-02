import { nextTick, useTemplateRef } from 'vue'
import type { ImageMapRoutePanelEmits, ImageMapRoutePanelProps } from '../../types/ImageMapRoutes.types'

export function useRoutePanel(props: ImageMapRoutePanelProps, emit: ImageMapRoutePanelEmits) {
	const fromRef = useTemplateRef<{ focus: () => void }>('fromRef')
	return {
		async clear(): Promise<void> {
			emit('update:value', { from: null, to: null, isStepFree: props.value.isStepFree })
			await nextTick()
			fromRef.value?.focus()
		},
	}
}
