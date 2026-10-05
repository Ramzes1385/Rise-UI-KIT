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

/** Форма модулей: square — квадраты, rounded — квадраты со скруглёнными свободными углами, dots — точки */
export const QR_MODULE_SHAPES = ['square', 'rounded', 'dots'] as const

/** Форма модулей */
export type QrModuleShape = (typeof QR_MODULE_SHAPES)[number]

/** Форма «глазков» — трёх поисковых узоров в углах: square, rounded — со скруглёнными углами, circle — кольца */
export const QR_FINDER_SHAPES = ['square', 'rounded', 'circle'] as const

/** Форма «глазков» */
export type QrFinderShape = (typeof QR_FINDER_SHAPES)[number]

/** Готовый QR-код: версия (1–40), размер в модулях и модули строками сверху вниз, true — тёмный */
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

/** Вырез под логотип в модулях: квадрат в центре кода, модули в нём не рисуются */
export interface QrLogoArea {
	/** Первая строка и первый столбец выреза */
	start: number
	/** Сторона выреза в модулях, нечётная — вырез ровно по центру */
	side: number
	/** Сторона картинки логотипа в модулях, внутри выреза с полем */
	image: number
}

/** Версия и уровень, с которыми строится матрица; маска — если нужна конкретная */
export interface QrEncodeOptions {
	/** Версия QR-кода 1–40 */
	version: number
	/** Уровень коррекции ошибок */
	level: QrErrorLevel
	/** Маска 0–7; без неё выбирается по штрафам стандарта */
	mask?: number
}

/** Версия, в которой логотип помещается, и вырез под него */
export interface QrLogoFit {
	/** Версия QR-кода */
	version: number
	/** Вырез под логотип */
	area: QrLogoArea
}

/** Код с логотипом: матрица и вырез; вырез null — логотип не помещается без риска не прочитать код */
export interface QrLogoCode {
	/** Матрица кода */
	matrix: QrMatrix
	/** Вырез под логотип */
	area: QrLogoArea | null
}

/** Как рисовать модули: поле, форма, скрытые клетки (вырез под логотип) */
export interface QrModulePathOptions {
	/** Поле вокруг кода в модулях */
	margin: number
	/** Форма модулей */
	shape: QrModuleShape
	/** Вырез под логотип: модули в нём не рисуются */
	area: QrLogoArea | null
}

/** Части SVG кода для getSvg(): размер, цвета, контуры и логотип */
export interface QrSvgParts {
	/** Сторона viewBox в модулях вместе с полями */
	viewSize: number
	/** Цвета фона, модулей и «глазков» */
	colors: { background: string; module: string; finder: string }
	/** Контур модулей */
	modules: string
	/** Контур «глазков» */
	finder: string
	/** Резкие края: у квадратных модулей и «глазков» */
	crisp: { modules: boolean; finder: boolean }
	/** Логотип: адрес и квадрат в координатах viewBox */
	logo: { href: string; x: number; y: number; size: number } | null
}

/**
 * Пропсы компонента BaseQrCode
 */
export interface BaseQrCodeProps extends BaseComponentProps<(typeof QR_CODE_VARIANTS)[number], 'root'> {
	/** Текст или адрес: кодируется байтами UTF-8, до 2953 байт при уровне L, 2331 при M и 1273 при H (версии 1–40) */
	value: string
	/**
	 * Имя картинки для скринридера. По умолчанию текст кода в имя не попадает: для ссылки http(s) —
	 * «QR-код: ссылка на <хост>», для остального — «QR-код» (секреты otpauth:// и токены не читаются вслух)
	 */
	label?: string
	/** Уровень коррекции ошибок: L, M, Q, H; по умолчанию M, с логотипом — H */
	errorCorrection?: QrErrorLevel
	/** Сторона картинки в пикселях при sizeScale 100, вместе с полями */
	size?: number
	/** Поле вокруг кода в модулях: стандарт требует 4, многие сканеры читают и с 2 */
	margin?: number
	/** Цвет модулей: тёмный на светлом фоне — иначе часть сканеров код не прочитает */
	moduleColor?: string
	/** Цвет фона и полей */
	backgroundColor?: string
	/** Форма модулей: square (по умолчанию), rounded, dots */
	moduleShape?: QrModuleShape
	/** Форма «глазков» в трёх углах: square (по умолчанию), rounded, circle */
	finderShape?: QrFinderShape
	/** Цвет «глазков»; по умолчанию — цвет модулей */
	finderColor?: string
	/**
	 * Логотип в центре — адрес картинки или data URI. Под ним модули не рисуются; версия кода подбирается так,
	 * чтобы вырез занимал не больше 60% запаса коррекции каждого блока
	 */
	logo?: string
	/** Сторона логотипа — доля стороны кода без полей: от 0.1 до 0.3, по умолчанию 0.22 */
	logoSize?: number
	/**
	 * Секретный код (ключ двухфакторной защиты, токен входа): вместо кода — размытая заглушка не из данных
	 * и кнопка «Показать QR-код»; настоящие модули попадают в DOM только после нажатия
	 */
	isConcealed?: boolean
	/** Через сколько миллисекунд после показа снова скрыть секретный код; 0 или не задано — не скрывать */
	revealTimeout?: number
	/**
	 * Подпись под кодом: true — весь текст (до двух строк), 'host' — только хост ссылки http(s), чтобы человек видел,
	 * куда ведёт код, до сканирования; для не-ссылок 'host' ничего не выводит. У скрытого кода подписи нет
	 */
	showValue?: QrShowValue
}

/** Подпись под кодом: false — нет, true — весь текст, 'host' — хост ссылки */
export type QrShowValue = boolean | 'host'

/**
 * События компонента BaseQrCode
 */
export interface BaseQrCodeEmits {
	/** Секретный код показан: кнопкой или методом reveal() */
	(event: 'reveal'): void
	/** Секретный код снова скрыт: по revealTimeout или методом conceal() */
	(event: 'conceal'): void
}

/**
 * Методы BaseQrCode через ref
 */
export interface BaseQrCodeExpose {
	/** SVG-разметка кода с фоном — для скачивания или вставки в документ; пустая строка, если текст не помещается */
	getSvg: () => string
	/** Показать секретный код */
	reveal: () => void
	/** Скрыть код за заглушкой */
	conceal: () => void
}
