import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseChecklist: `default` — карточка в рамке, `soft` — на подложке без рамки,
 * `outline` — рамка без фона, `ghost` — без рамки и отступов (внутри панели или меню)
 */
export const CHECKLIST_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Части чек-листа для пропа `ui` (БЭМ-элементы `.base-checklist__<часть>`, `root` — сам чек-лист):
 * header — шапка; title — заголовок; count — счётчик «2 из 5»; progress — полоса прогресса (класс на корне BaseProgress);
 * list — список шагов `<ol>`; item — шаг; checkbox — флажок; body — текст и кнопка шага; line — строка названия и метки;
 * label — название шага; next — метка «Следующий шаг»; description — пояснение; action — кнопка действия (корень BaseButton);
 * done — сообщение «Всё готово».
 */
export const CHECKLIST_PARTS = [
	'header',
	'title',
	'count',
	'progress',
	'list',
	'item',
	'checkbox',
	'body',
	'line',
	'label',
	'next',
	'description',
	'action',
	'done',
] as const

export type BaseChecklistPart = (typeof CHECKLIST_PARTS)[number]

/** Шаг: название, пояснение и подпись кнопки действия (например, «Открыть настройки») */
export interface ChecklistItem {
	id: string
	title: string
	description?: string
	actionLabel?: string
}

/** Шаг для разметки: выполнен ли, следующий ли, id флажка и пояснения */
export interface ChecklistRow {
	item: ChecklistItem
	isDone: boolean
	isNext: boolean
	checkboxId: string
	describedBy: string | undefined
	descriptionId: string
	nextId: string
}

/**
 * Пропсы компонента BaseChecklist
 */
export interface BaseChecklistProps extends BaseComponentProps<(typeof CHECKLIST_VARIANTS)[number], 'root' | 'item'> {
	/** Шаги по порядку */
	items: readonly ChecklistItem[]
	/** Выполненные шаги (`v-model:completed`): id отмеченных */
	completed?: readonly string[]
	/** Заголовок; по умолчанию «Первые шаги» */
	title?: string
	/** Только просмотр: флажки и кнопки неактивны */
	isDisabled?: boolean
	/**
	 * Классы частей чек-листа (`root`, `header`, `title`, `list`, `item`, `label`, `done`…) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseChecklist: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseChecklist :items="steps" :ui="{ item: 'rounded-none', label: 'font-semibold' }" />
	 */
	ui?: UiProp<BaseChecklistPart>
}

/**
 * События компонента BaseChecklist
 */
export interface BaseChecklistEmits {
	/** Отмечен или снят шаг: новый список выполненных */
	(event: 'update:completed', ids: string[]): void
	/** Нажата кнопка действия шага */
	(event: 'action', item: ChecklistItem): void
}

/**
 * Слоты компонента BaseChecklist
 */
export interface BaseChecklistSlots {
	/** Все шаги выполнены: вместо «Всё готово» */
	done?: () => unknown
}
