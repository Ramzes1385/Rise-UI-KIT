import { warn } from '@/locales/warn'
import { UI_WARNINGS } from '@/locales/messages'
import type { Component, InjectionKey } from 'vue'
/** Composable: модальные окна и панели, открываемые из кода, через BaseApp */
import { getCurrentInstance, inject, markRaw, ref } from 'vue'
import type {
	OverlayCreateOptions,
	OverlayDestroyTimers,
	OverlayEntry,
	OverlayHandle,
	OverlayProps,
	OverlayResults,
	OverlayStore,
	UseOverlayReturn,
} from './types/useOverlay.types'

export const OVERLAY_STORE_KEY: InjectionKey<OverlayStore> = Symbol('rise-overlay-store')

/**
 * Запасная задержка удаления закрытого оверлея, мс. Обычно компонент удаляется по событию `after-leave`
 * (BaseModal, BaseSlideover); задержка нужна компонентам без этого события и перекрывает анимацию закрытия
 */
export const OVERLAY_DESTROY_DELAY = 1000

/** Хранилище последнего смонтированного BaseApp — для вызовов вне его дерева (см. useToast) */
let activeStore: OverlayStore | null = null

/** Таймеры запасного удаления закрытых оверлеев по id */
function createDestroyTimers(): OverlayDestroyTimers {
	const timers = new Map<number, ReturnType<typeof setTimeout>>()
	return {
		schedule: (id, callback) => {
			timers.set(id, setTimeout(callback, OVERLAY_DESTROY_DELAY))
		},
		clear: id => {
			clearTimeout(timers.get(id))
			timers.delete(id)
		},
	}
}

/** Промисы открытых оверлеев по id: разрешаются результатом закрытия */
function createOverlayResults(): OverlayResults {
	const resolvers = new Map<number, (result: unknown) => void>()
	const pending = new Map<number, Promise<unknown>>()
	return {
		get: id => pending.get(id),
		start: id => {
			const promise = new Promise<unknown>(resolve => resolvers.set(id, resolve))
			pending.set(id, promise)
			return promise
		},
		settle: (id, result) => {
			resolvers.get(id)?.(result)
			resolvers.delete(id)
			pending.delete(id)
		},
	}
}

/** Новая запись хранилища: оверлей добавляется закрытым */
function createEntry(id: number, component: Component, options: Required<OverlayCreateOptions>): OverlayEntry {
	return { id, component: markRaw(component), props: { ...options.props }, isOpen: false, destroyOnClose: options.destroyOnClose }
}

/** Создаёт хранилище оверлеев. Его создаёт BaseApp */
export function createOverlayStore(): OverlayStore {
	const entries = ref<OverlayEntry[]>([])
	const results = createOverlayResults()
	const destroyTimers = createDestroyTimers()
	let nextId = 0

	function find(id: number): OverlayEntry | undefined {
		return entries.value.find(entry => entry.id === id)
	}

	function register(component: Component, options: Required<OverlayCreateOptions>): number {
		const id = ++nextId
		entries.value.push(createEntry(id, component, options))
		return id
	}

	function open<TResult>(id: number, props: OverlayProps = {}): Promise<TResult | undefined> {
		const entry = find(id)
		if (!entry) return Promise.resolve(undefined)
		destroyTimers.clear(id)
		entry.props = { ...entry.props, ...props }
		if (entry.isOpen) return results.get(id) as Promise<TResult | undefined>
		entry.isOpen = true
		return results.start(id) as Promise<TResult | undefined>
	}

	function close(id: number, result?: unknown): void {
		const entry = find(id)
		if (!entry?.isOpen) return
		entry.isOpen = false
		results.settle(id, result)
		if (entry.destroyOnClose) destroyTimers.schedule(id, () => destroyIfClosed(id))
	}

	function patch(id: number, props: OverlayProps): void {
		const entry = find(id)
		if (entry) entry.props = { ...entry.props, ...props }
	}

	function destroy(id: number): void {
		close(id)
		destroyTimers.clear(id)
		entries.value = entries.value.filter(entry => entry.id !== id)
	}

	function destroyIfClosed(id: number): void {
		const entry = find(id)
		if (entry && !entry.isOpen && entry.destroyOnClose) destroy(id)
	}

	function closeAll(): void {
		for (const entry of entries.value) close(entry.id)
	}

	function isOpen(id: number): boolean {
		return find(id)?.isOpen ?? false
	}

	return { entries, register, open, close, patch, destroy, destroyIfClosed, closeAll, isOpen }
}

/** Делает хранилище доступным для `useOverlay()` вне дерева BaseApp. Вызывает BaseApp */
export function setActiveOverlayStore(store: OverlayStore | null): void {
	activeStore = store
}

/** Хранилище, которое сейчас рендерит оверлеи, или null */
export function getActiveOverlayStore(): OverlayStore | null {
	return activeStore
}

/**
 * Модальные окна и панели, открываемые из кода. Компонент рендерит ближайший `<BaseApp>`.
 * Компонент получает props и `isOpen`, закрывается событием `update:isOpen` (false) или `close` — `close` может
 * передать результат, которым разрешится промис `open()`. Если компонент шлёт оба события, `close` должен идти первым.
 *
 * @example
 * const overlay = useOverlay()
 * const editor = overlay.create(EditUserModal)
 * const saved = await editor.open({ userId: 42 }) // результат из emit('close', value)
 */
export function useOverlay(): UseOverlayReturn {
	const injected = getCurrentInstance() ? inject(OVERLAY_STORE_KEY, null) : null

	function resolve(): OverlayStore | null {
		const store = injected ?? activeStore
		if (!store) warn(UI_WARNINGS.OVERLAY_WITHOUT_APP)
		return store
	}

	function create<TResult = unknown>(component: Component, options: OverlayCreateOptions = {}): OverlayHandle<TResult> {
		const settings = { props: options.props ?? {}, destroyOnClose: options.destroyOnClose ?? true }
		// Хранилище и запись создаются при первом open(): create() можно вызвать в setup корневого компонента,
		// который сам рендерит BaseApp, — к моменту открытия BaseApp уже смонтирован
		let store: OverlayStore | null = null
		let id: number | null = null

		function ensureEntry(): number | null {
			store ??= resolve()
			if (!store) return null
			if (id === null || !store.entries.value.some(entry => entry.id === id)) id = store.register(component, settings)
			return id
		}

		return {
			get isOpen() {
				return store !== null && id !== null && store.isOpen(id)
			},
			open: props => {
				const entryId = ensureEntry()
				return entryId === null ? Promise.resolve(undefined) : store!.open<TResult>(entryId, props)
			},
			close: result => {
				if (store && id !== null) store.close(id, result)
			},
			patch: props => {
				settings.props = { ...settings.props, ...props }
				if (store && id !== null) store.patch(id, props)
			},
			destroy: () => {
				if (store && id !== null) store.destroy(id)
			},
		}
	}

	return {
		create,
		closeAll: () => resolve()?.closeAll(),
	}
}
