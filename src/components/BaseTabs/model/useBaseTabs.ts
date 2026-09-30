import type { Ref } from 'vue'
import { toHTMLElement } from '@utils/dom/domUtils'
import type { BaseTabsEmits, BaseTabsProps } from '../types/BaseTabs.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'

const DRAG_THRESHOLD = 3

const TABS_ELEMENTS = ['root', 'nav', 'scrollBtn', 'list', 'tab', 'icon', 'label', 'content']

function findEnabledIndex(items: BaseTabsProps['items'], start: number, step: 1 | -1): number {
	const count = items.length
	for (let offset = 1; offset <= count; offset++) {
		const index = (((start + step * offset) % count) + count) % count
		if (!items[index].isDisabled) return index
	}
	return -1
}

function resolveKeyTarget(items: BaseTabsProps['items'], key: string, currentIndex: number): number | null {
	switch (key) {
		case 'ArrowRight':
			return findEnabledIndex(items, currentIndex, 1)
		case 'ArrowLeft':
			return findEnabledIndex(items, currentIndex, -1)
		case 'Home':
			return findEnabledIndex(items, -1, 1)
		case 'End':
			return findEnabledIndex(items, items.length, -1)
		default:
			return null
	}
}

function tabsAround(list: HTMLElement | null, target: EventTarget | null): { tabs: HTMLElement[]; index: number } {
	const tabs = Array.from(list?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])
	const currentTab = toHTMLElement(target)?.closest<HTMLElement>('[role="tab"]')
	return { tabs, index: currentTab ? tabs.indexOf(currentTab) : -1 }
}

function createListKeydown(props: BaseTabsProps, listRef: Ref<HTMLElement | null>, select: (id: string) => void) {
	return (event: KeyboardEvent): void => {
		if (event.altKey || event.ctrlKey || event.metaKey) return
		const { tabs, index } = tabsAround(listRef.value, event.target)
		if (index === -1) return
		const targetIndex = resolveKeyTarget(props.items, event.key, index)
		if (targetIndex === null || targetIndex === -1) return
		event.preventDefault()
		tabs[targetIndex].focus()
		const targetId = props.items[targetIndex].id
		if (targetId !== props.modelValue) select(targetId)
	}
}

function useScrollButtons(props: BaseTabsProps, listRef: Ref<HTMLElement | null>) {
	const canScrollLeft = ref(false)
	const canScrollRight = ref(false)
	let resizeObserver: ResizeObserver | null = null

	const updateScrollState = (): void => {
		const el = listRef.value
		if (!el) return
		canScrollLeft.value = el.scrollLeft > 0
		canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
	}
	const setupObserver = (): void => {
		resizeObserver?.disconnect()
		resizeObserver = null
		if (props.isScrollable && listRef.value) {
			resizeObserver = new ResizeObserver(updateScrollState)
			resizeObserver.observe(listRef.value)
			nextTick(updateScrollState)
		} else {
			canScrollLeft.value = false
			canScrollRight.value = false
		}
	}
	const scrollByPage = (direction: 1 | -1): void => {
		const el = listRef.value
		if (!el) return
		el.scrollBy({ left: direction * el.clientWidth * 0.6, behavior: 'smooth' })
	}

	onMounted(setupObserver)
	watch(() => props.isScrollable, setupObserver)
	onUnmounted(() => resizeObserver?.disconnect())

	return {
		canScrollLeft,
		canScrollRight,
		handleListScroll: (): void => updateScrollState(),
		handleScrollLeft: (): void => scrollByPage(-1),
		handleScrollRight: (): void => scrollByPage(1),
	}
}

function useDragScroll(listRef: Ref<HTMLElement | null>) {
	const isDragging = ref(false)
	let isPressed = false
	let dragStartX = 0
	let dragStartScrollLeft = 0
	let hasDragMoved = false

	return {
		isDragging,
		consumeDragMove(): boolean {
			if (!hasDragMoved) return false
			hasDragMoved = false
			return true
		},
		handlePointerDown(event: PointerEvent): void {
			hasDragMoved = false
			const el = listRef.value
			if (event.pointerType === 'touch' || !el || el.scrollWidth <= el.clientWidth) return
			isPressed = true
			dragStartX = event.clientX
			dragStartScrollLeft = el.scrollLeft
		},
		handlePointerMove(event: PointerEvent): void {
			const el = listRef.value
			const delta = event.clientX - dragStartX
			if (!isPressed || !el || (!hasDragMoved && Math.abs(delta) <= DRAG_THRESHOLD)) return
			hasDragMoved = true
			isDragging.value = true
			el.scrollLeft = dragStartScrollLeft - delta
		},
		handlePointerUp(): void {
			isPressed = false
			isDragging.value = false
		},
	}
}

export function useBaseTabs(props: BaseTabsProps, emit: BaseTabsEmits) {
	const standard = useStandardBaseComponent('base-tabs', props, TABS_ELEMENTS)
	const listRef = ref<HTMLElement | null>(null)
	const drag = useDragScroll(listRef)
	const baseId = useId()
	const selectedIndex = computed(() => props.items.findIndex(item => item.id === props.modelValue))
	const select = (id: string): void => {
		emit('update:modelValue', id)
		emit('change', id)
	}

	return {
		...standard,
		listRef,
		panelId: `${baseId}-panel`,
		getTabId: (index: number): string => `${baseId}-tab-${index}`,
		selectedIndex,
		rovingIndex: computed(() => {
			const selected = props.items[selectedIndex.value]
			if (selected && !selected.isDisabled) return selectedIndex.value
			return props.items.findIndex(item => !item.isDisabled)
		}),
		handleTabClick(id: string): void {
			if (drag.consumeDragMove()) return
			const tab = props.items.find(item => item.id === id)
			if (tab?.isDisabled) return
			select(id)
		},
		handleListKeydown: createListKeydown(props, listRef, select),
		isDragging: drag.isDragging,
		handlePointerDown: drag.handlePointerDown,
		handlePointerMove: drag.handlePointerMove,
		handlePointerUp: drag.handlePointerUp,
		...useScrollButtons(props, listRef),
	}
}
