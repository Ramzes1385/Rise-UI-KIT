import type { UiProp } from '@composables/base/useUi'
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

/**
 * Варианты: `default` — линия между шагами заполняется за `--rise-duration`, `animated` — медленнее, за `--rise-duration-slow`.
 * Заполнение — `transform`; при «уменьшить движение» и пресете `none` линия встаёт сразу
 */
export const STEPPER_VARIANTS = ['default', 'animated'] as const

export type StepperVariant = (typeof STEPPER_VARIANTS)[number]

/**
 * Какие шаги можно выбрать кликом: `all` — любой (с учётом `isLinear` и `isDisabled`);
 * `completed` — только шаги до текущего; `none` — ни один, степпер только показывает прогресс
 */
export const STEPPER_CLICKABLE = ['all', 'completed', 'none'] as const

export type StepperClickable = (typeof STEPPER_CLICKABLE)[number]

/**
 * Части степпера для пропа `ui` (БЭМ-элементы `.base-stepper__<часть>`, `root` — сам степпер): header — заголовок из слота,
 * items — список шагов `<ol>`, step — шаг `<li>`, trigger — кнопка или блок шага, indicator-wrapper — место индикатора,
 * indicator — кружок с номером, check — галочка пройденного шага, content — подписи шага, label — заголовок шага,
 * description — описание, line-fill — заполнение линии до текущего шага (дорожка — `::before`/`::after` шага),
 * footer — подвал из слота
 */
export const STEPPER_PARTS = [
	'header',
	'items',
	'step',
	'trigger',
	'indicator-wrapper',
	'indicator',
	'check',
	'content',
	'label',
	'description',
	'line-fill',
	'footer',
] as const

export type BaseStepperPart = (typeof STEPPER_PARTS)[number]

export const STEPPER_ORIENTATIONS = ['horizontal', 'vertical'] as const

export type StepperOrientation = (typeof STEPPER_ORIENTATIONS)[number]

export interface BaseStepperProps extends BaseComponentProps<
	StepperVariant,
	| 'root'
	| 'header'
	| 'items'
	| 'step'
	| 'trigger'
	| 'indicatorWrapper'
	| 'indicator'
	| 'check'
	| 'content'
	| 'label'
	| 'description'
	| 'footer'
> {
	/**
	 * Текущий шаг (1-based). Вне диапазона 1…число шагов показывается ближайший шаг, а в консоль идёт предупреждение;
	 * `v-model` значение не меняет
	 */
	modelValue: number
	/** Список шагов */
	items: BaseStepperStep[]
	/**
	 * Ориентация. Горизонтальный степпер следит за собственной шириной: до 480px лента сжимается до индикаторов с линиями
	 * (подписи остаются для скринридера), а под ней выводится «Шаг N из M: подпись» текущего шага
	 */
	orientation?: StepperOrientation
	/** Форма индикатора */
	shape?: StepperShape
	/**
	 * Линейный процесс: вперёд — только на следующий шаг после текущего, дальние шаги недоступны до прохождения;
	 * к пройденным шагам можно вернуться
	 */
	isLinear?: boolean
	/**
	 * Какие шаги можно выбрать кликом и с клавиатуры: такой шаг — кнопка `<button>`, остальные — текст.
	 * Текущий шаг тоже кнопка (фокус не теряется после выбора), но клик по нему ничего не эмитит. По умолчанию `all`
	 */
	clickable?: StepperClickable
	/**
	 * Классы частей степпера (`root`, `items`, `step`, `indicator`, `label`, `line-fill` и др.) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseStepper: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseStepper v-model="step" :items="steps" :ui="{ indicator: 'shadow-sm', label: 'uppercase' }" />
	 */
	ui?: UiProp<BaseStepperPart>
}

export interface BaseStepperEmits {
	(event: 'update:modelValue', value: number): void
	(event: 'change', value: number): void
}

export interface BaseStepperSlots {
	/** Заголовок степпера */
	header?: () => unknown
	/** Кастомный рендер шага: он внутри `<button>` выбираемого шага, поэтому без ссылок, кнопок и полей */
	item?: (props: BaseStepperItemSlot) => unknown
	/** Подвал степпера */
	footer?: () => unknown
}
