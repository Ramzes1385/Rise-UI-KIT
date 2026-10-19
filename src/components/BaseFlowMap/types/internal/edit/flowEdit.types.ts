import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { FlowMapContext } from '../flowModel.types'
import type { FlowElementRef } from '../../data/flowReview.types'
import type { FlowViewport } from '../../api/flowController.types'
import type { FlowModelInternal } from '../core/flowRenderInternal.types'
import type { FlowEdge, FlowGroup, FlowNode, FlowPoint, FlowRect } from '../../data/flowData.types'

/** Инструмент: выбор, рука, связь, узел, заметка, группа */
export const FLOW_EDIT_TOOLS = ['select', 'hand', 'connect', 'node', 'note', 'group'] as const

/** Инструмент «Правки» */
export type FlowEditTool = (typeof FLOW_EDIT_TOOLS)[number]

/** Выравнивание: края и центры по осям */
export const FLOW_EDIT_ALIGNS = ['left', 'center', 'right', 'top', 'middle', 'bottom'] as const

/** Способ выравнивания */
export type FlowEditAlign = (typeof FLOW_EDIT_ALIGNS)[number]

/** Метка расстояния на направляющей: число px или слово «центр» */
export interface FlowEditGuideMark {
	/** Положение вдоль линии, px холста */
	at: number
	/** Число — расстояние; null — центр */
	size: number | null
}

/** Направляющая: линия выравнивания с расстояниями */
export interface FlowEditGuide {
	/** x — вертикальная линия, y — горизонтальная */
	axis: 'x' | 'y'
	/** Положение, px холста */
	at: number
	/** Начало вдоль линии */
	from: number
	/** Конец вдоль линии */
	to: number
	/** Метки расстояний */
	marks: FlowEditGuideMark[]
}

/** Призрак узла при перетаскивании */
export interface FlowEditGhost {
	/** Id узла */
	id: string
	/** Новая рамка */
	rect: FlowRect
}

/** Конец связи на призраке: узел и порт */
export interface FlowEditEnd {
	/** Узел */
	node: string
	/** Порт */
	port?: string
}

/** Призрак связи при соединении мышью */
export interface FlowEditLink {
	/** Начало */
	source: FlowEditEnd
	/** Точка начала, px холста */
	from: FlowPoint
	/** Указатель, px холста */
	to: FlowPoint
	/** Узел и порт под указателем */
	target: FlowEditEnd | null
	/** Итог проверки: ok — можно, no — нельзя, pending — ждём асинхронный ответ, none — цели нет */
	verdict: 'ok' | 'no' | 'pending' | 'none'
	/** Причина отказа */
	message?: string
}

/** Уведомление в карте: «Нельзя: …» и «Отменено: … · Ctrl Z» */
export interface FlowEditNotice {
	/** Номер */
	id: number
	/** Вид */
	type: 'info' | 'warning'
	/** Текст */
	text: string
}

/** Подпись на месте */
export interface FlowEditLabelDraft {
	/** Элемент */
	target: FlowElementRef
	/** Рамка на экране относительно области вида */
	box: FlowRect
	/** Текст */
	value: string
	/** Многострочный вид */
	isMultiline: boolean
}

/** Вкладка панели свойств */
export const FLOW_EDIT_TABS = ['props', 'style', 'data', 'hooks'] as const

/** Вкладка панели свойств */
export type FlowEditTab = (typeof FLOW_EDIT_TABS)[number]

/** Состояние «Правки» */
export interface FlowEditState {
	/** Режим edit или review: инструменты холста работают */
	isActive: ComputedRef<boolean>
	/** Режим edit: панели правки на месте */
	isEditing: ComputedRef<boolean>
	/** Компактный вид: только свойства */
	isCompact: ComputedRef<boolean>
	/** Инструмент */
	tool: Ref<FlowEditTool>
	/** Сетка видна */
	isGridOn: Ref<boolean>
	/** Привязка включена */
	isSnapOn: Ref<boolean>
	/** Вкладка свойств */
	tab: Ref<FlowEditTab>
	/** Рамка выделения, px холста */
	marquee: Ref<FlowRect | null>
	/** Призраки перетаскиваемых узлов */
	ghosts: Ref<FlowEditGhost[]>
	/** Направляющие */
	guides: Ref<FlowEditGuide[]>
	/** Группа, в которую падает перетаскиваемое */
	dropGroup: Ref<string | null>
	/** Призрак связи */
	link: Ref<FlowEditLink | null>
	/** Узел с портами, к которым тянемся */
	portNodes: ComputedRef<string[]>
	/** Уведомления */
	notices: Ref<FlowEditNotice[]>
	/** Подпись на месте */
	label: Ref<FlowEditLabelDraft | null>
	/** Рука зажата пробелом */
	isHandHeld: Ref<boolean>
	/** Справка клавиш открыта */
	isHelpOpen: Ref<boolean>
	/** Допустимые цели соединения с клавиатуры: id узла-источника */
	linkFrom: Ref<string | null>
	/** Меню */
	menu: ShallowRef<{ x: number; y: number; target: FlowElementRef | null } | null>
}

/** Среда частей «Правки» */
export interface FlowEditEnv {
	/** Модель */
	model: FlowModelInternal
	/** Контекст карты */
	map: FlowMapContext
	/** Область вида */
	element: Readonly<Ref<HTMLElement | null>>
	/** Состояние */
	state: FlowEditState
}

/** Данные буфера: копия узлов, связей и групп */
export interface FlowEditClip {
	/** Метка формата */
	riseFlow: 1
	/** Узлы */
	nodes: FlowNode[]
	/** Связи */
	edges: FlowEdge[]
	/** Группы */
	groups: FlowGroup[]
}

/** Положения узлов после выравнивания или распределения: id → позиция */
export type FlowEditPositions = Record<string, FlowPoint>

/** Видимая область и точка в кадре — для пересчёта экрана в холст */
export interface FlowEditView {
	/** Область */
	viewport: FlowViewport
	/** Рамка кадра на экране */
	box: Pick<DOMRect, 'left' | 'top'> | undefined
}
