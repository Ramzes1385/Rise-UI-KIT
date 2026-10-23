import { ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import type { BaseToolbarProps } from '../types/BaseToolbar.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useToolbarKeyboard } from '@composables/interaction/useToolbarKeyboard'

export function useBaseToolbar(props: BaseToolbarProps) {
	const standard = useStandardBaseComponent('base-toolbar', props, ['root'])
	const rootRef = ref<HTMLElement | null>(null)
	const { handleKeydown, handleFocusin } = useToolbarKeyboard({
		rootRef,
		orientation: () => (props.orientation === 'vertical' ? 'vertical' : 'horizontal'),
	})

	return {
		...standard,
		ui: useUi(props, 'base-toolbar'),
		rootRef,
		handleKeydown,
		handleFocusin,
	}
}
