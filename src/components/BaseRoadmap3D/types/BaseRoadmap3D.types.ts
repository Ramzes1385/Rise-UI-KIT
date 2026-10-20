import type { UiProp } from '@composables/base/useUi'
import type { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { RoadmapStage } from '@components/BaseRoadmap/types/roadmapData.types'
import type { Model3DDefinitions, Model3DHandle } from '@/scene3d/types/model3d.types'
import type {
	Scene3DCameraPreset,
	Scene3DContext,
	Scene3DFallbackReason,
	Scene3DHookProps,
	Scene3DRendererFactory,
} from '@/scene3d/types/scene3d.types'
import type {
	BaseRoadmapEmits,
	BaseRoadmapExpose,
	BaseRoadmapProps,
	BaseRoadmapSlots,
	RoadmapVariant,
} from '@components/BaseRoadmap/types/BaseRoadmap.types'

/** Вид пути: 3d — остров three.js; 2d — BaseRoadmap (раскладка `path`) с теми же данными, прогрессом и выбором */
export const ROADMAP_3D_VIEWS = ['3d', '2d'] as const

/** Вид пути */
export type Roadmap3DView = (typeof ROADMAP_3D_VIEWS)[number]

/** Качество: auto — тени картой и весь декор, на узком контейнере без мелочи; low — без теней, деревьев, облаков и блёсток; high — всё */
export const ROADMAP_3D_QUALITIES = ['auto', 'low', 'high'] as const

/** Качество сцены */
export type Roadmap3DQuality = (typeof ROADMAP_3D_QUALITIES)[number]

/** Почему показан 2D-вид, хотя просили 3D: unsupported — нет WebGL; error — рендерер не создался, контекст потерян или модель не загрузилась */
export type Roadmap3DFallbackReason = Scene3DFallbackReason

/** Части BaseRoadmap3D для пропа `ui` (`.base-roadmap-3d__<часть>`): root — весь компонент, header — шапка, viewport — область сцены, canvas — холст, tag — бирка этапа и темы, hint — подсказка, toolbar — кнопки камеры, stepper — полоса этапов, panel — панель этапа, tour — кнопки тура, status — плашка загрузки и ошибки, list — скрытый список этапов */
export const ROADMAP_3D_PARTS = [
	'root',
	'header',
	'viewport',
	'canvas',
	'tag',
	'hint',
	'toolbar',
	'stepper',
	'panel',
	'tour',
	'status',
	'list',
] as const

/** Часть BaseRoadmap3D */
export type BaseRoadmap3DPart = (typeof ROADMAP_3D_PARTS)[number]

/** Пропсы BaseRoadmap, которых у 3D-пути нет или они свои */
type Roadmap2DOnlyProp = 'variant' | 'sizeScale' | 'color' | 'customClass' | 'ui' | 'expanded' | 'hasFilter' | 'filter'

/**
 * Пропсы компонента BaseRoadmap3D. Общие с BaseRoadmap пропсы называются так же и передаются в 2D-вид; данные, прогресс, хранилище,
 * хуки и режимы — те же. Режим `edit` — правка через панель этапа, режим `review` показывает 2D-вид
 */
export interface BaseRoadmap3DProps
	extends Omit<BaseRoadmapProps, Roadmap2DOnlyProp>, BaseComponentProps<RoadmapVariant, BaseRoadmap3DPart>, Scene3DHookProps {
	/** Вид (`v-model:view`): `3d` (по умолчанию) или `2d`. Без WebGL показывается 2D при любом значении */
	view?: Roadmap3DView
	/** Пресет камеры (`v-model:camera`): `iso` (по умолчанию), `iso-90`, `iso-180`, `iso-270`, `top`, `perspective`; без него — `data.view3d.camera` */
	camera?: Scene3DCameraPreset
	/** Этап в фокусе (`v-model:focused` — id этапа): камера наезжает на него и открывается панель; `null` — весь остров */
	focused?: string | null
	/** Тур по этапам идёт (`v-model:isTourPlaying`): фокус на следующем этапе каждые 2,6 с, любой ввод останавливает */
	isTourPlaying?: boolean
	/** Свои модели пьедесталов по ключам: встроенная под своим именем, GLB по адресу или фабрика (`defineModel3D`); сильнее моделей приложения (`createScene3DModels`) */
	models?: Model3DDefinitions
	/** Качество сцены */
	quality?: Roadmap3DQuality
	/** Фабрика рендерера; по умолчанию — `WebGLRenderer` three.js со сглаживанием и прозрачным фоном */
	rendererFactory?: Scene3DRendererFactory
	/** Настройка загрузчика GLB перед загрузкой: подключить DRACO, KTX2 или meshopt приложения (кит сам их не подключает) */
	configureLoader?: (loader: GLTFLoader) => void
	/** Переключатель «3D / 2D» в шапке; без WebGL его нет. По умолчанию `true` */
	has2dToggle?: boolean
	/** Кнопка «Тур по этапам» в шапке. По умолчанию `true` */
	hasTour?: boolean
	/** Ширина контейнера, px, ниже которой остров рисуется без мелочи, панель этапа — шторкой, а этапы листаются «Назад / Далее». По умолчанию 640 */
	compactBreakpoint?: number
	/** Высота области; по умолчанию `560px` */
	height?: string
	/**
	 * Классы частей (`root`, `header`, `viewport`, `canvas`, `tag`, `hint`, `toolbar`, `stepper`, `panel`, `tour`, `status`, `list` — см. `ROADMAP_3D_PARTS`) —
	 * добавляются к классам кита. Глобально — `defaults.BaseRoadmap3D.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseRoadmap3D :data="roadmap" :ui="{ root: 'shadow-sm', panel: 'bg-white' }" />
	 */
	ui?: UiProp<BaseRoadmap3DPart>
}

/** Пропсы после `withDefaults` */
export type Roadmap3DProps = PropsWithDefaults<
	BaseRoadmap3DProps,
	| 'view'
	| 'isTourPlaying'
	| 'quality'
	| 'has2dToggle'
	| 'hasTour'
	| 'hasSummary'
	| 'compactBreakpoint'
	| 'height'
	| 'layout'
	| 'detailsPosition'
	| 'narrowWidth'
	| 'isLoading'
	| 'isDisabled'
>

/** События BaseRoadmap3D: все события BaseRoadmap и пять своих — `update:view`, `update:camera`, `update:focused`, `update:isTourPlaying`, `fallback` */
export interface BaseRoadmap3DEmits extends BaseRoadmapEmits {
	/** Сменился вид (`v-model:view`) */
	(event: 'update:view', view: Roadmap3DView): void
	/** Сменился пресет камеры (`v-model:camera`): кнопки, Q и E, смена пропа */
	(event: 'update:camera', preset: Scene3DCameraPreset): void
	/** Сменился этап в фокусе (`v-model:focused`) */
	(event: 'update:focused', id: string | null): void
	/** Тур начался или закончился (`v-model:isTourPlaying`) */
	(event: 'update:isTourPlaying', isPlaying: boolean): void
	/** Путь показал 2D вместо 3D: нет WebGL, рендерер не создался, контекст потерян или модель не загрузилась */
	(event: 'fallback', reason: Roadmap3DFallbackReason): void
}

/** Слоты BaseRoadmap3D: слоты BaseRoadmap (в 2D-виде они передаются ему, а `topic-details` и `material` — ещё и панели темы) */
export type BaseRoadmap3DSlots = BaseRoadmapSlots

/** Управление BaseRoadmap3D: методы BaseRoadmap и камера, вид, фокус, тур и модели сцены */
export interface BaseRoadmap3DExpose extends Omit<BaseRoadmapExpose, 'expandStage' | 'expandAll' | 'collapseAll'> {
	/** Пресет камеры: плавный переход */
	setCamera: (preset: Scene3DCameraPreset) => void
	/** Повернуть камеру на 90° (1 — по часовой стрелке при взгляде сверху) */
	rotate: (step: 1 | -1) => void
	/** Показать вид: `3d` или `2d` (то же, что `v-model:view`) */
	setView: (view: Roadmap3DView) => void
	/** Фокус на этапе: камера наезжает, открывается панель; `null` — весь остров */
	focusStage: (id: string | null) => void
	/** Запустить или остановить тур по этапам */
	setTour: (isPlaying: boolean) => void
	/** Дескриптор модели пьедестала этапа; нет такого этапа или сцена не собрана — `null` */
	getModel: (id: string) => Model3DHandle | null
	/** Дескрипторы всех моделей сцены */
	getModels: () => Model3DHandle[]
	/** Сцена, камера и рендерер; `null`, пока сцена не собрана или показан 2D-вид */
	getSceneContext: () => Scene3DContext | null
	/** Этап по id */
	getStage: (id: string) => RoadmapStage | null
}
