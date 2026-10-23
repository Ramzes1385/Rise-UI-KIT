/** Composable: полоса загрузки при переходах между страницами и долгих запросах */
import { computed, readonly, ref } from 'vue'
import type { LoadingBarStatus, LoadingBarStore, UseLoadingBarReturn } from './types/useLoadingBar.types'

/** С какого заполнения начинается загрузка */
export const LOADING_BAR_START = 0.1

/** Выше этого заполнения полоса не растёт, пока загрузка не завершена */
export const LOADING_BAR_LIMIT = 0.9

/** Шаг роста полосы во время загрузки, мс */
export const LOADING_BAR_TRICKLE_MS = 200

/** Сколько полоса видна после завершения или ошибки, мс */
export const LOADING_BAR_HIDE_MS = 400

const TRICKLE_RATE = 0.1

/** Создаёт хранилище полосы. Кит держит одно на страницу; напрямую нужно только в тестах и своих контейнерах */
export function createLoadingBarStore(): LoadingBarStore {
	const status = ref<LoadingBarStatus>('idle')
	const progress = ref(0)
	let trickleTimer: ReturnType<typeof setInterval> | undefined
	let hideTimer: ReturnType<typeof setTimeout> | undefined

	function clearTimers(): void {
		clearInterval(trickleTimer)
		clearTimeout(hideTimer)
		trickleTimer = undefined
		hideTimer = undefined
	}

	function reset(): void {
		clearTimers()
		status.value = 'idle'
		progress.value = 0
	}

	function trickle(): void {
		progress.value += (LOADING_BAR_LIMIT - progress.value) * TRICKLE_RATE
	}

	function start(): void {
		if (typeof window === 'undefined' || status.value === 'loading') return
		clearTimers()
		status.value = 'loading'
		progress.value = LOADING_BAR_START
		trickleTimer = setInterval(trickle, LOADING_BAR_TRICKLE_MS)
	}

	function complete(next: LoadingBarStatus): void {
		clearTimers()
		status.value = next
		progress.value = 1
		hideTimer = setTimeout(reset, LOADING_BAR_HIDE_MS)
	}

	return {
		status: readonly(status),
		progress: readonly(progress),
		start,
		finish: () => {
			if (status.value === 'loading') complete('done')
		},
		error: () => {
			if (status.value === 'loading') complete('error')
		},
		reset,
	}
}

/** Хранилище страницы: общее для всех вызовов `useLoadingBar()` и BaseApp, работает и до монтирования BaseApp */
export const loadingBarStore = createLoadingBarStore()

/**
 * Полоса загрузки вверху страницы. Её показывает `<BaseApp>`; вызывать можно где угодно: в компонентах,
 * сторах, охранниках роутера — в том числе до монтирования приложения.
 *
 * @example
 * const loadingBar = useLoadingBar()
 * router.beforeEach(() => loadingBar.start())
 * router.afterEach(() => loadingBar.finish())
 * router.onError(() => loadingBar.error())
 */
export function useLoadingBar(): UseLoadingBarReturn {
	const { status, progress, start, finish, error } = loadingBarStore
	return { status, progress, start, finish, error, isLoading: computed(() => status.value === 'loading') }
}
