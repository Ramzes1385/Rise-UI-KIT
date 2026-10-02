import type { ResolvedImageMapObject } from './imageMapModel.types'

/** Пропсы содержимого подсказки и окна объекта */
export interface ImageMapCardProps {
	/** Объект карты */
	item: ResolvedImageMapObject
	/** Полное содержимое окна (видео, заголовок — у окна); без него — краткая подсказка с заголовком */
	isFull?: boolean
}
