import { useId } from 'vue'
import { useUi } from '@composables/base/useUi'
import type { CustomColor } from '@composables/base/useCustomColor'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseConfirmEmits, BaseConfirmProps } from '../types/BaseConfirm.types'

const DANGER_COLOR: CustomColor = {
	bg: { base: 'var(--rise-error)', hover: 'var(--rise-error-hover)' },
	text: { base: 'var(--rise-on-error)' },
}

export function useBaseConfirm(props: BaseConfirmProps, emit: BaseConfirmEmits) {
	return {
		...useStandardBaseComponent('base-confirm', props, ['root', 'description', 'cancel', 'confirm']),
		ui: useUi(props, 'base-confirm'),
		dangerColor: DANGER_COLOR,
		descriptionId: useId(),
		finish(result: boolean): void {
			if (!props.isOpen) return
			emit('close', result)
			emit('update:isOpen', false)
			if (result) emit('confirm')
			else emit('cancel')
		},
	}
}
