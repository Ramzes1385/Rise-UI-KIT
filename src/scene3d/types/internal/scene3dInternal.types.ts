import type { Ref, ShallowRef } from 'vue'
import type { UseTweenReturn } from '@composables/interaction/useTween'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { Scene3DFallbackReason, Scene3DRenderer, Scene3DRendererFactory } from '../scene3d.types'
import type {
	AnimationClip,
	Box3,
	BufferGeometry,
	Camera,
	Color,
	Material,
	Object3D,
	OrthographicCamera,
	PerspectiveCamera,
	Texture,
	Vector3,
} from 'three'

/** Кадр, который видят хуки цикла: шаг времени (с, не больше 0,05) и время от первого кадра (с) */
export interface Scene3DFrame {
	delta: number
	time: number
}

/** Что делает `tick` анимации: `false` снимает её с цикла, остальное — продолжает */
export type Scene3DTick = (delta: number, time: number) => boolean | void

/** Вид общего ресурса кеша */
export type Scene3DResourceKind = 'geometry' | 'material' | 'texture'

/**
 * Кеш ресурсов сцены со счётом ссылок: одинаковый ключ — один объект.
 * Каждый вызов `geometry`/`material`/`texture` берёт ссылку, `release` её возвращает;
 * на нуле ресурс освобождается (`dispose()`), `dispose` освобождает всё разом
 */
export interface Scene3DResourceCache {
	/** Общая геометрия по ключу: строится один раз, повторный вызов добавляет ссылку */
	geometry: <T extends BufferGeometry>(key: string, build: () => T) => T
	/** Общий материал по ключу */
	material: <T extends Material>(key: string, build: () => T) => T
	/** Общая текстура по ключу (атлас подписей, карты окраски) */
	texture: <T extends Texture>(key: string, build: () => T) => T
	/** Вернуть одну ссылку; на нуле — `dispose()` ресурса и удаление из кеша. Неизвестный ключ — ничего */
	release: (kind: Scene3DResourceKind, key: string) => void
	/** Освободить всё и очистить кеш (размонтирование) */
	dispose: () => void
}

/** Цикл кадров по требованию (реализация — `loop/useRenderLoop.ts`) */
export interface Scene3DLoop {
	/** Запросить один кадр (повторные вызовы до кадра склеиваются) */
	invalidate: () => void
	/** Непрерывные кадры, пока `tick` не вернёт `false` или не вызвана остановка; при «уменьшить движение» — один кадр */
	animate: (tick: Scene3DTick) => () => void
	/** Хук после каждого нарисованного кадра; возвращает отписку */
	onFrame: (hook: () => void) => () => void
	/** Хук перед каждым кадром (кадр приложения — `onBeforeRender`); возвращает отписку */
	onBeforeRender: (hook: (frame: Scene3DFrame) => void) => () => void
}

/** Подпись поверх холста: якорь в сцене и порядок показа при перекрытии */
export interface Scene3DLabelItem {
	id: string
	/** Точка в мировых координатах, к которой привязана подпись */
	anchor: Vector3
	/** Больше — важнее: выбранный > наведённый > активный шаг > фокус > остальные по важности */
	priority: number
	/** Подпись всегда видна, даже если перекрыта (выбранный объект) */
	isPinned?: boolean
}

/** Положение подписи на экране после пересчёта */
export interface Scene3DLabelSpot {
	x: number
	y: number
	isVisible: boolean
}

/** Подписи HTML поверх холста: положения пишутся в DOM напрямую, без реактивности на кадр (реализация — `overlay/useSceneLabels.ts`) */
export interface Scene3DLabels {
	/** Слой подписей (`aria-hidden`); задаётся шаблоном */
	layer: Readonly<ShallowRef<HTMLElement | null>>
	/** Заменить набор подписей; элемент подписи — `[data-label-id]` внутри слоя */
	setItems: (items: readonly Scene3DLabelItem[]) => void
	/** Пересчитать положения и перекрытия для камеры и размера холста; вызывается из `onFrame`. Камера и размер не менялись, данные тоже — ничего не делает */
	update: (camera: Camera, size: { width: number; height: number }) => void
	/** Пересчитать на следующем `update` и без движения камеры (якорь подписи сдвинулся, содержимое изменилось) */
	markDirty: () => void
	/** Положения после последнего `update` (только чтение) */
	spots: ReadonlyMap<string, Scene3DLabelSpot>
	/** Забыть подписи и отключить слой */
	dispose: () => void
}

/** Всё, что ядро держит для одной сцены: общие для компонентов 3D части */
export interface Scene3DRuntime {
	renderer: Readonly<ShallowRef<Scene3DRenderer | null>>
	loop: Scene3DLoop
	cache: Scene3DResourceCache
	labels: Scene3DLabels
}

/** Вид камеры: isometric — ортографическая изометрия, perspective — перспектива */
export type Scene3DCameraKind = 'isometric' | 'perspective'

/** Камера сцены */
export type Scene3DViewCamera = OrthographicCamera | PerspectiveCamera

/** Положение камеры: цель `[x, y, z]`, азимут и полярный угол (радианы), масштаб */
export type Scene3DCameraPose = [number, number, number, number, number, number]

/** Размер области сцены, px */
export interface Scene3DScreenSize {
	width: number
	height: number
}

/** Точка сцены на экране: координаты в области (px) и видна ли она камере */
export interface Scene3DScreenSpot {
	x: number
	y: number
	isVisible: boolean
}

/** Положение карточки объекта: якорь (px) и сторона — над объектом или под ним у верхнего края */
export interface Scene3DCardPlacement {
	left: number
	top: number
	isBelow: boolean
}

/** Кадр камеры: границы сцены и размеры, по которым подбирается проекция */
export interface CameraFraming {
	/** Границы сцены в мировых координатах (по X и Z — план, по Y — высота) */
	bounds: Box3
	/** Радиус окружности вокруг центра плана, описанной вокруг сцены: кадр не обрежет её при любом повороте */
	radius: number
	/** Половина высоты, на которую камера «смотрит» по оси Y: стопка этажей, один этаж или остров */
	halfHeight: number
	/** Возвышение камеры над горизонтом, градусы: карта — 35, флоу и роадмап — изометрия 35,264 */
	elevation: number
}

/** Рамка, по которой ограничивается сдвиг камеры */
export type Scene3DPanFrame = Pick<CameraFraming, 'bounds' | 'radius'>

/** Точка на ободе цилиндра сцены в системе камеры начального вида: по ней подбирается кадр перспективной камеры */
export interface Scene3DRimPoint {
	/** Смещение вбок от оси взгляда по модулю */
	sideways: number
	/** Смещение вверх от оси взгляда по модулю */
	up: number
	/** Смещение к камере вдоль оси взгляда: больше — ближе к камере */
	toward: number
}

/** CSS-цвет (в том числе `var(--rise-*)`) → цвет three в теме области */
export type Scene3DColorResolver = (css: string) => Color

/** Действие камеры по клавише */
export type Scene3DCameraKeyAction =
	{ type: 'rotate'; degrees: number } | { type: 'tilt'; degrees: number } | { type: 'zoom'; direction: 1 | -1 } | { type: 'reset' }

/** Настройки клавиш камеры */
export interface Scene3DCameraKeyOptions {
	/** Q/E — поворот на 90°; у карты выключено */
	hasQuarterTurns?: boolean
}

/** Последнее положение указателя: наведение по нему считается раз в кадр */
export interface Scene3DPointerSpot {
	/** Элемент под указателем (метка точки) */
	target: EventTarget | null
	/** clientX */
	x: number
	/** clientY */
	y: number
}

/** Указатель над сценой */
export interface Scene3DPointerOptions {
	/** Id объекта под точкой экрана (clientX, clientY) */
	pickAt: (x: number, y: number) => string | null
	/** Id объекта по элементу под указателем (метка поверх холста); без неё выбор — только лучом */
	markerAt?: (target: EventTarget | null) => string | null
	/** Объект под указателем */
	setHover: (id: string | null) => void
	/** Выбрать объект */
	activate: (id: string, event: Event) => void
}

/** Параметры области рисования */
export interface Scene3DViewportOptions {
	/** Холст: есть в DOM — рендерер работает, пропал — всё освобождается */
	canvasRef: Readonly<Ref<HTMLCanvasElement | null>>
	/** Элемент, по размеру которого рисуется сцена */
	hostRef: Readonly<Ref<HTMLElement | null>>
	/** Подгонка камеры под размер области: рамка, проекция, границы отсечения */
	fit: (camera: Scene3DViewCamera, size: Scene3DScreenSize) => void
	/** Фабрика рендерера */
	getFactory: () => Scene3DRendererFactory
	/** Вид камеры */
	getCameraKind: () => Scene3DCameraKind
	/** Рендерер не создался или графический контекст потерян и не вернулся */
	onError: (error: unknown) => void
}

/** Параметры резервного 2D-вида */
export interface Scene3DFallbackOptions {
	/** Какой вид просили: 2D никогда не считается сбоем */
	getView: () => '2d' | '3d'
	/** Сообщить о переходе в 2D */
	onFallback: (reason: Scene3DFallbackReason) => void
	/** Тексты статуса для скринридера: читаются при каждом обращении (язык меняется на лету); без них — `UI_SCENE_3D` */
	getMessages?: () => Record<Scene3DFallbackReason, string>
}

/** Размещение модели: общие поля `ImageMapLayerModel` и `Model3DGltfDefinition` */
export interface Scene3DModelPlacement {
	/** Адрес модели: при размещении не используется, нужен загрузчику */
	url?: string
	/** Масштаб; по умолчанию 1 */
	scale?: number
	/** Сдвиг `[x, y, z]` */
	position?: [number, number, number]
	/** Поворот вокруг вертикальной оси, градусы */
	rotationY?: number
}

/** Положение камеры: твин, масштаб, OrbitControls и переходы */
export interface Scene3DPoseState {
	/** Твин положения камеры */
	tween: UseTweenReturn<Scene3DCameraPose>
	/** Текущий масштаб */
	zoom: Ref<number>
	/** OrbitControls, пока есть рендерер */
	controls: ShallowRef<OrbitControls | null>
	/** Положение камеры сейчас */
	current: () => Scene3DCameraPose
	/** Основа следующего шага: цель идущего или ещё не показанного перехода (нажатия копятся) или положение сейчас */
	next: () => Scene3DCameraPose
	/** Запомнить положение после жеста */
	sync: () => void
	/** Плавно перейти к положению */
	goTo: (pose: Scene3DCameraPose) => void
	/** Сразу поставить положение */
	jump: (pose: Scene3DCameraPose) => void
	/** Применить положение к камере без перехода (после подгонки камеры под область) */
	show: (pose: Scene3DCameraPose) => void
	/** Последнее показанное положение */
	lastPose: () => Scene3DCameraPose | null
}

/** Параметры орбитальной камеры */
export interface OrbitCameraOptions {
	/** Камера сцены */
	camera: Readonly<ShallowRef<Scene3DViewCamera>>
	/** Рендерер: есть — работают OrbitControls */
	renderer: Readonly<ShallowRef<Scene3DRenderer | null>>
	/** Холст: к нему подключаются OrbitControls */
	canvasRef: Readonly<Ref<HTMLCanvasElement | null>>
	/** Кадр камеры */
	getFraming: () => CameraFraming
	/** Начальное положение (по нему сбрасывается камера): читает реактивные данные вызывающего */
	getHomePose: () => Scene3DCameraPose
	/** Счётчик подгонок камеры под размер области: после подгонки поза применяется заново */
	fitted: Readonly<ShallowRef<number>>
	/** Вращение и наклон указателем */
	getHasOrbit: () => boolean
	/** Запросить кадр */
	invalidate: () => void
}

/** Настройки цикла кадров */
export interface RenderLoopOptions {
	/** Элемент, видимость которого паузит анимации; по умолчанию — холст рендерера */
	getHost?: () => HTMLElement | null
	/** «Уменьшить движение»: `animate` рисует один кадр вместо непрерывных */
	isReducedMotion?: () => boolean
}

/** Пауза непрерывных кадров: вкладка скрыта или хост вне экрана */
export interface Scene3DPauseWatch {
	/** Сейчас пауза */
	isPaused: () => boolean
	/** Начать слежение (повторный вызов ничего не меняет) */
	start: () => void
	/** Снять наблюдателей и сбросить паузу */
	stop: () => void
}

/** Размер подписи на экране, px: бирка стоит над якорем по центру */
export interface Scene3DLabelBox {
	width: number
	height: number
}

/** Прямоугольник подписи на экране, px */
export interface Scene3DLabelRect {
	left: number
	right: number
	top: number
	bottom: number
}

/** Загруженная модель: сцена и клипы анимаций файла (пустой список, если их нет) */
export interface Scene3DLoadedModel {
	object: Object3D
	clips: AnimationClip[]
}
