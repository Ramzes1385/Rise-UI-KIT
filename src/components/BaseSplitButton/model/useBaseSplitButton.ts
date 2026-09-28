/** Composable: логика BaseSplitButton — классы частей; вид, размер и цвет задают сами кнопки */
import { useCustomClass } from '@composables/useCustomClass'
import type { BaseSplitButtonProps } from '../types/BaseSplitButton.types'

export function useBaseSplitButton(props: BaseSplitButtonProps) {
	return useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'main', 'toggle'] })
}
