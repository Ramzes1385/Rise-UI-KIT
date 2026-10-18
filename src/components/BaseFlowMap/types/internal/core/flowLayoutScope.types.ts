import type { FlowNotation } from '../../api/flowNotation.types'
import type { FlowLayoutAlgorithm, FlowRouter } from '../../api/flowLayout.types'
import type { FlowLayoutSettings, FlowMapData, FlowPoint } from '../../data/flowData.types'

/** Всё, что нужно для раскладки и маршрутов: данные, нотация и реестры */
export interface FlowLayoutScope {
	/** Данные карты */
	data: FlowMapData
	/** Нотация карты */
	notation: FlowNotation
	/** Реестр нотаций */
	registry: ReadonlyMap<string, FlowNotation>
	/** Раскладки по id */
	layouts: ReadonlyMap<string, FlowLayoutAlgorithm>
	/** Маршрутизаторы по id */
	routers: ReadonlyMap<string, FlowRouter>
	/** Настройки поверх данных (проп `layout`) */
	overrides?: FlowLayoutSettings
	/** Компактный вид: плитки вместо карточек, ярусы переносятся по 3 */
	isCompact?: boolean
}

/** Параметры одного запуска раскладки */
export interface FlowLayoutRun {
	/** Настройки только на этот запуск (команда `layout`) */
	settings?: FlowLayoutSettings
	/** Сбросить закрепления */
	isForced?: boolean
	/** Разложить только эти узлы, остальные остаются на текущих местах */
	ids?: string[]
	/** Текущие позиции узлов, которые остаются на месте при `ids` */
	current?: ReadonlyMap<string, FlowPoint>
}
