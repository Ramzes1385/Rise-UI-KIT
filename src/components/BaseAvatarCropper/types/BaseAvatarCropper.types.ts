import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты оформления BaseAvatarCropper: default — область без рамки, outline — с рамкой accented. */
export const AVATAR_CROPPER_VARIANTS = ['default', 'outline'] as const

/**
 * Части кадрировщика для пропа `ui` (БЭМ-элементы `.base-avatar-cropper__<часть>`, `root` — корень):
 * area — область кадрирования, image — фото, frame — рамка кадра с затемнением вокруг, message — сообщение об ошибке загрузки,
 * hint — скрытая подсказка для скринридера, zoom — строка масштаба, zoom-label — подпись «Масштаб», range — ползунок масштаба.
 */
export const AVATAR_CROPPER_PARTS = ['area', 'image', 'frame', 'message', 'hint', 'zoom', 'zoom-label', 'range'] as const

/** Часть кадрировщика для пропа `ui` */
export type BaseAvatarCropperPart = (typeof AVATAR_CROPPER_PARTS)[number]

/** Форма кадра: circle — круглый аватар, square — квадратный со скруглением */
export const AVATAR_CROP_SHAPES = ['circle', 'square'] as const

/** Форма кадра */
export type AvatarCropShape = (typeof AVATAR_CROP_SHAPES)[number]

/** Кадр в пикселях исходного фото: квадрат со стороной `size`, левый верхний угол — `x`, `y` */
export interface AvatarCrop {
	x: number
	y: number
	size: number
}

/** Размер исходного фото в пикселях */
export interface AvatarImageSize {
	width: number
	height: number
}

/** Положение кадра: увеличение и центр кадра в пикселях исходного фото */
export interface AvatarView {
	zoom: number
	centerX: number
	centerY: number
}

/** Параметры картинки по кадру */
export interface AvatarBlobOptions {
	/** Сторона картинки в пикселях, по умолчанию 256 */
	size?: number
	/** Формат: `image/png` (по умолчанию; у круга углы прозрачные), `image/jpeg` или `image/webp` */
	type?: string
	/** Качество JPEG и WebP от 0 до 1 */
	quality?: number
}

/**
 * Пропсы компонента BaseAvatarCropper
 */
export interface BaseAvatarCropperProps extends BaseComponentProps<(typeof AVATAR_CROPPER_VARIANTS)[number], 'root' | 'area' | 'zoom'> {
	/** Адрес фото: object URL выбранного файла, data URI или адрес с CORS — иначе браузер не отдаст пиксели для getBlob */
	src: string
	/** Кадр (v-model:crop) в пикселях исходного фото; без него — по центру во весь меньший край */
	crop?: AvatarCrop
	/** Форма кадра */
	shape?: AvatarCropShape
	/** Сторона области кадрирования в пикселях; на узком экране область сужается */
	size?: number
	/** Наибольшее увеличение */
	maxZoom?: number
	/** Имя области для скринридера; по умолчанию «Кадрирование фото» */
	label?: string
	/** Отключает кадрирование: перетаскивание, клавиши и ползунок */
	isDisabled?: boolean
	/**
	 * Классы частей (`root`, `area`, `image`, `frame`, `message`, `hint`, `zoom`, `zoom-label`, `range`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseAvatarCropper: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseAvatarCropper :src="src" :ui="{ area: 'rounded-none', frame: 'ring-2' }" />
	 */
	ui?: UiProp<BaseAvatarCropperPart>
}

/**
 * События компонента BaseAvatarCropper
 */
export interface BaseAvatarCropperEmits {
	/** Новый кадр: после загрузки фото, перетаскивания, клавиш, колёсика и ползунка */
	(event: 'update:crop', value: AvatarCrop): void
	/** Фото не загрузилось */
	(event: 'error'): void
}

/**
 * Методы BaseAvatarCropper через ref
 */
export interface BaseAvatarCropperExpose {
	/** Картинка по кадру; null — фото не загружено или браузер не отдаёт его пиксели (другой сайт без CORS) */
	getBlob(options?: AvatarBlobOptions): Promise<Blob | null>
	/** Кадр по центру без увеличения */
	reset(): void
}

/** Пропсы после значений по умолчанию */
export type AvatarCropperProps = PropsWithDefaults<BaseAvatarCropperProps, 'shape' | 'size' | 'maxZoom'>
