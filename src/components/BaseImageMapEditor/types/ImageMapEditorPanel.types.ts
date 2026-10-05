import type { useEditorPanel } from '../model/panel/useEditorPanel'
import type { ImageMapData, ImageMapLayer, ImageMapObject } from '@components/BaseImageMap/types/imageMapData.types'

/** Пропсы панели свойств редактора (внутренний компонент) */
export interface ImageMapEditorPanelProps {
	/** JSON карты */
	data: ImageMapData
	/** Показанный слой */
	currentLayer?: ImageMapLayer
	/** Выделенный объект */
	selected?: ImageMapObject
	/** Объекты показанного слоя */
	objects: ImageMapObject[]
	/** Поля и действия панели */
	panel: ReturnType<typeof useEditorPanel>
	/** Редактор отключён */
	isDisabled: boolean
	/** Класс панели из `classes.panel` */
	panelClass?: string
}

/** События панели свойств */
export interface ImageMapEditorPanelEmits {
	/** Выбран объект в списке */
	(event: 'select', id: string): void
	/** Выбран этаж */
	(event: 'set-layer', id: string): void
	/** Нажата «Добавить этаж» */
	(event: 'add-layer'): void
}

/** Строка или кнопка панели, на которую переводится фокус */
export interface EditorFocusTarget {
	/** Перевести фокус */
	focus: () => void
}

/** Строки и кнопки панели, на которые переводится фокус: строки этажей и групп, «Выше» и «Ниже» этажа */
export type EditorPanelList = 'layer' | 'group' | 'up' | 'down'
