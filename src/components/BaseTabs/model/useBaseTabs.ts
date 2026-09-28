/** Composable: логика BaseTabs — выбор вкладки, клавиатура APG Tabs и прокрутка длинного списка */
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'
import { toHTMLElement } from '@utils/domUtils'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { Ref } from 'vue'
import type { BaseTabsEmits, BaseTabsProps } from '../types/BaseTabs.types'

const TABS_ELEMENTS = ['root', 'nav', 'scrollBtn', 'list', 'tab', 'icon', 'label', 'content']

/** Ближайшая доступная вкладка от start в направлении step с зацикливанием; -1, если доступных нет */
function findEnabledIndex(items: BaseTabsProps['items'], start: number, step: 1 | -1): number {
	const count = items.length
	for (let offset = 1; offset <= count; offset++) {
		const index = (((start + step * offset) % count) + count) % count
		if (!items[index].isDisabled) return index
	}
	return -1
}

/** Индекс вкладки, на которую ведёт клавиша; null — клавиша не относится к навигации по вкладкам */
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

/** Вкладки списка и индекс той, на которой произошло событие (-1 — не на вкладке) */
function tabsAround(list: HTMLElement | null, target: EventTarget | null): { tabs: HTMLElement[]; index: number } {
	const tabs = Array.from(list?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])
	const currentTab = toHTMLElement(target)?.closest<HTMLElement>('[role="tab"]')
	return { tabs, index: currentTab ? tabs.indexOf(currentTab) : -1 }
}

/**
 * Клавиатура APG Tabs: стрелки с зацикливанием и Home/End, отключённые вкладки пропускаются.
 * Активация автоматическая (выбор следует за фокусом) — APG рекомендует её, когда панель показывается без задержки.
 * Сочетания с модификаторами не перехватываются: Alt+← — это «назад» в браузере
 */
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

/** Прокрутка длинного списка (isScrollable): кнопки влево и вправо доступны, когда есть куда листать */
function useScrollButtons(props: BaseTabsProps, listRef: Ref<HTMLElement | null>) {
	const canScrollLeft = ref(false)
	const canScrollRight = ref(false)
	let resizeObserver: ResizeObserver | null = null

	const updateScrollState = (): void => {
		const el = listRef.value
		/* istanbul ignore next — defensive: listRef доступен после mount template-ссылки */
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
	/* istanbul ignore next -- scrollBy недоступен в jsdom без layout */
	const scrollByPage = (direction: 1 | -1): void => {
		const el = listRef.value
		if (!el) return
		el.scrollBy({ left: direction * el.clientWidth * 0.6, behavior: 'smooth' })
	}

	onMounted(setupObserver)
	/* istanbul ignore next -- переключение isScrollable во время жизни компонента: ResizeObserver callbacks тестируются e2e */
	watch(() => props.isScrollable, setupObserver)
	onUnmounted(() => resizeObserver?.disconnect())

	return {
		canScrollLeft,
		canScrollRight,
		/* istanbul ignore next -- scroll-обработчики тестируются e2e: jsdom не реализует scroll events с layout */
		handleListScroll: (): void => updateScrollState(),
		handleScrollLeft: (): void => scrollByPage(-1),
		handleScrollRight: (): void => scrollByPage(1),
	}
}

/** Перетаскивание списка мышью (drag-to-scroll); клик в конце перетаскивания не выбирает вкладку */
function useDragScroll(listRef: Ref<HTMLElement | null>) {
	const isDragging = ref(false)
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
		/* istanbul ignore next -- drag-to-scroll опирается на layout/scrollLeft, тестируется e2e */
		handlePointerDown(event: PointerEvent): void {
			if (event.pointerType === 'touch') return
			const el = listRef.value
			if (!el || el.scrollWidth <= el.clientWidth) return
			isDragging.value = true
			hasDragMoved = false
			dragStartX = event.clientX
			dragStartScrollLeft = el.scrollLeft
		},
		/* istanbul ignore next -- drag-to-scroll опирается на layout/scrollLeft, тестируется e2e */
		handlePointerMove(event: PointerEvent): void {
			if (!isDragging.value) return
			const el = listRef.value
			if (!el) return
			const delta = event.clientX - dragStartX
			if (Math.abs(delta) > 3) hasDragMoved = true
			el.scrollLeft = dragStartScrollLeft - delta
		},
		/* istanbul ignore next -- drag-to-scroll опирается на layout/scrollLeft, тестируется e2e */
		handlePointerUp(): void {
			if (!isDragging.value) return
			isDragging.value = false
		},
	}
}

export function useBaseTabs(props: BaseTabsProps, emit: BaseTabsEmits) {
	const standard = useStandardBaseComponent('base-tabs', props, TABS_ELEMENTS)
	const listRef = ref<HTMLElement | null>(null)
	const drag = useDragScroll(listRef)
	// Префикс id экземпляра: связывает вкладки и панель (aria-controls/aria-labelledby) без коллизий между компонентами
	const baseId = useId()
	// Индекс выбранной вкладки (-1, если modelValue не совпадает ни с одним id)
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
		// Единственная вкладка с tabindex=0 (roving tabindex, APG Tabs): выбранная, а если она отключена или не найдена —
		// первая доступная. Остальные вкладки достигаются стрелками, а не Tab
		rovingIndex: computed(() => {
			const selected = props.items[selectedIndex.value]
			if (selected && !selected.isDisabled) return selectedIndex.value
			return props.items.findIndex(item => !item.isDisabled)
		}),
		handleTabClick(id: string): void {
			/* istanbul ignore next -- hasDragMoved выставляется только при drag-to-scroll (e2e) */
			if (drag.consumeDragMove()) return
			const tab = props.items.find(item => item.id === id)
			/* istanbul ignore next — defensive: id всегда из items (template v-for) */
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
