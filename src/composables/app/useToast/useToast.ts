import type { InjectionKey } from 'vue'
/** Composable: уведомления из любого места приложения через BaseApp */
import { computed, getCurrentInstance, inject, ref } from 'vue'
import type { ToastId, ToastItem, ToastOptions, ToastStore, ToastStoreOptions, UseToastReturn } from './types/useToast.types'

/** Сколько уведомлений видно одновременно по умолчанию */
export const TOAST_MAX = 5

export const TOAST_STORE_KEY: InjectionKey<ToastStore> = Symbol('rise-toast-store')

/**
 * Хранилище последнего смонтированного BaseApp. Нужно, когда `useToast()` вызывают вне дочерних компонентов BaseApp:
 * в корневом компоненте, который сам рендерит BaseApp, в сторах и обработчиках запросов.
 */
let activeStore: ToastStore | null = null

let nextId = 0

/** Создаёт хранилище уведомлений. Его создаёт BaseApp; напрямую нужно только в тестах и своих контейнерах */
export function createToastStore(options: ToastStoreOptions = {}): ToastStore {
	const items = ref<ToastItem[]>([])

	function add(toast: ToastOptions): ToastId {
		const id = toast.id ?? `toast-${++nextId}`
		const index = items.value.findIndex(item => item.id === id)
		if (index !== -1) {
			items.value.splice(index, 1, { ...toast, id })
			return id
		}
		items.value.unshift({ ...toast, id })
		const max = options.max?.() ?? TOAST_MAX
		if (items.value.length > max) items.value.splice(max)
		return id
	}

	function update(id: ToastId, patch: Partial<Omit<ToastOptions, 'id'>>): void {
		const index = items.value.findIndex(item => item.id === id)
		if (index === -1) return
		items.value.splice(index, 1, { ...items.value[index], ...patch, id })
	}

	function remove(id: ToastId): void {
		items.value = items.value.filter(item => item.id !== id)
	}

	function clear(): void {
		items.value = []
	}

	return { items, add, update, remove, clear }
}

/** Делает хранилище доступным для `useToast()` вне дерева BaseApp. Вызывает BaseApp */
export function setActiveToastStore(store: ToastStore | null): void {
	activeStore = store
}

export function getActiveToastStore(): ToastStore | null {
	return activeStore
}

/**
 * Уведомления из любого места приложения. Показывает их ближайший `<BaseApp>`: внутри его дерева — свой,
 * вне дерева — последний смонтированный.
 *
 * @example
 * const toast = useToast()
 * toast.add({ title: 'Сохранено', type: 'success' })
 * const id = toast.add({ title: 'Загружаем отчёт…', isPersistent: true })
 * toast.update(id, { title: 'Отчёт готов', type: 'success', isPersistent: false })
 */
export function useToast(): UseToastReturn {
	const injected = getCurrentInstance() ? inject(TOAST_STORE_KEY, null) : null

	function resolve(): ToastStore | null {
		const store = injected ?? activeStore
		if (!store) console.warn('[rise-ui-kit] useToast: не найден <BaseApp> — уведомление не показано. Оберните приложение в <BaseApp>.')
		return store
	}

	return {
		add: toast => resolve()?.add(toast) ?? toast.id ?? '',
		update: (id, patch) => resolve()?.update(id, patch),
		remove: id => resolve()?.remove(id),
		clear: () => resolve()?.clear(),
		toasts: computed(() => (injected ?? activeStore)?.items.value ?? []),
	}
}
