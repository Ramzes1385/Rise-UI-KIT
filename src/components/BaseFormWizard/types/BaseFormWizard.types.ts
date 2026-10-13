import type { UiProp } from '@composables/base/useUi'
import type { StandardSchemaV1 } from '@utils/form/formUtils'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления мастера:
 * default — без рамки и фона, outline — рамка вокруг всего мастера, soft — мягкий фон.
 */
export const FORM_WIZARD_VARIANTS = ['default', 'outline', 'soft'] as const

export type FormWizardVariant = (typeof FORM_WIZARD_VARIANTS)[number]

/** Теги заголовка шага: уровень выбирают по месту мастера на странице */
export const FORM_WIZARD_TITLE_TAGS = ['h2', 'h3', 'h4', 'h5', 'h6'] as const

export type FormWizardTitleTag = (typeof FORM_WIZARD_TITLE_TAGS)[number]

/**
 * Части мастера для пропа `ui` (БЭМ-элементы `.base-form-wizard__<часть>`, `root` — сам мастер): header — шапка со степпером,
 * content — область шага, title — заголовок шага, description — описание шага, error — сообщение, почему шаг не пройден,
 * actions — ряд кнопок, back / skip / next — кнопки «Назад», «Пропустить» и «Далее» (на последнем шаге — «Готово»)
 */
export const FORM_WIZARD_PARTS = ['header', 'content', 'title', 'description', 'error', 'actions', 'back', 'skip', 'next'] as const

export type BaseFormWizardPart = (typeof FORM_WIZARD_PARTS)[number]

/**
 * Итог пользовательской проверки шага: `true` или ничего — шаг пройден; `false` — не пройден (показывается общее сообщение);
 * строка — не пройден, строка показывается под содержимым шага
 */
export type FormWizardValidation = boolean | string | void

/** Шаг мастера */
export interface FormWizardStep {
	/** Уникальный идентификатор шага: `v-model:step`, имя слота `#step-<id>`, события */
	id: string
	/** Заголовок шага: в степпере и над содержимым шага */
	title: string
	/** Пояснение под заголовком шага */
	description?: string
	/** Необязательный шаг: в степпере подпись «Необязательно», у шага кнопка «Пропустить» (кроме последнего) */
	isOptional?: boolean
	/**
	 * Схема Standard Schema (Zod, Valibot, ArkType): перед «Далее» данные `state` мастера проверяются ею, ошибки показывают
	 * `BaseFormField` с тем же `name`, фокус — на первом поле с ошибкой
	 */
	schema?: StandardSchemaV1
	/** Своя проверка перед «Далее» и «Готово»: может быть асинхронной; результат — `FormWizardValidation`. Выполняется после проверки `schema` */
	validate?: () => FormWizardValidation | Promise<FormWizardValidation>
}

/** Данные слота шага */
export interface FormWizardStepSlot {
	/** Описание шага */
	step: FormWizardStep
	/** Индекс (0-based) */
	index: number
	/** Номер шага (1-based) */
	stepNumber: number
	/** Первый ли шаг */
	isFirst: boolean
	/** Последний ли шаг */
	isLast: boolean
}

/** Откуда и куда перешёл мастер */
export interface FormWizardChange {
	/** Идентификатор нового шага */
	to: string
	/** Идентификатор прежнего шага */
	from: string
}

export interface BaseFormWizardProps extends BaseComponentProps<
	FormWizardVariant,
	'root' | 'header' | 'content' | 'title' | 'description' | 'error' | 'actions' | 'back' | 'skip' | 'next'
> {
	/** Шаги мастера по порядку */
	steps?: FormWizardStep[]
	/** Текущий шаг — `id` (`v-model:step`). Пока не задан, открыт первый шаг */
	step?: string
	/**
	 * Данные формы: их проверяют `schema` шагов, они же уходят в событие `finish`. Объект принадлежит приложению:
	 * поля шагов меняют его через `v-model`
	 */
	state?: Record<string, unknown>
	/**
	 * Линейный режим: вперёд — только на следующий шаг и только после успешной проверки текущего, степпер не даёт перескочить через шаги;
	 * назад — всегда. Без него шаги в степпере выбираются свободно, а «Готово» проверяет все шаги по порядку
	 */
	isLinear?: boolean
	/** Идёт сохранение (например, после `finish`): кнопка «Готово» в загрузке, форма и кнопки заблокированы */
	isLoading?: boolean
	/** Отключает мастер: поля, кнопки и степпер недоступны */
	isDisabled?: boolean
	/** Тег заголовка шага */
	titleTag?: FormWizardTitleTag
	/**
	 * Классы частей мастера (`root`, `header`, `content`, `title`, `description`, `error`, `actions`, `back`, `skip`, `next`) —
	 * добавляются к классам кита. Глобально — `createUiKitPlugin({ defaults: { BaseFormWizard: { ui } } })`, классы склеиваются.
	 *
	 * @example
	 * <BaseFormWizard v-model:step="step" :steps="steps" :ui="{ actions: 'justify-between' }" />
	 */
	ui?: UiProp<BaseFormWizardPart>
}

export interface BaseFormWizardEmits {
	/** Текущий шаг изменился (`v-model:step`): `id` нового шага */
	(event: 'update:step', id: string): void
	/** Мастер перешёл на другой шаг любым способом: кнопки, степпер, `goTo`, `next` */
	(event: 'step-change', change: FormWizardChange): void
	/** Шаг прошёл проверку и мастер идёт вперёд: `id` шага, который закрывается (на последнем шаге вместо него `finish`) */
	(event: 'next', id: string): void
	/** Пользователь вернулся назад (кнопка или степпер): `id` шага, который закрывается. Проверка не нужна */
	(event: 'back', id: string): void
	/** Необязательный шаг пропущен без проверки: `id` пропущенного шага */
	(event: 'skip', id: string): void
	/** Последний шаг прошёл проверку (в нелинейном режиме — все шаги): `state` — данные мастера. Затем приложение показывает `isLoading` на время сохранения */
	(event: 'finish', state?: Record<string, unknown>): void
	/** Проверка шага не прошла: `id` шага. Мастер остаётся на нём (в нелинейном режиме «Готово» переходит на первый непройденный шаг) */
	(event: 'invalid', id: string): void
}

export interface BaseFormWizardExpose {
	/** Проверить текущий шаг и перейти дальше (на последнем — завершить): то же, что кнопка «Далее» / «Готово»; `false`, если шаг не прошёл */
	next: () => Promise<boolean>
	/** Вернуться на предыдущий шаг; `false`, если мастер на первом шаге или заблокирован */
	back: () => boolean
	/** Перейти на шаг по `id`; в линейном режиме — только назад или на следующий после проверки; `false`, если переход не состоялся */
	goTo: (id: string) => Promise<boolean>
	/** Проверить текущий шаг, не переходя: показывает ошибки полей и сообщение шага */
	validate: () => Promise<boolean>
}

export interface BaseFormWizardSlots {
	/** Содержимое шага по `id`: слот `#step-<id>` (например, `#step-address`). Внутри — поля `BaseFormField` с `name`, ошибки схемы покажутся у них */
	[slot: `step-${string}`]: ((props: FormWizardStepSlot) => unknown) | undefined
	/** Содержимое любого шага без своего слота `#step-<id>`: выбор по `step.id` внутри */
	default?: (props: FormWizardStepSlot) => unknown
}

export type FormWizardProps = PropsWithDefaults<BaseFormWizardProps, 'steps' | 'isLinear' | 'isLoading' | 'isDisabled' | 'titleTag'>
