/** Composable: логика BaseConfirm — закрытие окна с результатом */
import { useId } from 'vue'
import type { CustomColor } from '@composables/useCustomColor'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseConfirmEmits, BaseConfirmProps } from '../types/BaseConfirm.types'

const DANGER_COLOR: CustomColor = {
	bg: { base: 'var(--rise-error)', hover: 'var(--rise-error-hover)' },
	text: { base: 'var(--rise-on-error)' },
}

export function useBaseConfirm(props: BaseConfirmProps, emit: BaseConfirmEmits) {
	return {
		...useStandardBaseComponent('base-confirm', props, ['root', 'description', 'cancel', 'confirm']),
		dangerColor: DANGER_COLOR,
		descriptionId: useId(),
		/** Закрывает окно с результатом. `close` идёт первым: по нему BaseApp разрешает промис useConfirm() */
		finish(result: boolean): void {
			if (!props.isOpen) return
			emit('close', result)
			emit('update:isOpen', false)
			if (result) emit('confirm')
			else emit('cancel')
		},
	}
}
