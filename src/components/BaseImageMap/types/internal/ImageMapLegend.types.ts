import type { UiClassFn } from '@composables/base/useUi'
import type { ImageMapGroup } from '../imageMapData.types'
import type { BaseImageMapPart } from '../BaseImageMap.types'

/** Пропсы легенды групп (внутренний компонент, общий у BaseImageMap и BaseImageMap3D) */
export interface ImageMapLegendProps {
	/** Группы объектов: образец цвета или значок и название */
	groups: ImageMapGroup[]
	/** Класс из `customClass.legend` */
	customClass?: string
	/** Классы частей карты из пропа `ui` и `defaults.BaseImageMap.ui`; без него — только классы кита */
	ui?: UiClassFn<BaseImageMapPart>
}
