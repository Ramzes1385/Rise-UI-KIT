import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseSignaturePad: default — поле с рамкой на фоне страницы, soft — подложка `bg-elevated`
 * без рамки, outline — прозрачное поле с рамкой accented.
 */
export const SIGNATURE_PAD_VARIANTS = ['default', 'soft', 'outline'] as const

/** Точка штриха в единицах поля: x от 0 до `width`, y от 0 до `height` */
export interface SignaturePoint {
	x: number
	y: number
}

/** Штрих — точки от нажатия до отпускания пера, пальца или кнопки мыши */
export type SignatureStroke = SignaturePoint[]

/** Параметры файла с подписью */
export interface SignatureExportOptions {
	/** Цвет линий; по умолчанию — `penColor`, без него — чёрный */
	color?: string
	/** Фон; по умолчанию прозрачный */
	background?: string
}

/** Параметры PNG */
export interface SignaturePngOptions extends SignatureExportOptions {
	/** Плотность пикселей: 2 (по умолчанию) — картинка вдвое больше `width` × `height` */
	pixelRatio?: number
}

/** Всё, что нужно, чтобы нарисовать подпись в SVG или на canvas */
export interface SignatureRenderOptions extends SignaturePngOptions {
	width: number
	height: number
	color: string
	lineWidth: number
}

/** Связь рисования с полем: где рисуют, размер в единицах штрихов, можно ли рисовать и куда отдать штрих */
export interface SignatureDrawingOptions {
	surface: () => Element | null
	size: () => { width: number; height: number }
	isEnabled: () => boolean
	onStroke: (stroke: SignatureStroke) => void
}

/**
 * Пропсы компонента BaseSignaturePad
 */
export interface BaseSignaturePadProps extends BaseComponentProps<
	(typeof SIGNATURE_PAD_VARIANTS)[number],
	'root' | 'label' | 'surface' | 'toolbar' | 'error'
> {
	/** Штрихи подписи (v-model); пустой массив — подписи нет */
	modelValue?: SignatureStroke[]
	/** Подпись над полем; без неё имя для скринридера — «Подпись» */
	label?: string
	/** Подсказка в пустом поле */
	placeholder?: string
	/** Ширина поля в пикселях и единицах штрихов; на узком экране поле сужается, сохраняя пропорции */
	width?: number
	/** Высота поля */
	height?: number
	/** Цвет линий; по умолчанию на экране — цвет текста темы, в файле — чёрный */
	penColor?: string
	/** Толщина линии */
	lineWidth?: number
	/** Текст ошибки: показывается под полем и связывается через aria-describedby */
	error?: string
	/** Отключает поле: рисовать, отменять и очищать нельзя */
	isDisabled?: boolean
}

/**
 * События компонента BaseSignaturePad
 */
export interface BaseSignaturePadEmits {
	/** Новые штрихи: после штриха, отмены и очистки */
	(event: 'update:modelValue', value: SignatureStroke[]): void
	/** Пользователь закончил штрих, отменил его или очистил поле */
	(event: 'change', value: SignatureStroke[]): void
}

/**
 * Методы BaseSignaturePad через ref
 */
export interface BaseSignaturePadExpose {
	/** Очистить поле */
	clear(): void
	/** Убрать последний штрих */
	undo(): void
	/** Подпись в SVG размером `width` × `height`; пустая строка — подписи нет */
	toSvg(options?: SignatureExportOptions): string
	/** Подпись в PNG; null — подписи нет или браузер не смог нарисовать */
	toPng(options?: SignaturePngOptions): Promise<Blob | null>
}

/** Пропсы после значений по умолчанию */
export type SignaturePadProps = PropsWithDefaults<BaseSignaturePadProps, 'modelValue' | 'width' | 'height' | 'lineWidth'>
