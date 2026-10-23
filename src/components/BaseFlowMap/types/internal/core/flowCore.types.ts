import type { ComputedRef, Ref } from 'vue'
import type { FlowNotation } from '../../api/flowNotation.types'
import type { FlowScenario } from '../../data/flowScenario.types'
import type { FlowMapController } from '../../api/flowController.types'
import type { FlowEdge, FlowGroup, FlowNode } from '../../data/flowData.types'

/** Отложенный вызов контроллера: ждёт монтирования карты */
export type FlowQueuedCall = (controller: FlowMapController) => void

/** Управление картой вне шаблона: контроллер плюс `mapRef` и признак готовности */
export type FlowMapHandle = FlowMapController & {
	/** Ссылка на контроллер: вешается на `<BaseFlowMap ref>` */
	mapRef: Ref<FlowMapController | null>
	/** Карта смонтирована */
	isReady: Readonly<ComputedRef<boolean>>
}

/** Элемент любой сущности карты */
export type FlowItem = FlowNode | FlowEdge | FlowGroup | FlowScenario

/** Имя списка в данных карты */
export type FlowCollection = 'nodes' | 'edges' | 'groups' | 'scenarios'

/** Элемент с id и произвольными полями — сравнение и разница */
export type FlowKeyed = { id: string } & Record<string, unknown>

/** Шаг миграции данных: поднимает данные на следующую версию */
export type FlowMigration = (data: Record<string, unknown>) => Record<string, unknown>

/** Что нужно нормализации данных: нотация карты и реестр нотаций */
export interface FlowNormalizeContext {
	/** Нотация карты */
	notation: FlowNotation
	/** Реестр подключённых нотаций */
	registry: ReadonlyMap<string, FlowNotation>
}
