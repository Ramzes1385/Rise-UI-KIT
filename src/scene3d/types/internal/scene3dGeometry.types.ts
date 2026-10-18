import type {
	Box3,
	BufferGeometry,
	CanvasTexture,
	Color,
	DirectionalLight,
	Group,
	HemisphereLight,
	Mesh,
	MeshBasicMaterial,
	ShaderMaterial,
} from 'three'

/** Точка пути ленты: x и z — план, y — высота над землёй */
export interface RibbonPoint {
	x: number
	y: number
	z: number
}

/** Геометрия ленты: атрибуты `along` (длина пути до вершины) и `offsetDir` (сторона и сдвиг) и полная длина пути */
export interface RibbonGeometry extends BufferGeometry {
	userData: { length: number }
}

/** Настройки материала ленты */
export interface RibbonMaterialOptions {
	/** Цвет ленты */
	color: Color
	/** Ширина в единицах сцены */
	width: number
	/** Непрозрачность 0–1; по умолчанию 1 */
	opacity?: number
	/** Пунктир: длина штриха и промежутка в единицах сцены; без него — сплошная */
	dash?: { dash: number; gap: number }
}

/** Материал ленты: униформы цвета, ширины, пунктира (`uDashed`, `uDash`, `uGap`, `uOffset`) и доли пути `uProgress` с длиной `uLength` */
export type RibbonMaterial = ShaderMaterial

/** Место надписи в атласе: прямоугольник в долях холста и размер в пикселях */
export interface GroundTextEntry {
	id: string
	text: string
	weight: number
	/** Левый нижний и правый верхний углы в UV */
	u0: number
	v0: number
	u1: number
	v1: number
	/** Левый верхний угол надписи на холсте, px */
	x: number
	y: number
	/** Размер надписи в пикселях холста */
	width: number
	height: number
	/** Ширина / высота */
	aspect: number
}

/** Настройки атласа текста на земле */
export interface GroundTextAtlasOptions {
	/** Сторона холста, px; по умолчанию 2048 */
	size?: number
	/** Кегль, px; по умолчанию 56 */
	fontPx?: number
	/** Цвет текста: CSS */
	color: string
	/** Холст: свой нужен тестам и окружениям без DOM */
	createCanvas?: () => HTMLCanvasElement
}

/** Атлас надписей на одном холсте: полки по высоте строки, одна текстура и один материал на все надписи */
export interface GroundTextAtlas {
	texture: CanvasTexture
	material: MeshBasicMaterial
	/** Надпись есть в атласе */
	has: (id: string) => boolean
	/** Добавить надпись; `null` — места на холсте нет (пересоберите атлас крупнее или уберите лишнее) */
	add: (id: string, text: string, weight?: number) => GroundTextEntry | null
	/** Надпись по id */
	get: (id: string) => GroundTextEntry | undefined
	/** Плоскость надписи высотой `height` в единицах сцены, лежащая на земле; UV — в её прямоугольнике атласа */
	createMesh: (id: string, height: number) => Mesh | null
	/** Перерисовать все надписи другим цветом (смена темы) */
	recolor: (color: string) => void
	/** Загрузить холст в текстуру заново (после восстановления контекста) */
	refresh: () => void
	/** Освободить текстуру и материал */
	dispose: () => void
}

/** Роли цветов сцены: каждой соответствует токен `--rise-scene3d-<роль>` с запасным токеном кита */
export const SCENE_PALETTE_ROLES = [
	'ground',
	'grid',
	'body',
	'bodySoft',
	'metal',
	'screen',
	'line',
	'lineAsync',
	'active',
	'platform',
	'islandTop',
	'cliff',
	'road',
	'text',
	'textMuted',
] as const

/** Роль цвета сцены */
export type ScenePaletteRole = (typeof SCENE_PALETTE_ROLES)[number]

/** Цвета сцены по ролям и признак тёмной темы (по яркости фона) */
export interface ScenePalette {
	colors: Record<ScenePaletteRole, Color>
	isDark: boolean
}

/** Подпись на земле: цвет текста и контраст с землёй */
export interface GroundTextTone {
	role: 'text' | 'textMuted'
	color: Color
	ratio: number
}

/** Центр объекта на экране для навигации стрелками */
export interface Scene3DSpot {
	id: string
	x: number
	y: number
}

/** Направление стрелки на экране */
export type Scene3DDirection = 'left' | 'right' | 'up' | 'down'

/** Свет сцены: группа, ключевой и заполняющий источники и переключатель тёмной темы */
export interface SceneLights {
	group: Group
	key: DirectionalLight
	fill: HemisphereLight
	setDark: (isDark: boolean) => void
	/** Область, которую покрывает тень ключевого света */
	fitShadow: (bounds: Box3) => void
	dispose: () => void
}

/** Прямоугольник на плане: углы по X и Z */
export interface LoopRect {
	x0: number
	z0: number
	x1: number
	z1: number
}

/** Настройки скруглённого контура */
export interface RoundedLoopOptions {
	/** Радиус скругления; не больше половины меньшей стороны */
	radius: number
	/** Высота над землёй */
	y: number
	/** Отрезков на угол; по умолчанию 10 */
	segments?: number
}

/** Укладчик полок: подбирает место надписи заданной ширины на квадратном холсте */
export interface ShelfPacker {
	/** Левый верхний угол места или `null`, если надпись не помещается */
	place: (width: number) => { x: number; y: number } | null
}
