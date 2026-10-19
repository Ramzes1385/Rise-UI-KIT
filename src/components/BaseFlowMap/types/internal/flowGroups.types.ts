import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { FlowNotation } from '../api/flowNotation.types'
import type { FlowGroup, FlowMapData } from '../data/flowData.types'
import type { FlowLevelState, FlowMapController } from '../api/flowController.types'

/** Запись смыслового зума нотации */
export type FlowSemanticEntry = NonNullable<FlowNotation['semanticZoom']>[number]

/** Подписи блоков и слитых связей: числа с формами слов из словаря */
export interface FlowGroupTexts {
	/** «3 элемента» — подзаголовок блока свёрнутой группы */
	items: (count: number) => string
	/** «2 связи» — подпись слитой связи */
	links: (count: number) => string
}

/** Входные данные состояния групп */
export interface FlowGroupSource {
	data: () => FlowMapData
	notation: () => FlowNotation
	isEnabled: () => boolean
	texts: FlowGroupTexts
}

/** Состояние свёрнутости групп и уровня смыслового зума (вид, не данные) */
export interface FlowGroupState {
	/** Id свёрнутых групп сейчас */
	collapsed: ComputedRef<ReadonlySet<string>>
	/** Записи смыслового зума (пусто — зума нет или он выключен) */
	entries: ComputedRef<readonly FlowSemanticEntry[]>
	/** Уровень и путь входа */
	level: ComputedRef<FlowLevelState>
	/** Идёт переход между раскладками: нужен классу корня */
	isMorphing: Readonly<Ref<boolean>>
	/** Масштаб вида после конца жеста */
	setZoom: (zoom: number) => void
	/** Свернуть или развернуть группу вручную */
	toggle: (id: string, isCollapsed?: boolean) => void
	/** Развернуть группы, скрывающие элементы */
	reveal: (ids: readonly string[]) => void
	/** Закрепить уровень; возвращает масштаб, в котором он виден */
	setLevel: (index: number, limits: { min: number; max: number }) => number
	/** Войти в группу: закрепляет нужный уровень, разворачивает путь до группы */
	enter: (id: string) => void
	/** Выйти до длины пути `depth` (по умолчанию на шаг); возвращает группу, в которую вписать вид, или null */
	leave: (depth?: number) => string | null
}

/** Результат сворачивания: данные для раскладки */
export interface FlowCollapsedView {
	data: FlowMapData
	groups: readonly FlowGroup[]
}

/** Методы контроллера для групп и уровней */
export type FlowGroupsApi = Pick<FlowMapController, 'toggleGroup' | 'getCollapsed' | 'getLevel' | 'setLevel' | 'enterGroup' | 'leaveGroup'>

/** Закрепление уровня: уровень, масштаб, при котором он закреплён, и время закрепления */
export interface FlowGroupPin {
	level: number
	zoom: number | null
	at: number
}

/** Исходное состояние групп: то, из чего считаются свёрнутые группы */
export interface FlowGroupBase {
	source: FlowGroupSource
	zoom: ShallowRef<number>
	pin: ShallowRef<FlowGroupPin | null>
	overrides: ShallowRef<ReadonlyMap<string, boolean>>
	trail: ShallowRef<string[]>
	isTouched: ShallowRef<boolean>
	byId: ComputedRef<ReadonlyMap<string, FlowGroup>>
	entries: ComputedRef<readonly FlowSemanticEntry[]>
	index: ComputedRef<number>
}

/** Состояние групп вместе с выведенными значениями */
export interface FlowGroupCore extends FlowGroupBase {
	collapsed: ComputedRef<ReadonlySet<string>>
	path: ComputedRef<string[]>
	level: ComputedRef<FlowLevelState>
}

/** Область сворачивания: группы по id и свёрнутые */
export interface FlowCollapseScope {
	byId: ReadonlyMap<string, FlowGroup>
	collapsed: ReadonlySet<string>
}

/** Действия над состоянием групп */
export type FlowGroupActions = Pick<FlowGroupState, 'setZoom' | 'toggle' | 'reveal' | 'setLevel' | 'enter' | 'leave'>
