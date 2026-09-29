import { computed, ref } from 'vue'
import { usePadding } from '@composables/base/usePadding'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseButtonEmits, BaseButtonProps } from '../types/BaseButton.types'

export function useBaseButton(props: BaseButtonProps, emit: BaseButtonEmits) {
	const buttonRef = ref<HTMLButtonElement | null>(null)
	const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--btn-pad' })

	return {
		...useStandardBaseComponent('base-button', props, ['root']),
		buttonRef,
		paddingStyle: computed(() => (props.padding === undefined ? undefined : paddingStyle.value)),
		handleClick(event: MouseEvent): void {
			if (props.isLoading) {
				event.preventDefault()
				event.stopPropagation()
				return
			}
			if (props.isDisabled) return
			emit('click', event)
		},
		exposed: { buttonRef, focus: () => buttonRef.value?.focus(), blur: () => buttonRef.value?.blur() },
	}
}
