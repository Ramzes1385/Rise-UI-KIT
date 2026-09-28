import { useCustomClass } from '@composables/useCustomClass'
/** Composable: логика BaseBackTop — видимость по прокрутке и возврат наверх */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { BackTopProps, BaseBackTopEmits } from '../types/BaseBackTop.types'

function resolveElement(value: string | HTMLElement): HTMLElement | null {
	return typeof value === 'string' ? document.querySelector<HTMLElement>(value) : value
}

function getScrollTop(target: HTMLElement | Window): number {
	return target === window ? window.scrollY : (target as HTMLElement).scrollTop
}

/** Фокус в начало: элемент без tabindex получает tabindex="-1" до потери фокуса */
function focusTop(target: HTMLElement | Window, focusTarget: string | HTMLElement | undefined): void {
	const fallback = target === window ? (document.querySelector<HTMLElement>('main') ?? document.body) : (target as HTMLElement)
	const element = focusTarget ? resolveElement(focusTarget) : fallback
	if (!element) return
	if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) {
		element.setAttribute('tabindex', '-1')
		element.addEventListener('blur', () => element.removeAttribute('tabindex'), { once: true })
	}
	element.focus({ preventScroll: true })
}

/** Подписка на прокрутку окна или контейнера из target (контейнер по селектору ищется после монтирования) */
function useScrollVisibility(props: BackTopProps) {
	const isVisible = ref(false)
	let scrollTarget: HTMLElement | Window | null = null

	const update = (): void => {
		isVisible.value = scrollTarget !== null && getScrollTop(scrollTarget) > props.visibilityHeight
	}
	const detach = (): void => {
		scrollTarget?.removeEventListener('scroll', update)
		scrollTarget = null
	}
	const attach = (): void => {
		detach()
		scrollTarget = props.target ? (resolveElement(props.target) ?? window) : window
		scrollTarget.addEventListener('scroll', update, { passive: true })
		update()
	}

	onMounted(attach)
	watch(() => props.target, attach)
	onBeforeUnmount(detach)

	return { isVisible, getScrollTarget: () => scrollTarget as HTMLElement | Window }
}

export function useBaseBackTop(props: BackTopProps, emit: BaseBackTopEmits) {
	const { isVisible, getScrollTarget } = useScrollVisibility(props)

	return {
		// Классы по элементам (customClass): оформление задаёт BaseFab
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'icon', 'label'] }),
		isVisible,
		handleClick(event: MouseEvent): void {
			const target = getScrollTarget()
			const isReducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
			target.scrollTo({ top: 0, behavior: isReducedMotion ? 'auto' : 'smooth' })
			focusTop(target, props.focusTarget)
			emit('click', event)
		},
	}
}
