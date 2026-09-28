/** Composable: модальные окна и панели, открываемые из кода, через BaseApp */
import { getCurrentInstance, inject, markRaw, ref } from 'vue'
import type { Component, InjectionKey } from 'vue'
import type { OverlayCreateOptions, OverlayEntry, OverlayHandle, OverlayProps, OverlayStore, UseOverlayReturn } from './useOverlay.types'

/** Ключ provide/inject хранилища оверлеев BaseApp */
export const OVERLAY_STORE_KEY: InjectionKey<OverlayStore> = Symbol('rise-overlay-store')

/**
 * Запасная задержка удаления закрытого оверлея, мс. Обычно компонент удаляется по событию `after-leave`
 * (BaseModal, BaseSlideover); задержка нужна компонентам без этого события и перекрывает анимацию закрытия
 */
export const OVERLAY_DESTROY_DELAY = 1000

/** Хранилище последнего смонтированного BaseApp — для вызовов вне его дерева (см. useToast) */
let activeStore: OverlayStore | null = null

/** Создаёт хранилище оверлеев. Его создаёт BaseApp */
export function createOverlayStore(): OverlayStore {
	const entries = ref<OverlayEntry[]>([])
	const resolvers = new Map<number, (result: unknown) => void>()
	const pending = new Map<number, Promise<unknown>>()
	const destroyTimers = new Map<number, ReturnType<typeof setTimeout>>()
	let nextId = 0

	function find(id: number): OverlayEntry | undefined {
		return entries.value.find(entry => entry.id === id)
	}

	function clearDestroyTimer(id: number): void {
		clearTimeout(destroyTimers.get(id))
		destroyTimers.delete(id)
	}

	function register(component: Component, options: Required<OverlayCreateOptions>): number {
		const id = ++nextId
		entries.value.push({
			id,
			component: markRaw(component),
			props: { ...options.props },
			isOpen: false,
			destroyOnClose: options.destroyOnClose,
		})
		return id
	}

	function open<TResult>(id: number, props: OverlayProps = {}): Promise<TResult | undefined> {
		const entry = find(id)
		if (!entry) return Promise.resolve(undefined)
		clearDestroyTimer(id)
		entry.props = { ...entry.props, ...props }
		if (entry.isOpen) return pending.get(id) as Promise<TResult | undefined>
		entry.isOpen = true
		const promise = new Promise<TResult | undefined>(resolve => resolvers.set(id, resolve as (result: unknown) => void))
		pending.set(id, promise)
		return promise
	}

	function close(id: number, result?: unknown): void {
		const entry = find(id)
		if (!entry?.isOpen) return
		entry.isOpen = false
		resolvers.get(id)?.(result)
		resolvers.delete(id)
		pending.delete(id)
		if (entry.destroyOnClose)
			destroyTimers.set(
				id,
				setTimeout(() => destroyIfClosed(id), OVERLAY_DESTROY_DELAY),
			)
	}

	function patch(id: number, props: OverlayProps): void {
		const entry = find(id)
		if (entry) entry.props = { ...entry.props, ...props }
	}

	function destroy(id: number): void {
		close(id)
		clearDestroyTimer(id)
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
		if (!store) console.warn('[rise-ui-kit] useOverlay: не найден <BaseApp> — оверлей не показан. Оберните приложение в <BaseApp>.')
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
