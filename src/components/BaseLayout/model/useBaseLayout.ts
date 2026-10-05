import type { Ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import type { BaseLayoutProps } from '../types/BaseLayout.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { computed, onBeforeUnmount, onMounted, ref, useId, useSlots } from 'vue'

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
		ui: useUi(props, 'base-layout'),
		slots: useSlots(),
		resolvedMainId: computed(() => props.mainId ?? `main-${generatedId}`),
		headerRef,
		mainRef,
		headerOffsetStyle: computed(() => ({ '--base-layout-header-height': `${headerHeight.value}px` })),
		focusMain: () => mainRef.value?.focus(),
	}
}
