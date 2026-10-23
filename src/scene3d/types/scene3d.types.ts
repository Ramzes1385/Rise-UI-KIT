/**
 * Типы 3D-ядра: рендерер, контекст сцены, хуки приложения, пресеты камеры.
 * Текст `Scene3DRenderer`, `Scene3DContext` и `Scene3DHookProps` — контракт flow3d-roadmap, раздел 7
 */
import type { Camera, Scene } from 'three'
import type { Model3DHandle } from './model3d.types'

/** Рендерер: WebGLRenderer или свой из `rendererFactory` (тот же интерфейс, что `ImageMap3DRenderer`) */
export interface Scene3DRenderer {
	readonly domElement: HTMLCanvasElement
	setPixelRatio: (ratio: number) => void
	setSize: (width: number, height: number, updateStyle?: boolean) => void
	render: (scene: Scene, camera: Camera) => void
	dispose: () => void
	forceContextLoss: () => void
}

/** Сцена для хуков приложения */
export interface Scene3DContext {
	scene: Scene
	camera: Camera
	renderer: Scene3DRenderer
	/** Перерисовать кадр (кадры — по требованию) */
	invalidate: () => void
	/** Непрерывные кадры, пока tick не вернёт false или не вызвана остановка; при «уменьшить движение» — один кадр */
	animate: (tick: (delta: number, time: number) => boolean | void) => () => void
	getModel: (id: string) => Model3DHandle | null
}

export interface Scene3DHookProps {
	/** Сцена собрана (и после пересборки по новым data); вернуть функцию — она вызовется перед пересборкой и размонтированием */
	onSceneReady?: (context: Scene3DContext) => void | (() => void)
	/** Перед каждым кадром (только если задан) */
	onBeforeRender?: (context: Scene3DContext, frame: { delta: number; time: number }) => void
	/** Модель узла создана (GLB — после загрузки) */
	onModelReady?: (model: Model3DHandle) => void
}

/** Фабрика рендерера: получает холст и возвращает рендерер; ошибка внутри — компонент переходит в 2D */
export type Scene3DRendererFactory = (canvas: HTMLCanvasElement) => Scene3DRenderer

/** Почему показан 2D-вид, хотя просили 3D: unsupported — нет WebGL; error — рендерер не создался, контекст потерян или модель не загрузилась */
export const SCENE_3D_FALLBACK_REASONS = ['unsupported', 'error'] as const

/** Причина перехода в 2D */
export type Scene3DFallbackReason = (typeof SCENE_3D_FALLBACK_REASONS)[number]

/** Пресеты камеры: изометрия с поворотом на 90°, вид сверху (переход к 2D) и перспектива */
export const SCENE_3D_CAMERA_PRESETS = ['iso', 'iso-90', 'iso-180', 'iso-270', 'top', 'perspective'] as const

/** Пресет камеры */
export type Scene3DCameraPreset = (typeof SCENE_3D_CAMERA_PRESETS)[number]
