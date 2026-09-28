import type { BaseSelectEmits, BaseSelectProps } from '@components/BaseSelect/types/BaseSelect.types'

export interface UseSelectOptions {
	props: BaseSelectProps
	emit: BaseSelectEmits
	onBlur: () => void
	/** Блокировка с учётом формы вокруг; без неё — `props.isDisabled` */
	isDisabled?: () => boolean
}
