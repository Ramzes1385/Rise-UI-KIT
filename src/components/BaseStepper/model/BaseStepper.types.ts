import type { BaseComponentProps } from '@/types/base.types'

/**
 * Шаг степпера
 */
export interface BaseStepperStep {
	/** Заголовок */
	label: string
	/** Описание */
	description?: string
	/** Иконка */
	icon?: string
	/** Отключен ли шаг */
	isDisabled?: boolean
}

/** Данные scoped-слота item */
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
	/** Отключен ли шаг */
	isDisabled: boolean
}

/** Формы индикатора шага */
export const STEPPER_SHAPES = ['circle', 'square', 'diamond', 'empty'] as const

/** Тип формы индикатора */
export type StepperShape = (typeof STEPPER_SHAPES)[number]

/** Варианты отображения */
export const STEPPER_VARIANTS = ['default', 'animated'] as const

/** Тип варианта отображения */
export type StepperVariant = (typeof STEPPER_VARIANTS)[number]

/** Ориентации степпера */
export const STEPPER_ORIENTATIONS = ['horizontal', 'vertical'] as const

/** Тип ориентации */
export type StepperOrientation = (typeof STEPPER_ORIENTATIONS)[number]


/**
 * Пропсы компонента BaseStepper
 */
export interface BaseStepperProps extends BaseComponentProps<StepperVariant> {
	/** Текущий шаг (1-based) */
	modelValue: number
	/** Список шагов */
	items: BaseStepperStep[]
	/** Ориентация */
	orientation?: StepperOrientation
	/** Форма индикатора */
	shape?: StepperShape
}

/**
 * События компонента BaseStepper
 */
export interface BaseStepperEmits {
	(event: 'update:modelValue', value: number): void
	(event: 'change', value: number): void
}

/**
 * Слоты компонента BaseStepper
 */
export interface BaseStepperSlots {
	default?: () => unknown
	/** Заголовок степпера */
	header?: () => unknown
	/** Кастомный рендер шага */
	item?: (props: BaseStepperItemSlot) => unknown
	/** Подвал степпера */
	footer?: () => unknown
}
