import type { UiClassFn } from '@composables/base/useUi'
import type { useEditorPanel } from '../model/panel/useEditorPanel'
import type { EditorSectionsApi } from './ImageMapEditorLayout.types'
import type { BaseImageMapEditorPart } from './BaseImageMapEditor.types'
import type { ImageMapData, ImageMapLayer, ImageMapObject } from '@components/BaseImageMap/types/imageMapData.types'

/** Поля и действия панели: удаление этажа и группы идёт через подтверждение и возвращает `true`, если удалено */
type EditorPanelApi = Omit<ReturnType<typeof useEditorPanel>, 'removeLayer' | 'removeGroup'> & {
	removeLayer: (id: string) => Promise<boolean>
	removeGroup: (id: string) => Promise<boolean>
}

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
	panel: EditorPanelApi
	/** Редактор отключён */
	isDisabled: boolean
	/** Класс панели из `classes.panel` */
	panelClass?: string
	/** Состояние разделов панели: сворачивание на узкой раскладке */
	sections: EditorSectionsApi
	/** Классы частей редактора (проп `ui`) */
	ui: UiClassFn<BaseImageMapEditorPart>
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

/** Пропсы раздела «3D» панели свойств (внутренний компонент) */
export interface ImageMapEditorPanel3dProps {
	/** Поля и действия панели */
	panel: EditorPanelApi
	/** Название показанного этажа — подпись полей 3D этажа */
	layerTitle?: string
	/** Выделенный объект: у объекта `svg` показываются части */
	selected?: ImageMapObject
	/** Редактор отключён */
	isDisabled: boolean
	/** Состояние разделов панели: сворачивание на узкой раскладке */
	sections: EditorSectionsApi
	/** Классы частей редактора (проп `ui`) */
	ui: UiClassFn<BaseImageMapEditorPart>
}
