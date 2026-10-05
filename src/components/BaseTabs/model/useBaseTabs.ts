import type { Ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import { toHTMLElement } from '@utils/dom/domUtils'
import { useMotion } from '@composables/app/useMotion'
import type { BaseTabsEmits, BaseTabsProps } from '../types/BaseTabs.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useSlidingIndicator } from '@composables/interaction/useSlidingIndicator'
import { computed, nextTick, onMounted, onUnmounted, ref, useId, useSlots, watch } from 'vue'

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
	const resetDragMove = (): void => {
		hasDragMoved = false
	}

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
			if (event.button !== 0 || event.pointerType === 'touch' || !el || el.scrollWidth <= el.clientWidth) return
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
			if (hasDragMoved) setTimeout(resetDragMove, 0)
		},
	}
}

function usePanelSlot(props: BaseTabsProps) {
	const slots = useSlots()
	const panelSlot = (): `panel-${string}` | 'default' => (slots[`panel-${props.modelValue}`] ? `panel-${props.modelValue}` : 'default')
	return {
		hasPanel: (): boolean => Object.keys(slots).some(name => name === 'default' || name.startsWith('panel-')),
		hasCurrentPanel: (): boolean => Boolean(slots[panelSlot()]),
		panelSlot,
	}
}

function useTabsIndicator(listRef: Ref<HTMLElement | null>, selectedIndex: Ref<number>) {
	const indicator = useSlidingIndicator(listRef, selectedIndex)
	const motion = useMotion(listRef)
	return {
		indicatorStyle: indicator.style,
		isIndicatorVisible: indicator.isVisible,
		isIndicatorInstant: computed(() => indicator.isInstant.value || motion.isReduced.value),
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
		ui: useUi(props, 'base-tabs'),
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
			if (tab?.isDisabled || id === props.modelValue) return
			select(id)
		},
		handleListKeydown: createListKeydown(props, listRef, select),
		isDragging: drag.isDragging,
		handlePointerDown: drag.handlePointerDown,
		handlePointerMove: drag.handlePointerMove,
		handlePointerUp: drag.handlePointerUp,
		...useScrollButtons(props, listRef),
		...usePanelSlot(props),
		...useTabsIndicator(listRef, selectedIndex),
	}
}
