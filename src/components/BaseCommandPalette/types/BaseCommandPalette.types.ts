import type { UiProp } from '@composables/base/useUi'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { ModalVariant } from '@components/BaseModal/types/BaseModal.types'

/** Варианты оформления — как у BaseModal: `default` — окно с рамкой, `shadow` — с тенью, `ghost` — без фона окна */
export const COMMAND_PALETTE_VARIANTS = ['default', 'ghost', 'shadow'] as const satisfies readonly ModalVariant[]

/**
 * Где работает `hotkey`: `global` — на всей странице (как ⌘K в большинстве приложений), `container` — только когда фокус
 * внутри блока, в котором стоит палитра (несколько палитр на одной странице, примеры в документации)
 */
export const COMMAND_PALETTE_HOTKEY_SCOPES = ['global', 'container'] as const

/**
 * Части палитры для пропа `ui` (`root` — затемнение окна): content — окно, body — тело окна, search — строка поиска,
 * input — поле, list — список, group — группа, group-title — заголовок группы, option — команда, icon — значок команды,
 * text — название и пояснение, label — название, description — пояснение, shortcut — сочетание клавиш,
 * empty — «Ничего не найдено», footer — подсказка с клавишами.
 */
export const COMMAND_PALETTE_PARTS = [
	'root',
	'content',
	'body',
	'search',
	'input',
	'list',
	'group',
	'group-title',
	'option',
	'icon',
	'text',
	'label',
	'description',
	'shortcut',
	'empty',
	'footer',
] as const

export type BaseCommandPalettePart = (typeof COMMAND_PALETTE_PARTS)[number]

/** Где работает сочетание клавиш палитры */
export type CommandPaletteHotkeyScope = (typeof COMMAND_PALETTE_HOTKEY_SCOPES)[number]

/**
 * Команда: название, группа («Навигация», «Файл»), пояснение, значок, сочетание клавиш для подсказки (`mod+shift+p`)
 * и слова для поиска. `onSelect` выполняется после закрытия палитры
 */
export interface CommandItem {
	id: string
	label: string
	group?: string
	description?: string
	icon?: string
	shortcut?: string
	keywords?: readonly string[]
	isDisabled?: boolean
	onSelect?: () => void
}

/** Команда для разметки: id элемента, номер среди найденных и клавиши сочетания */
export interface CommandOptionView {
	command: CommandItem
	id: string
	index: number
	keys: string[]
}

/** Группа найденных команд: название (пустое — без заголовка) и id заголовка */
export interface CommandGroupView {
	name: string
	id: string
	options: CommandOptionView[]
}

/**
 * Пропсы компонента BaseCommandPalette
 */
export interface BaseCommandPaletteProps extends BaseComponentProps<ModalVariant, 'root' | 'input' | 'option'> {
	/** Открыта ли палитра (`v-model:is-open`); без него палитра открывается своим сочетанием клавиш */
	isOpen?: boolean
	/** Команды по порядку; группы идут в порядке первого появления */
	commands: readonly CommandItem[]
	/** Сочетание, которое открывает и закрывает палитру; по умолчанию `mod+k` (⌘K или Ctrl+K), `null` — без него */
	hotkey?: string | null
	/**
	 * Где работает `hotkey`: `global` (по умолчанию) — на всей странице; `container` — только когда фокус внутри блока,
	 * в котором стоит палитра. Закрывает открытую палитру Escape
	 */
	hotkeyScope?: CommandPaletteHotkeyScope
	/** Подсказка в поле поиска */
	placeholder?: string
	/** Имя окна для скринридера; по умолчанию «Палитра команд» */
	ariaLabel?: string
	/**
	 * Палитра внутри ближайшего позиционированного контейнера, без телепорта (демо, документация, встроенная панель).
	 * Такое окно немодальное: без aria-modal, ловушки фокуса и блокировки прокрутки страницы
	 */
	isContained?: boolean
	/**
	 * Появление и уход окна (проп `animation` BaseModal): `scale` (по умолчанию) — масштаб от центра, `fade` —
	 * прозрачность, `slide` — снизу, `pop` — масштаб с пружиной, `none` — сразу. При «уменьшить движение» — сразу.
	 * Глобально — `defaults.BaseCommandPalette.animation`
	 */
	animation?: EnterAnimation
	/**
	 * Классы частей палитры: добавляются к БЭМ-классам кита, глобальные — `defaults.BaseCommandPalette.ui`.
	 *
	 * @example
	 * <BaseCommandPalette :commands="commands" :ui="{ content: 'rounded-3xl', option: 'gap-4' }" />
	 */
	ui?: UiProp<BaseCommandPalettePart>
}

/**
 * События компонента BaseCommandPalette
 */
export interface BaseCommandPaletteEmits {
	/** Палитру открыли или закрыли */
	(event: 'update:isOpen', value: boolean): void
	/** Выбрана команда: Enter или клик */
	(event: 'select', command: CommandItem): void
}

/**
 * Слоты компонента BaseCommandPalette
 */
export interface BaseCommandPaletteSlots {
	/** Своя строка команды (роль option, выбор и подсветка остаются у палитры) */
	command?: (props: { command: CommandItem; isActive: boolean }) => unknown
	/** Ничего не найдено: вместо «Ничего не найдено» */
	empty?: (props: { query: string }) => unknown
}
