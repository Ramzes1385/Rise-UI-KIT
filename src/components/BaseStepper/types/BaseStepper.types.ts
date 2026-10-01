import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export interface BaseStepperStep {
	/** Заголовок */
	label: string
	/** Описание */
	description?: string
	/** Иконка в индикаторе вместо номера (имя из спрайта); у пройденного шага — галочка */
	icon?: string
	/** Отключен ли шаг */
	isDisabled?: boolean
	/** Шаг с ошибкой: индикатор цвета ошибки со знаком «!», описание красным — например, «Карта отклонена» */
	isError?: boolean
	/** Необязательный шаг: под заголовком подпись «Необязательно» */
	isOptional?: boolean
}

export interface BaseStepperItemSlot {
	/** Данные шага */
	item: BaseStepperStep
	/** Индекс (0-based) */
	index: number
	/** Номер шага (1-based) */
	stepNumber: number
	/** Активен ли шаг */
	isActive: boolean
	/** Пройден ли шаг */
	isCompleted: boolean
	/** Отключен ли шаг: `isDisabled` или впереди в линейном режиме */
	isDisabled: boolean
	/** Шаг с ошибкой */
	isError: boolean
}

export const STEPPER_SHAPES = ['circle', 'square', 'diamond', 'empty'] as const

export type StepperShape = (typeof STEPPER_SHAPES)[number]

export const STEPPER_VARIANTS = ['default', 'animated'] as const

export type StepperVariant = (typeof STEPPER_VARIANTS)[number]

export const STEPPER_ORIENTATIONS = ['horizontal', 'vertical'] as const

export type StepperOrientation = (typeof STEPPER_ORIENTATIONS)[number]

export interface BaseStepperProps extends BaseComponentProps<
	StepperVariant,
	'root' | 'header' | 'items' | 'step' | 'indicatorWrapper' | 'indicator' | 'check' | 'content' | 'label' | 'description' | 'footer'
> {
	/** Текущий шаг (1-based) */
	modelValue: number
	/** Список шагов */
	items: BaseStepperStep[]
	/** Ориентация */
	orientation?: StepperOrientation
	/** Форма индикатора */
	shape?: StepperShape
	/**
	 * Линейный процесс: вперёд — только на следующий шаг после текущего, дальние шаги недоступны до прохождения;
	 * к пройденным шагам можно вернуться
	 */
	isLinear?: boolean
}

export interface BaseStepperEmits {
	(event: 'update:modelValue', value: number): void
	(event: 'change', value: number): void
}

export interface BaseStepperSlots {
	/** Заголовок степпера */
	header?: () => unknown
	/** Кастомный рендер шага */
	item?: (props: BaseStepperItemSlot) => unknown
	/** Подвал степпера */
	footer?: () => unknown
}
