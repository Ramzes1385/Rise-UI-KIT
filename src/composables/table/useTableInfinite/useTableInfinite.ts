/** Composable: подгрузка таблицы по метке в конце списка — IntersectionObserver вместо прокрутки обёртки */
import { onBeforeUnmount, ref, watch } from 'vue'
import type { UseTableInfiniteOptions, UseTableInfiniteReturn } from './types/useTableInfinite.types'

/**
 * Следит за меткой в конце таблицы и вызывает `onReach`, когда она попадает в область видимости с запасом `distance`.
 * В отличие от события `scroll` работает и без `height` (прокручивается страница), и когда первая порция строк не заполняет
 * область: после каждого изменения `rearm` метка проверяется заново. На сервере и без IntersectionObserver `isObserving`
 * остаётся `false` — таблица продолжает слушать прокрутку обёртки.
 */
function useTableInfinite(options: UseTableInfiniteOptions): UseTableInfiniteReturn {
	const { sentinelRef, rootRef, isActive, hasOwnScroll, distance, onReach, rearm } = options
	const isObserving = ref(false)
	let observer: IntersectionObserver | null = null

	function disconnect(): void {
		observer?.disconnect()
		observer = null
		isObserving.value = false
	}

	function connect(): void {
		disconnect()
		const sentinel = sentinelRef.value
		if (!isActive() || !sentinel || typeof IntersectionObserver === 'undefined') return
		observer = new IntersectionObserver(
			entries => {
				if (entries.some(entry => entry.isIntersecting)) onReach()
			},
			{ root: hasOwnScroll() ? rootRef.value : null, rootMargin: `0px 0px ${distance}px 0px` },
		)
		observer.observe(sentinel)
		isObserving.value = true
	}

	function recheck(): void {
		const sentinel = sentinelRef.value
		if (!observer || !sentinel) return
		observer.unobserve(sentinel)
		observer.observe(sentinel)
	}

	watch([sentinelRef, rootRef, isActive, hasOwnScroll], connect, { flush: 'post' })
	watch(rearm, recheck, { flush: 'post' })
	onBeforeUnmount(disconnect)

	return { isObserving }
}

export { useTableInfinite }
