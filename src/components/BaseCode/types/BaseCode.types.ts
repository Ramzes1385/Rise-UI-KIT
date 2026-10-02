import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseCode: `default` — приглушённая подложка в рамке, `soft` — подложка без рамки,
 * `outline` — фон страницы в рамке. Цвета подсветки — токены `--rise-code-*`, контраст AA на всех трёх фонах
 */
export const CODE_VARIANTS = ['default', 'soft', 'outline'] as const

/**
 * Пропсы компонента BaseCode
 */
export interface BaseCodeProps extends BaseComponentProps<(typeof CODE_VARIANTS)[number], 'root' | 'header' | 'pre' | 'line'> {
	/** Код. Выводится только текстом: разметка в нём не исполняется */
	code?: string
	/**
	 * Язык подсветки — имя или псевдоним: `js`, `ts`, `json`, `html`, `vue`, `css`, `scss`, `bash` (`sh`), `python` (`py`).
	 * Другой язык показывается простым текстом с его названием в заголовке
	 */
	language?: string
	/** Заголовок блока — например имя файла; по умолчанию — название языка */
	title?: string
	/** Номера строк слева (по умолчанию есть); при выделении мышью и копировании номера не попадают в текст */
	hasLineNumbers?: boolean
	/** Номер первой строки — для отрывка из середины файла */
	startLine?: number
	/** Номера строк, которые нужно выделить фоном (считаются от `startLine`) */
	highlightLines?: readonly number[]
	/** Кнопка «Копировать» в заголовке (по умолчанию есть); результат объявляется скринридеру */
	hasCopyButton?: boolean
	/** Заголовок с названием и кнопками (по умолчанию есть) */
	hasHeader?: boolean
	/** Переносить длинные строки; по умолчанию строки не переносятся и область прокручивается, в том числе с клавиатуры */
	isWrapped?: boolean
	/** Наибольшая высота области кода, px; выше — вертикальная прокрутка */
	maxHeight?: number
	/** Имя области кода для скринридера; по умолчанию «Код, <язык>» */
	label?: string
}

export interface BaseCodeEmits {
	/** Код скопирован кнопкой «Копировать» или методом `copy()`; `success: false` — буфер обмена недоступен или запрещён */
	(event: 'copy', payload: { code: string; success: boolean }): void
}

/**
 * Слоты компонента BaseCode
 */
export interface BaseCodeSlots {
	/** Название в заголовке вместо `title` и названия языка; кнопки остаются */
	header?: () => unknown
	/** Свои кнопки в заголовке перед «Копировать» — например «Открыть в песочнице» */
	actions?: () => unknown
}

/** Методы BaseCode через ref */
export interface BaseCodeExpose {
	/** Скопировать код в буфер обмена; true — получилось */
	copy: () => Promise<boolean>
}

/** Пропсы BaseCode после значений по умолчанию */
export type CodeProps = PropsWithDefaults<
	BaseCodeProps,
	'code' | 'hasLineNumbers' | 'startLine' | 'hasCopyButton' | 'hasHeader' | 'isWrapped'
>
