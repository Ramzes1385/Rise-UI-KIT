import type { BaseSelectEmits, BaseSelectProps } from '@components/BaseSelect/model/BaseSelect.types'

/** Опции composable useSelect */
export interface UseSelectOptions {
	props: BaseSelectProps
	emit: BaseSelectEmits
	onBlur: () => void
}
