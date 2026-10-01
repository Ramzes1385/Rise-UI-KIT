import type { Ref } from 'vue'
import type { DateFormat } from '@utils/data/dateUtils'
import type { CalendarSelectionMode } from '@components/BaseCalendar'

export interface UseDatePickerStateOptions {
	props: {
		modelValue?: Date | null
		modelValueEnd?: Date | null
		selectedDates?: Date[]
		isDisabled?: boolean
		isMultiMonth?: boolean
		sizeScale?: number
	}
	resolvedProps: {
		value: {
			selectionMode: CalendarSelectionMode
			dateFormat: DateFormat
			isDisabled: boolean
			isMultiMonth: boolean
			/** Предел числа месяцев в панели при isMultiMonth */
			maxMonths?: number
			sizeScale: number
			closeOnClickOutside: boolean
			closeOnEscape: boolean
			gap: number
			isClearable?: boolean
			isReadonly?: boolean
			isRequired?: boolean
			placeholder?: string
			label?: string
			error?: string
			inputVariant?: string
			calendarVariant?: string
		}
	}
	emit: {
		(event: 'update:modelValue', value: Date | null): void
		(event: 'update:modelValueEnd', value: Date | null): void
		(event: 'update:selectedDates', value: Date[]): void
		(event: 'open'): void
		(event: 'close'): void
		(event: 'clear'): void
		(event: 'range-select', start: Date, end: Date): void
	}
	calendarConfig: {
		value: {
			showTime: boolean
			showSeconds: boolean
			is24Hour: boolean
			locale: string
			/** Номера недель: колонка расширяет календарь, это учитывается при подсчёте месяцев в панели */
			showWeekNumber?: boolean
		}
	}
}

/** Экземпляр панели дейтпикера: корневой элемент панели */
export interface DatePickerPanelInstance {
	panelRef: HTMLElement | null
}

/** Внутренние значения дейтпикера — используются, пока v-model не задан */
export interface DatePickerInnerValues {
	innerValue: Ref<Date | null>
	innerValueEnd: Ref<Date | null>
	innerDates: Ref<Date[]>
}

/** Размеры для подсчёта месяцев, которые помещаются в панель */
export interface DatePickerMonthsFit {
	/** Ширина поля, px */
	width: number
	/** Масштаб размеров, % */
	sizeScale: number
	/** Колонка номеров недель */
	showWeekNumber?: boolean
	/** Предел числа месяцев */
	maxMonths?: number
}

export interface UseDatePickerPanelSizeOptions extends Pick<UseDatePickerStateOptions, 'resolvedProps' | 'calendarConfig'> {
	wrapperRef: Ref<HTMLElement | null>
}

export interface UseDatePickerPopupOptions extends Pick<UseDatePickerStateOptions, 'resolvedProps' | 'emit'> {
	wrapperRef: Ref<HTMLElement | null>
	panelRef: Ref<DatePickerPanelInstance | null>
	wrapperWidth: Ref<number>
}

/** Источники закрытия панели: клик вне поля и панели, Escape */
export interface DatePickerDismissOptions extends Pick<UseDatePickerStateOptions, 'resolvedProps'> {
	wrapperRef: Ref<HTMLElement | null>
	panelEl: Ref<HTMLElement | null>
	isOpen: Ref<boolean>
	close: () => void
}

export interface UseDatePickerHandlersOptions extends Pick<UseDatePickerStateOptions, 'resolvedProps' | 'emit' | 'calendarConfig'> {
	values: DatePickerInnerValues
	close: () => void
}
