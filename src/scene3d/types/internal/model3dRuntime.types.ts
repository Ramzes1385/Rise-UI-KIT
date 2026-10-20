import type { ScenePalette } from './scene3dGeometry.types'
import type { Scene3DColorResolver } from './scene3dInternal.types'
import type { Group, Mesh, Object3D, BufferGeometry, Shape, Vector3 } from 'three'
import type { Model3DContext, Model3DDefinitions, Model3DInstance, Model3DNode, Model3DPart, Model3DSet } from '../model3d.types'
import type {
	Model3DBank,
	Model3DEntry,
	Model3DGltfLoader,
	Model3DHooks,
	Model3DInstancedGroup,
	Model3DLibrary,
	Model3DRegistryOptions,
	Model3DSelection,
} from './model3dInternal.types'

/** Модели компонента и приложения: компонент сильнее */
export interface Model3DLookup {
	component: Model3DDefinitions
	app: Model3DDefinitions
}

/** Что нужно выбору модели, кроме узла */
export interface Model3DResolveOptions {
	lookup: Model3DLookup
	modelResolver?: (node: Model3DSelection['node']) => string | null | undefined
	fallback: string
	sets: readonly Model3DSet[]
	warn: (message: string) => void
}

/** Чем владеет узел: ключи геометрий и материалов, которые вернутся в кеш при освобождении */
export interface Model3DOwner {
	geometryKeys: Set<string>
	materialKeys: Set<string>
}

/** Для кого строится модель: чем владеет, id узла, сам узел и ключ модели (акцент) */
export type Model3DBuildTarget = Model3DOwner & { id: string; node: Model3DNode; modelId: string }

/** Что нужно сборке и состояниям от реестра */
export interface Model3DScope {
	bank: Model3DBank
	options: Model3DRegistryOptions
}

/** Область с библиотекой встроенных моделей */
export type Model3DBuildScope = Model3DScope & { library: Model3DLibrary }

/** Состояние реестра: узлы, группы экземпляров, кадр и ресурсы */
export interface Model3DRuntime {
	options: Model3DRegistryOptions
	scope: Model3DBuildScope
	entries: Map<string, Model3DEntry>
	groups: Map<string, Model3DInstancedGroup>
	object: Group
	hooks: Model3DHooks
	stopTicker: (() => void) | null
	gltf: Model3DGltfLoader | null
	ownsGltf: boolean
	isDetailVisible: boolean
	time: number
}

/** Настройки банка ресурсов моделей */
export interface Model3DBankOptions {
	cache: Model3DRegistryOptions['cache']
	getPalette: () => ScenePalette
	resolveColor: Scene3DColorResolver
}

/** Ресурс кеша и число ссылок на него в банке */
export interface Model3DHeld<T> {
	value: T
	refs: number
}

/** Положение меша или группы в наборе: смещение, повороты (радианы), родитель; `detail` — мелкая деталь (светодиод, экран, кнопка) */
export interface KitPlacement {
	x?: number
	y?: number
	z?: number
	rx?: number
	ry?: number
	rz?: number
	parent?: Object3D
	detail?: boolean
}

/** Размеры выдавливания фигуры: высота и скос */
export interface KitExtrude {
	height: number
	bevel?: number
}

/** Скругление плиты: радиус угла и скос */
export interface KitRound {
	radius?: number
	bevel?: number
}

/** Набор для сборки модели: всё, что делает фабрика библиотеки; размеры — тройки `[ширина, высота, глубина]` в единицах мокапа */
export interface ModelKit {
	root: Group
	context: Model3DContext
	box: (name: string, size: readonly [number, number, number]) => BufferGeometry
	/** Цилиндр: `[радиус сверху, радиус снизу, высота]`, сегментов не больше 24 */
	cylinder: (name: string, size: readonly [number, number, number], segments?: number) => BufferGeometry
	sphere: (name: string, radius: number, segments?: number) => BufferGeometry
	/** Тор: `[радиус, толщина трубки]`, дуга в радианах */
	torus: (name: string, size: readonly [number, number], arc?: number) => BufferGeometry
	lathe: (name: string, profile: ReadonlyArray<readonly [number, number]>, segments?: number) => BufferGeometry
	/** Скруглённая плита, поднятая вверх от нуля: `[ширина, глубина, высота]` */
	slab: (name: string, size: readonly [number, number, number], round?: KitRound) => BufferGeometry
	/** Фигура, выдавленная вверх (стоит на земле) */
	extrude: (name: string, shape: Shape, size: KitExtrude) => BufferGeometry
	mesh: (geometry: BufferGeometry, part: Model3DPart, placement?: KitPlacement) => Mesh
	group: (name: string, placement?: KitPlacement) => Group
	/** Готовая модель: корень, части по ролям, выноска бирки */
	finish: (extra?: Partial<Omit<Model3DInstance, 'object' | 'parts'>>) => Model3DInstance
}

/** Миниатюра: ячейка HTML, модель, держатель в сцене и рамка */
export interface Model3DThumb {
	cell: HTMLElement
	instance: Model3DInstance
	holder: Group
	center: Vector3
	radius: number
}

/** Идущая в миниатюрах анимация ячейки */
export interface Model3DThumbRun {
	id: string
	animation: string
	started: number
}
