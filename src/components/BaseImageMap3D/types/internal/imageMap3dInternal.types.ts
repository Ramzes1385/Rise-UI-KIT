import type { Ref } from 'vue'
import type { ImageMap3DData } from '../imageMap3dData.types'
import type { ImageMap3DRendererFactory } from '../BaseImageMap3D.types'
import type { BaseImageMapProps } from '@components/BaseImageMap/types/BaseImageMap.types'

/** Правило проверки 3D-поля данных */
export type ImageMap3DFieldRule = 'number' | 'positive' | 'nonNegative' | 'text' | 'vector' | 'model' | 'object'

/** Неверное 3D-поле данных: путь, значение и нарушенное правило */
export interface ImageMap3DIssue {
	/** Путь к полю: `layers["floor-1"].elevation` */
	path: string
	/** Значение поля как есть */
	value: unknown
	/** Нарушенное правило */
	rule: ImageMap3DFieldRule
}

/** Пропсы и обработчики событий для BaseImageMap в 2D-виде */
export type ImageMap2DBindings = BaseImageMapProps & Record<string, unknown>

/** Параметры области рисования 3D-карты */
export interface ImageMap3DViewportOptions {
	/** Холст: есть в DOM — рендерер работает, пропал — всё освобождается */
	canvasRef: Readonly<Ref<HTMLCanvasElement | null>>
	/** Элемент, по размеру которого рисуется сцена */
	hostRef: Readonly<Ref<HTMLElement | null>>
	/** Данные карты: по ним подбирается камера */
	getData: () => ImageMap3DData
	/** Фабрика рендерера */
	getFactory: () => ImageMap3DRendererFactory
	/** Рендерер не создался */
	onError: (error: unknown) => void
}
