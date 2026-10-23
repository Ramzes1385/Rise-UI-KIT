import { useUi } from '@composables/base/useUi'
import { useMotion } from '@composables/app/useMotion'
import { useCustomClass } from '@composables/base/useCustomClass'
import type { BackTopProps, BaseBackTopEmits } from '../types/BaseBackTop.types'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

function resolveElement(value: string | HTMLElement): HTMLElement | null {
	return typeof value === 'string' ? document.querySelector<HTMLElement>(value) : value
}

function getScrollTop(target: HTMLElement | Window): number {
	return target === window ? window.scrollY : (target as HTMLElement).scrollTop
}

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

function useScrollVisibility(props: BackTopProps) {
	const scrollTop = ref<number | null>(null)
	const scrollElement = shallowRef<HTMLElement | null>(null)
	let scrollTarget: HTMLElement | Window | null = null

	const update = (): void => {
		scrollTop.value = scrollTarget === null ? null : getScrollTop(scrollTarget)
	}
	const detach = (): void => {
		scrollTarget?.removeEventListener('scroll', update)
		scrollTarget = null
		update()
	}
	const attach = (): void => {
		detach()
		scrollTarget = props.target ? (resolveElement(props.target) ?? window) : window
		scrollElement.value = scrollTarget === window ? null : (scrollTarget as HTMLElement)
		scrollTarget.addEventListener('scroll', update, { passive: true })
		update()
	}

	onMounted(attach)
	watch(() => props.target, attach)
	onBeforeUnmount(detach)

	return {
		scrollElement,
		isVisible: computed(() => scrollTop.value !== null && scrollTop.value > props.visibilityHeight),
		getScrollTarget: () => scrollTarget as HTMLElement | Window,
	}
}

export function useBaseBackTop(props: BackTopProps, emit: BaseBackTopEmits) {
	const { isVisible, scrollElement, getScrollTarget } = useScrollVisibility(props)
	const motion = useMotion(scrollElement)

	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'icon', 'label'] }),
		ui: useUi(props, 'base-back-top'),
		isVisible,
		isInstant: motion.isReduced,
		handleClick(event: MouseEvent): void {
			const target = getScrollTarget()
			target.scrollTo({ top: 0, behavior: motion.isReduced.value ? 'auto' : 'smooth' })
			focusTop(target, props.focusTarget)
			emit('click', event)
		},
	}
}
