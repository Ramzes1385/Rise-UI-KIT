import { computed, onBeforeUnmount, onMounted, readonly, ref } from 'vue'
import { BREAKPOINTS } from './useBreakpoint.types'
import type { BreakpointName, UseBreakpointReturn } from './useBreakpoint.types'

const SERVER_FALLBACK_WIDTH = BREAKPOINTS.lg

function getViewportWidth(): number {
	if (typeof window === 'undefined') return SERVER_FALLBACK_WIDTH

	return window.innerWidth
}

function resolveCurrent(width: number): BreakpointName {
	const names = Object.keys(BREAKPOINTS) as BreakpointName[]
	let result: BreakpointName = names[0]

	for (const name of names) {
		if (width >= BREAKPOINTS[name]) result = name
	}

	return result
}

/**
 * Реактивно отслеживает ширину окна и предоставляет флаги брейкпоинтов.
 * Безопасен при отсутствии window (SSR, тесты): отдаёт дефолтную ширину lg.
 * Подписка на resize вешается в onMounted и снимается в onBeforeUnmount.
 *
 * @example
 * ```ts
 * const { isMobile, isSmallerThan } = useBreakpoint()
 * // template: <BaseSheet v-if="isMobile" /> <BaseDialog v-else />
 * ```
 */
function useBreakpoint(): UseBreakpointReturn {
	const width = ref(getViewportWidth())

	function updateWidth(): void {
		width.value = getViewportWidth()
	}

	onMounted(() => {
		window.addEventListener('resize', updateWidth, { passive: true })
		updateWidth()
	})

	onBeforeUnmount(() => {
		window.removeEventListener('resize', updateWidth)
	})

	const current = computed(() => resolveCurrent(width.value))
	const isMobile = computed(() => width.value < BREAKPOINTS.md)

	function isGreaterOrEqual(name: BreakpointName): boolean {
		return width.value >= BREAKPOINTS[name]
	}

	function isSmallerThan(name: BreakpointName): boolean {
		return width.value < BREAKPOINTS[name]
	}

	return {
		width: readonly(width),
		current: readonly(current),
		isMobile: readonly(isMobile),
		isGreaterOrEqual,
		isSmallerThan,
	}
}

export { getViewportWidth, useBreakpoint }
