import type { Ref } from 'vue'
import type { BaseLayoutProps } from '../types/BaseLayout.types'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
/** Composable: логика BaseLayout — переход к содержимому и высота шапки */
import { computed, onBeforeUnmount, onMounted, ref, useId, useSlots } from 'vue'

/** Высота шапки: прилипшее боковое меню встаёт под неё, а переход к <main> не прячет начало под шапкой */
function useHeaderHeight(headerRef: Ref<HTMLElement | null>): Ref<number> {
	const headerHeight = ref(0)
	const measure = (): void => {
		headerHeight.value = headerRef.value?.offsetHeight ?? 0
	}
	let observer: ResizeObserver | null = null

	onMounted(() => {
		measure()
		if (!headerRef.value) return
		observer = new ResizeObserver(measure)
		observer.observe(headerRef.value)
	})
	onBeforeUnmount(() => observer?.disconnect())

	return headerHeight
}

export function useBaseLayout(props: BaseLayoutProps) {
	const generatedId = useId()
	const headerRef = ref<HTMLElement | null>(null)
	const mainRef = ref<HTMLElement | null>(null)
	const headerHeight = useHeaderHeight(headerRef)

	return {
		...useStandardBaseComponent('base-layout', props, ['root', 'header', 'sidebar', 'main', 'footer']),
		slots: useSlots(),
		resolvedMainId: computed(() => props.mainId ?? `main-${generatedId}`),
		headerRef,
		mainRef,
		headerOffsetStyle: computed(() => ({ '--base-layout-header-height': `${headerHeight.value}px` })),
		/** Ссылка «Перейти к содержимому»: фокус в <main> без смены адреса (hash-режим роутера не срабатывает) */
		focusMain: () => mainRef.value?.focus(),
	}
}
