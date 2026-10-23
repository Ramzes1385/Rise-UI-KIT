/** Типы своих 3D-моделей и управления ими: контракт flow3d-roadmap, раздел 6.3 */
import type { BufferGeometry, Color, Material, Object3D, Vector3 } from 'three'

export const MODEL3D_PARTS = ['body', 'accent', 'detail', 'screen', 'metal', 'glass', 'light'] as const
export type Model3DPart = (typeof MODEL3D_PARTS)[number]

export const MODEL3D_ANIMATIONS = [
	'pulse',
	'gate',
	'unlock',
	'roll',
	'swipe',
	'ring',
	'blink',
	'spin',
	'flow',
	'scan',
	'send',
	'think',
] as const
export type Model3DAnimation = (typeof MODEL3D_ANIMATIONS)[number]

/** Тон статуса модели: компонент переводит в него статус узла (карта: ok → none, warning → warning, error → danger, down → muted, unknown → muted, свой — `FlowStatusDef.color`) */
export const MODEL3D_TONES = ['none', 'info', 'success', 'warning', 'danger', 'muted'] as const
export type Model3DTone = (typeof MODEL3D_TONES)[number]

/** Наборы встроенных моделей: service — карта, learning — пьедесталы роадмапа, base — запасные */
export const MODEL3D_SETS = ['service', 'learning', 'base'] as const
export type Model3DSet = (typeof MODEL3D_SETS)[number]

/** Id встроенных моделей (ключи мокапа FlowModels3D, запасные и фигуры пьедесталов) */
export const MODEL3D_PRESET_IDS = [
	'laptop',
	'phone',
	'gateway',
	'lock',
	'cart',
	'rack',
	'terminal',
	'bank',
	'bell',
	'ram',
	'db',
	'conveyor',
	'globe',
	'scales',
	'search',
	'analytics',
	'bucket',
	'mailbox',
	'clock',
	'scroll',
	'monitor',
	'ai',
	'user',
	'cloud',
	'server',
	'shape',
	'window',
	'code',
	'gear',
	'layers',
	'flask',
	'rocket',
	'book',
	'shield',
	'flag',
] as const
export type Model3DPresetId = (typeof MODEL3D_PRESET_IDS)[number]

/** Строка таблицы встроенных моделей: набор, вид, анимация по умолчанию и значок BaseIcon */
export interface Model3DPresetInfo {
	set: Model3DSet
	/** Вид в палитре и библиотеке; у фигур пьедесталов и `shape` его нет */
	kind: string | null
	animation: Model3DAnimation
	/** Имя значка BaseIcon: тот же смысл в 2D-нотации «сервисы» и в 3D */
	icon: string
}

/** Модели по ключам: проп `models` компонента и `createScene3DModels` */
export type Model3DDefinitions = Record<string, Model3DDefinition>

export type Model3DDefinition = Model3DPresetDefinition | Model3DGltfDefinition | Model3DFactoryDefinition

/** Общее у своих моделей (мокап FlowModels3D: `registerFlowModel(key, { words, kind, build, act })`) */
export interface Model3DDefinitionBase {
	/** Название в палитре «Заменить модель» */
	title?: string
	/** Слова для автоподбора по названию и меткам узла (основы ru/en: `'pay'`, `'оплат'`); свои слова сильнее встроенных при равном совпадении */
	words?: string[]
	/** Вид (подпись в палитре и библиотеке): client, gateway, service, store, queue, actor, external */
	kind?: string
	/** Анимация по умолчанию — её играет шаг сценария (в мокапе `act`) */
	animation?: string
}

/** Встроенная модель под своим именем и с настройками */
export interface Model3DPresetDefinition extends Model3DDefinitionBase {
	preset: string
	tint?: string
	scale?: number
}

/** GLB/GLTF: грузится один раз на адрес (кеш на компонент), узлам — клон; сжатие — `configureLoader`, как у /map3d */
export interface Model3DGltfDefinition extends Model3DDefinitionBase {
	url: string
	scale?: number
	/** Поворот вокруг вертикали, градусы */
	rotationY?: number
	offset?: [number, number, number]
	/** footprint (по умолчанию) — вписать в клетку узла по ширине; none — как есть × scale */
	fit?: 'footprint' | 'none'
	/** state (по умолчанию) — красить по состоянию узла; keep — материалы модели как есть, состояние — кольцом и подсветкой */
	paint?: 'state' | 'keep'
	/** Узлы модели под роли окраски: `{ body: 'Body', accent: 'Lamp' }` */
	parts?: Partial<Record<Model3DPart, string>>
	/** Клипы анимаций модели под имена кита: `{ gate: 'BarrierOpen' }` */
	clips?: Partial<Record<Model3DAnimation, string>>
}

/** Фабрика: свой Object3D из кода приложения */
export interface Model3DFactoryDefinition extends Model3DDefinitionBase {
	create: (node: Model3DNode, context: Model3DContext) => Model3DInstance | Object3D
}

/** Узел, для которого строится модель */
export interface Model3DNode {
	id: string
	title: string
	kind?: string
	tags?: readonly string[]
	tone: Model3DTone
	/** Исходный элемент данных (узел карты или этап роадмапа), только чтение */
	source: Readonly<Record<string, unknown>>
}

/** Что даёт кит фабрике */
export interface Model3DContext {
	/** Клетка узла в единицах сцены: ширина, глубина, рекомендуемая высота */
	size: { width: number; depth: number; height: number }
	/** Цвет по токену или CSS (тема учитывается в момент вызова) */
	color: (css: string) => Color
	/** Общий материал кита для роли: перекрашивается темой и состоянием узла; не освобождать */
	material: (part: Model3DPart) => Material
	/** Общая геометрия по ключу: строится один раз на компонент, освобождает кит */
	geometry: <T extends BufferGeometry>(key: string, build: () => T) => T
	/** Зерно (детерминированные детали) */
	seed: number
	isReducedMotion: boolean
}

/** Результат фабрики или встроенной модели */
export interface Model3DInstance {
	object: Object3D
	/** Части по ролям — для окраски состоянием; без них всё красится как body */
	parts?: Partial<Record<Model3DPart, Object3D[]>>
	/** Точка выноски бирки; по умолчанию — середина верха рамки */
	anchor?: Vector3
	/** Анимации: progress 0..1 за длительность */
	animations?: Partial<Record<string, (progress: number) => void>>
	/** Свой вид состояния; без него — общий вид кита */
	setState?: (state: Readonly<Model3DState>) => void
	/** Освободить своё (геометрии и материалы из context освобождает кит) */
	dispose?: () => void
}

/** Состояние модели */
export interface Model3DState {
	isHovered: boolean
	isSelected: boolean
	/** Узел текущего шага сценария / текущий этап */
	isActive: boolean
	/** Не в фокусе сценария, фильтра или выделения */
	isDimmed: boolean
	isFocused: boolean
	tone: Model3DTone
	/** Правка: узел тащат */
	isDragging: boolean
	/** Правка: место занято или действие недопустимо */
	isInvalid: boolean
}

/** Управление моделью узла из приложения */
export interface Model3DHandle {
	readonly id: string
	/** Корень модели: читать и добавлять своё можно; удалять и освобождать нельзя */
	readonly object: Object3D
	/** Id встроенной модели или ключ; null — GLB по адресу */
	readonly preset: string | null
	/** Состояние поверх вычисленного компонентом — до `clearState` */
	setState: (patch: Partial<Model3DState>) => void
	clearState: () => void
	/** Анимация; при «уменьшить движение» и пресете none — сразу последний кадр, промис решён */
	play: (name: string, options?: { duration?: number; repeat?: number | 'loop' }) => Promise<void>
	stop: (name?: string) => void
	/** Цвет роли или всей модели: токен или CSS; null — вернуть тему */
	setColor: (color: string | null, part?: Model3DPart) => void
	setScale: (scale: number) => void
	/** Свой материал роли (освобождает приложение); null — вернуть материал кита */
	setMaterial: (part: Model3DPart, material: Material | null) => void
	/** Наезд камеры на модель */
	focus: () => void
}
