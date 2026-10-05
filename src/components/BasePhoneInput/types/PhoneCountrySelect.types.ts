import type { UiClassFn } from '@composables/base/useUi'
import type { BasePhoneInputPart, PhoneCountry } from './BasePhoneInput.types'

/** Пропсы списка стран у поля телефона */
export interface PhoneCountrySelectProps {
	/** Страны списка */
	countries: readonly PhoneCountry[]
	/** Код выбранной страны */
	modelValue: string
	/** Выбор страны недоступен */
	isDisabled: boolean
	/** Масштаб */
	sizeScale: number
	/** Свой класс обёртки (`customClass.country` поля) */
	countryClass?: string
	/** Классы частей поля (`ui` компонента BasePhoneInput) */
	ui: UiClassFn<BasePhoneInputPart>
}

/** События списка стран */
export interface PhoneCountrySelectEmits {
	/** Выбрана страна: её код */
	(event: 'update:modelValue', code: string): void
}
