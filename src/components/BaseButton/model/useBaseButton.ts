/** Composable: логика BaseButton — отступы и клик с учётом загрузки */
import { computed, ref } from 'vue'
import { usePadding } from '@composables/usePadding'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseButtonEmits, BaseButtonProps } from '../types/BaseButton.types'

export function useBaseButton(props: BaseButtonProps, emit: BaseButtonEmits) {
	const buttonRef = ref<HTMLButtonElement | null>(null)
	const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--btn-pad' })

	return {
		...useStandardBaseComponent('base-button', props, ['root']),
		buttonRef,
		/** Без пропа padding отступы берутся из токенов темы (--rise-control-padding-*), inline-переменные не пишутся */
		paddingStyle: computed(() => (props.padding === undefined ? undefined : paddingStyle.value)),
		/**
		 * Во время загрузки кнопка не получает нативный `disabled`: иначе сфокусированная кнопка выпадает из фокус-порядка
		 * и браузер сбрасывает фокус на body. Она помечена aria-disabled/aria-busy, а активация гасится здесь: preventDefault
		 * отменяет и отправку формы для type="submit"/"reset", stopPropagation не пускает клик к обработчикам предков
		 * (как нативный disabled: `<tr @click>` вокруг кнопки не срабатывает).
		 */
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
