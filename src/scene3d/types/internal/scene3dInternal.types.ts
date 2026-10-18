import type { ShallowRef } from 'vue'
import type { Scene3DRenderer } from '../scene3d.types'
import type { BufferGeometry, Camera, Material, Texture, Vector3 } from 'three'

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
	/** Пересчитать положения и перекрытия для камеры и размера холста; вызывается из `onFrame` */
	update: (camera: Camera, size: { width: number; height: number }) => void
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
