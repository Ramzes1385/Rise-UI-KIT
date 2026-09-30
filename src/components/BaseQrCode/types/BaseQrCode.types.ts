import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты оформления BaseQrCode: default — код на светлой подложке со скруглением, outline — ещё и рамка */
export const QR_CODE_VARIANTS = ['default', 'outline'] as const

/**
 * Уровни коррекции ошибок: сколько кода можно потерять и всё ещё прочитать — L ≈ 7%, M ≈ 15%, Q ≈ 25%, H ≈ 30%.
 * Чем выше уровень, тем плотнее код при том же тексте
 */
export const QR_ERROR_LEVELS = ['L', 'M', 'Q', 'H'] as const

/** Уровень коррекции ошибок */
export type QrErrorLevel = (typeof QR_ERROR_LEVELS)[number]

/** Готовый QR-код: версия (1–10), размер в модулях и модули строками сверху вниз, true — тёмный */
export interface QrMatrix {
	/** Версия QR-кода: 1 — 21×21 модуль, каждая следующая — на 4 модуля больше */
	version: number
	/** Сторона в модулях */
	size: number
	/** Модули по строкам: true — тёмный */
	modules: boolean[][]
	/** Маска 0–7, выбранная по штрафам стандарта */
	mask: number
}

/** Сетка построения кода: модули и клетки служебных узоров, которые маска не трогает */
export interface QrGrid {
	/** Сторона в модулях */
	size: number
	/** Версия QR-кода */
	version: number
	/** Модули по строкам: true — тёмный */
	modules: boolean[][]
	/** Клетки служебных узоров: поисковые, выравнивающие, синхронизация, формат и версия */
	reserved: boolean[][]
}

/**
 * Пропсы компонента BaseQrCode
 */
export interface BaseQrCodeProps extends BaseComponentProps<(typeof QR_CODE_VARIANTS)[number], 'root'> {
	/** Текст или адрес: кодируется байтами UTF-8, до 271 байта при уровне L и до 119 при H */
	value: string
	/** Имя картинки для скринридера; по умолчанию «QR-код: <value>» */
	label?: string
	/** Уровень коррекции ошибок: L, M (по умолчанию), Q, H */
	errorCorrection?: QrErrorLevel
	/** Сторона картинки в пикселях при sizeScale 100, вместе с полями */
	size?: number
	/** Поле вокруг кода в модулях: стандарт требует 4, многие сканеры читают и с 2 */
	margin?: number
	/** Цвет модулей: тёмный на светлом фоне — иначе часть сканеров код не прочитает */
	moduleColor?: string
	/** Цвет фона и полей */
	backgroundColor?: string
}

/**
 * Методы BaseQrCode через ref
 */
export interface BaseQrCodeExpose {
	/** SVG-разметка кода с фоном — для скачивания или вставки в документ; пустая строка, если текст не помещается */
	getSvg: () => string
}
