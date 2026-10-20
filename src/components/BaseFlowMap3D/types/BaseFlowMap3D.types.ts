import type { UiProp } from '@composables/base/useUi'
import type { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { FlowDataIssue } from '@components/BaseFlowMap/types/api/flowNotation.types'
import type { FlowElementRef } from '@components/BaseFlowMap/types/data/flowReview.types'
import type { FlowNodeKindDef } from '@components/BaseFlowMap/types/api/flowNotation.types'
import type { FlowScenarioState } from '@components/BaseFlowMap/types/data/flowScenario.types'
import type { Model3DDefinitions, Model3DHandle, Model3DNode } from '@/scene3d/types/model3d.types'
import type { FlowMapData, FlowNode, FlowStatus } from '@components/BaseFlowMap/types/data/flowData.types'
import type { BaseFlowMapProps, BaseFlowMapSlots, FlowMapVariant } from '@components/BaseFlowMap/types/BaseFlowMap.types'
import type {
	Scene3DCameraPreset,
	Scene3DContext,
	Scene3DFallbackReason,
	Scene3DHookProps,
	Scene3DRendererFactory,
} from '@/scene3d/types/scene3d.types'
import type {
	FlowChangeEvent,
	FlowElementEvent,
	FlowErrorEvent,
	FlowHistoryState,
	FlowHooks,
	FlowLevelState,
	FlowMapController,
	FlowMoveEvent,
	FlowRejectEvent,
	FlowViewport,
} from '@components/BaseFlowMap/types/api/flowController.types'

/** Вид карты: 3d — сцена three.js; 2d — BaseFlowMap с теми же данными, выбором и сценарием */
export const FLOW_MAP_3D_VIEWS = ['3d', '2d'] as const

/** Вид карты */
export type FlowMap3DView = (typeof FLOW_MAP_3D_VIEWS)[number]

/** Качество: auto — тени картой до 80 узлов, иначе пятна-тени; low — без теней и мелких деталей; high — тени всегда */
export const FLOW_MAP_3D_QUALITIES = ['auto', 'low', 'high'] as const

/** Качество сцены */
export type FlowMap3DQuality = (typeof FLOW_MAP_3D_QUALITIES)[number]

/** Режимы, которые есть в 3D: «Правки» (`review`) показывает 2D-вид BaseFlowMap */
export const FLOW_MAP_3D_MODES = ['view', 'edit'] as const

/** Режим карты в 3D */
export type FlowMap3DMode = (typeof FLOW_MAP_3D_MODES)[number]

/** Почему показан 2D-вид, хотя просили 3D: unsupported — нет WebGL; error — рендерер не создался, контекст потерян или модель не загрузилась */
export type FlowMap3DFallbackReason = Scene3DFallbackReason

/** Части BaseFlowMap3D для пропа `ui` (`.base-flow-map-3d__<часть>`): root — вся карта, viewport — область сцены, canvas — холст, tag — бирка узла, hint — подсказка над сценой, dock — нижняя панель, zoom — кнопки масштаба, status — плашка загрузки и ошибки, list — скрытый список узлов; в «Правке»: toolbar — панель выбранного, palette — «Заменить модель», inspector — свойства */
export const FLOW_MAP_3D_PARTS = [
	...['root', 'viewport', 'canvas', 'tag', 'hint', 'dock', 'zoom', 'status', 'list'],
	...['toolbar', 'palette', 'inspector'],
] as const

/** Часть BaseFlowMap3D */
export type BaseFlowMap3DPart = (typeof FLOW_MAP_3D_PARTS)[number]

/** Пропсы BaseFlowMap, которых у 3D-карты нет или они свои: в 3D нет «Правок», панелей-мини-карты и меню шапки */
type FlowMap2DOnlyProp =
	| 'variant'
	| 'sizeScale'
	| 'color'
	| 'customClass'
	| 'ui'
	| 'mode'
	| 'modes'
	| 'panels'
	| 'suggestions'
	| 'comments'
	| 'versions'
	| 'compareWith'
	| 'currentUser'
	| 'savedAt'

/**
 * Пропсы компонента BaseFlowMap3D. Общие с BaseFlowMap пропсы называются так же и передаются в 2D-вид; данные, нотации и сценарии — те же,
 * раскладка и маршруты — ядра карты (3D своей раскладки не ведёт)
 */
export interface BaseFlowMap3DProps
	extends
		Omit<BaseFlowMapProps, FlowMap2DOnlyProp>,
		BaseComponentProps<FlowMapVariant, BaseFlowMap3DPart>,
		Scene3DHookProps,
		Partial<FlowHooks> {
	/** Режим (`v-model:mode`): `view` или `edit`. Режим `edit` — правка в 3D (перенос по земле, поворот, замена модели, связи, свойства); на контейнере уже 768 px — правка ядра карты в 2D */
	mode?: FlowMap3DMode
	/** Режимы в нижней панели: с `edit` в ней кнопка «Правка» (на контейнере уже 768 px её нет) */
	modes?: FlowMap3DMode[]
	/** Вид (`v-model:view`): `3d` (по умолчанию) или `2d`. Без WebGL показывается 2D при любом значении */
	view?: FlowMap3DView
	/** Пресет камеры (`v-model:camera`): `iso` (по умолчанию), `iso-90`, `iso-180`, `iso-270`, `top`, `perspective`; без него — `data.view3d.camera` */
	camera?: Scene3DCameraPreset
	/** «Слои» (`v-model:isLayered`): группы верхнего уровня ярусами; без него — `data.view3d.isLayered` */
	isLayered?: boolean
	/** Свои модели узлов по ключам: встроенная под своим именем, GLB по адресу или фабрика (`defineModel3D`); сильнее моделей приложения (`createScene3DModels`) */
	models?: Model3DDefinitions
	/** Правило выбора модели по узлу: id встроенной модели или ключ из `models`; `null` и `undefined` — решает кит (вид нотации, слова названия, запасная) */
	modelResolver?: (node: Model3DNode) => string | null | undefined
	/** Качество сцены; без него — `data.view3d.quality` */
	quality?: FlowMap3DQuality
	/** Фабрика рендерера; по умолчанию — `WebGLRenderer` three.js со сглаживанием и прозрачным фоном */
	rendererFactory?: Scene3DRendererFactory
	/** Настройка загрузчика GLB перед загрузкой: подключить DRACO, KTX2 или meshopt приложения (кит сам их не подключает) */
	configureLoader?: (loader: GLTFLoader) => void
	/** Переключатель «3D / 2D» в нижней панели; без WebGL его нет. По умолчанию `true` */
	has2dToggle?: boolean
	/** Переключатель «Слои» в нижней панели. По умолчанию `true` */
	hasLayersToggle?: boolean
	/** Кнопки камеры: пресеты 1 и 2, масштаб, «Сбросить вид». По умолчанию `true` */
	hasCameraControls?: boolean
	/**
	 * Классы частей (`root`, `viewport`, `canvas`, `tag`, `hint`, `dock`, `zoom`, `status`, `list`, `toolbar`, `palette`, `inspector` — см. `FLOW_MAP_3D_PARTS`) —
	 * добавляются к классам кита. Глобально — `defaults.BaseFlowMap3D.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseFlowMap3D :data="flow" :ui="{ root: 'shadow-sm', dock: 'opacity-90' }" />
	 */
	ui?: UiProp<BaseFlowMap3DPart>
}

/** Пропсы после `withDefaults` */
export type FlowMap3DProps = PropsWithDefaults<
	BaseFlowMap3DProps,
	| 'mode'
	| 'view'
	| 'isAutoplay'
	| 'isSemanticZoom'
	| 'particles'
	| 'compactBreakpoint'
	| 'height'
	| 'wheelZoom'
	| 'minZoom'
	| 'maxZoom'
	| 'isLoading'
	| 'isDisabled'
	| 'has2dToggle'
	| 'hasLayersToggle'
	| 'hasCameraControls'
>

/**
 * События компонента BaseFlowMap3D: те же, что у BaseFlowMap (кроме «Правок»: `update:suggestions`, `update:comments`, `accept`, `decline`,
 * `comment`), и четыре своих — `update:view`, `update:camera`, `update:isLayered`, `fallback`
 */
export interface BaseFlowMap3DEmits {
	/** Данные изменились (`v-model:data` в режиме «Правка») */
	(event: 'update:data', value: FlowMapData): void
	/** Режим (`v-model:mode`) */
	(event: 'update:mode', value: FlowMap3DMode): void
	/** Выделение (`v-model:selection`) */
	(event: 'update:selection', value: string[]): void
	/** Изменение данных */
	(event: 'change', value: FlowChangeEvent): void
	/** Отказ правила нотации, хука или предела */
	(event: 'reject', value: FlowRejectEvent): void
	/** Щелчок, двойной щелчок, контекстное меню, наведение на узел, связь или группу (данные — `FlowElementEvent`) */
	(
		event:
			| 'node-click'
			| 'node-dblclick'
			| 'node-contextmenu'
			| 'node-enter'
			| 'node-leave'
			| 'edge-click'
			| 'edge-dblclick'
			| 'edge-contextmenu'
			| 'edge-enter'
			| 'edge-leave'
			| 'group-click'
			| 'group-contextmenu'
			| 'group-toggle',
		value: FlowElementEvent,
	): void
	/** Узлы перемещены */
	(event: 'node-move', value: FlowMoveEvent): void
	/** Фокус клавиатуры */
	(event: 'focus-change', value: FlowElementRef | null): void
	/** Видимая область: сдвиг и масштаб в системе 2D-вида */
	(event: 'viewport-change', value: FlowViewport): void
	/** Уровень смыслового зума или путь входа изменились */
	(event: 'level-change', value: FlowLevelState): void
	/** Состояние сценария и новый шаг */
	(event: 'scenario-change' | 'scenario-step', value: FlowScenarioState): void
	/** История */
	(event: 'history-change', value: FlowHistoryState): void
	/** Проверка нотации */
	(event: 'validate', value: FlowDataIssue[]): void
	/** Карта готова: контроллер с камерой, видом и моделями */
	(event: 'ready', value: FlowMap3DController): void
	/** Ошибка: загрузка, импорт, хук */
	(event: 'error', value: FlowErrorEvent): void
	/** Сменился вид (`v-model:view`) */
	(event: 'update:view', view: FlowMap3DView): void
	/** Сменился пресет камеры (`v-model:camera`): кнопки, Q и E, смена пропа */
	(event: 'update:camera', preset: Scene3DCameraPreset): void
	/** Включены или выключены «Слои» (`v-model:isLayered`) */
	(event: 'update:isLayered', isLayered: boolean): void
	/** Карта показала 2D вместо 3D: нет WebGL, рендерер не создался, контекст потерян или модель не загрузилась */
	(event: 'fallback', reason: FlowMap3DFallbackReason): void
}

/** Что получает слот `tag` */
export interface FlowMap3DTagSlotProps {
	/** Узел */
	node: FlowNode
	/** Вид нотации */
	kind: FlowNodeKindDef
	/** Живой статус (поверх `node.status`) */
	status?: FlowStatus
	/** Выделен */
	isSelected: boolean
	/** В фокусе клавиатуры */
	isFocused: boolean
	/** Работает в текущем шаге сценария */
	isActive: boolean
	/** Под указателем */
	isHovered: boolean
}

/** Слоты BaseFlowMap3D: слоты BaseFlowMap (в 2D-виде они передаются ему) и бирка узла */
export interface BaseFlowMap3DSlots extends BaseFlowMapSlots {
	/** Содержимое бирки узла над моделью (3D-вид); без слота — название и точка статуса */
	tag?: (props: FlowMap3DTagSlotProps) => unknown
}

/** Контроллер BaseFlowMap3D: всё, что у `FlowMapController`, и камера, вид, «Слои» и модели сцены */
export interface FlowMap3DController extends FlowMapController {
	/** Пресет камеры: плавный переход */
	setCamera: (preset: Scene3DCameraPreset) => void
	/** Повернуть камеру на 90° (1 — по часовой стрелке при взгляде сверху) */
	rotate: (step: 1 | -1) => void
	/** Наезд камеры на узел и фокус клавиатуры на нём */
	flyTo: (id: string) => void
	/** Показать вид: `3d` или `2d` (то же, что `v-model:view`) */
	setView: (view: FlowMap3DView) => void
	/** Включить или выключить «Слои» */
	setLayered: (isLayered: boolean) => void
	/** Дескриптор модели узла; нет такого узла или сцена не собрана — `null` */
	getModel: (id: string) => Model3DHandle | null
	/** Дескрипторы всех моделей сцены */
	getModels: () => Model3DHandle[]
	/** Сцена, камера и рендерер; `null`, пока сцена не собрана или показан 2D-вид */
	getSceneContext: () => Scene3DContext | null
}

/** Методы компонента BaseFlowMap3D (ref) */
export type BaseFlowMap3DExpose = FlowMap3DController
