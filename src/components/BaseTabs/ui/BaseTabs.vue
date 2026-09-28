<template>
	<div
		class="base-tabs"
		:class="[classes.root, variantClass, { 'base-tabs--full-width': isFullWidth, 'base-tabs--scrollable': isScrollable }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div class="base-tabs__nav" :class="classes.nav">
			<BaseButton
				v-if="isScrollable && canScrollLeft"
				variant="ghost"
				class="base-tabs__scroll-btn base-tabs__scroll-btn--left"
				:class="classes.scrollBtn"
				:size-scale="sizeScale"
				:aria-label="UI_ARIA.TABS_SCROLL_LEFT"
				@click="handleScrollLeft">
				<template #left><BaseIcon name="chevron-left" :size-scale="sizeScale" /></template>
			</BaseButton>
			<div
				ref="listRef"
				class="base-tabs__list"
				:class="[classes.list, { 'base-tabs__list--dragging': isDragging }]"
				role="tablist"
				@keydown="handleListKeydown"
				@scroll="handleListScroll"
				@pointerdown="handlePointerDown"
				@pointermove="handlePointerMove"
				@pointerup="handlePointerUp"
				@pointercancel="handlePointerUp"
				@pointerleave="handlePointerUp">
				<BaseButton
					v-for="(item, index) in items"
					:id="getTabId(index)"
					:key="item.id"
					variant="ghost"
					role="tab"
					class="base-tabs__tab"
					:class="[
						classes.tab,
						{
							'base-tabs__tab--active': modelValue === item.id,
						},
					]"
					:is-disabled="item.isDisabled"
					:aria-selected="modelValue === item.id"
					:aria-controls="$slots.default ? panelId : undefined"
					:tabindex="index === rovingIndex ? 0 : -1"
					:size-scale="sizeScale"
					@click="handleTabClick(item.id)">
					<span v-if="item.icon" class="base-tabs__icon" :class="classes.icon" v-html="item.icon"></span>
					<span class="base-tabs__label" :class="classes.label">{{ item.label }}</span>
				</BaseButton>
			</div>
			<BaseButton
				v-if="isScrollable && canScrollRight"
				variant="ghost"
				class="base-tabs__scroll-btn base-tabs__scroll-btn--right"
				:class="classes.scrollBtn"
				:size-scale="sizeScale"
				:aria-label="UI_ARIA.TABS_SCROLL_RIGHT"
				@click="handleScrollRight">
				<template #left><BaseIcon name="chevron-right" :size-scale="sizeScale" /></template>
			</BaseButton>
		</div>
		<!-- Роль tabpanel только при наличии контента: пустой элемент с tabindex=0 стал бы лишней остановкой Tab -->
		<div
			:id="panelId"
			class="base-tabs__content"
			:class="classes.content"
			:role="$slots.default ? 'tabpanel' : undefined"
			:aria-labelledby="$slots.default && selectedIndex !== -1 ? getTabId(selectedIndex) : undefined"
			:tabindex="$slots.default ? 0 : undefined">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseTabs.style.scss'
import { kitDefaults } from '@composables/useDefaults'
import { toHTMLElement } from '@utils/domUtils'
import type { BaseTabsEmits, BaseTabsProps, BaseTabsSlots } from '../model/BaseTabs.types'

const props = withDefaults(
	defineProps<BaseTabsProps>(),
	kitDefaults('BaseTabs', {
		isFullWidth: false,
		isScrollable: false,
		sizeScale: SIZE_SCALE_DEFAULT,
		variant: 'underline',
	}),
)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-tabs', props, [
	'root',
	'nav',
	'scrollBtn',
	'list',
	'tab',
	'icon',
	'label',
	'content',
])

const emit = defineEmits<BaseTabsEmits>()
defineSlots<BaseTabsSlots>()

const listRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const isDragging = ref(false)

let dragStartX = 0
let dragStartScrollLeft = 0
let hasDragMoved = false

/** Префикс id экземпляра: связывает вкладки и панель (aria-controls/aria-labelledby) без коллизий между компонентами */
const baseId = useId()
const panelId = `${baseId}-panel`

function getTabId(index: number): string {
	return `${baseId}-tab-${index}`
}

/** Индекс выбранной вкладки (-1, если modelValue не совпадает ни с одним id) */
const selectedIndex = computed(() => props.items.findIndex(item => item.id === props.modelValue))

/**
 * Единственная вкладка с tabindex=0 (roving tabindex, APG Tabs): выбранная, а если она отключена
 * или не найдена — первая доступная. Остальные вкладки достигаются стрелками, а не Tab.
 */
const rovingIndex = computed(() => {
	const selected = props.items[selectedIndex.value]
	if (selected && !selected.isDisabled) return selectedIndex.value
	return props.items.findIndex(item => !item.isDisabled)
})

function emitSelect(id: string): void {
	emit('update:modelValue', id)
	emit('change', id)
}

function handleTabClick(id: string): void {
	/* istanbul ignore next -- hasDragMoved выставляется только при drag-to-scroll (e2e) */
	if (hasDragMoved) {
		hasDragMoved = false
		return
	}

	const tab = props.items.find(item => item.id === id)
	/* istanbul ignore next — defensive: id всегда из items (template v-for) */
	if (tab?.isDisabled) return

	emitSelect(id)
}

/** Ближайшая доступная вкладка от start в направлении step с зацикливанием; -1, если доступных нет */
function findEnabledIndex(start: number, step: 1 | -1): number {
	const count = props.items.length
	for (let offset = 1; offset <= count; offset++) {
		const index = (((start + step * offset) % count) + count) % count
		if (!props.items[index].isDisabled) return index
	}
	return -1
}

/** Индекс вкладки, на которую ведёт клавиша; null — клавиша не относится к навигации по вкладкам */
function resolveKeyTarget(key: string, currentIndex: number): number | null {
	switch (key) {
		case 'ArrowRight':
			return findEnabledIndex(currentIndex, 1)
		case 'ArrowLeft':
			return findEnabledIndex(currentIndex, -1)
		case 'Home':
			return findEnabledIndex(-1, 1)
		case 'End':
			return findEnabledIndex(props.items.length, -1)
		default:
			return null
	}
}

/**
 * Клавиатура APG Tabs: стрелки с зацикливанием и Home/End, отключённые вкладки пропускаются.
 * Активация автоматическая (выбор следует за фокусом) — APG рекомендует её, когда панель показывается без задержки.
 * Сочетания с модификаторами не перехватываются: Alt+← — это «назад» в браузере.
 */
function handleListKeydown(event: KeyboardEvent): void {
	if (event.altKey || event.ctrlKey || event.metaKey) return

	const tabElements = Array.from(listRef.value?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])
	const currentTab = toHTMLElement(event.target)?.closest<HTMLElement>('[role="tab"]')
	const currentIndex = currentTab ? tabElements.indexOf(currentTab) : -1
	if (currentIndex === -1) return

	const targetIndex = resolveKeyTarget(event.key, currentIndex)
	if (targetIndex === null || targetIndex === -1) return

	event.preventDefault()
	tabElements[targetIndex].focus()

	const targetId = props.items[targetIndex].id
	if (targetId !== props.modelValue) emitSelect(targetId)
}

/** Обновить состояние кнопок навигации */
function updateScrollState(): void {
	const el = listRef.value
	/* istanbul ignore next — defensive: listRef доступен после mount template-ссылки */
	if (!el) return
	canScrollLeft.value = el.scrollLeft > 0
	canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

/* istanbul ignore next -- scroll-обработчики тестируются e2e: jsdom не реализует scroll events с layout */
function handleListScroll(): void {
	updateScrollState()
}

/* istanbul ignore next -- scrollBy недоступен в jsdom без layout */
function handleScrollLeft(): void {
	const el = listRef.value
	if (!el) return
	el.scrollBy({ left: -el.clientWidth * 0.6, behavior: 'smooth' })
}

/* istanbul ignore next -- scrollBy недоступен в jsdom без layout */
function handleScrollRight(): void {
	const el = listRef.value
	if (!el) return
	el.scrollBy({ left: el.clientWidth * 0.6, behavior: 'smooth' })
}

/* istanbul ignore next -- drag-to-scroll опирается на layout/scrollLeft, тестируется e2e */
function handlePointerDown(event: PointerEvent): void {
	if (event.pointerType === 'touch') return
	const el = listRef.value
	if (!el || el.scrollWidth <= el.clientWidth) return
	isDragging.value = true
	hasDragMoved = false
	dragStartX = event.clientX
	dragStartScrollLeft = el.scrollLeft
}

/* istanbul ignore next -- drag-to-scroll опирается на layout/scrollLeft, тестируется e2e */
function handlePointerMove(event: PointerEvent): void {
	if (!isDragging.value) return
	const el = listRef.value
	if (!el) return
	const delta = event.clientX - dragStartX
	if (Math.abs(delta) > 3) hasDragMoved = true
	el.scrollLeft = dragStartScrollLeft - delta
}

/* istanbul ignore next -- drag-to-scroll опирается на layout/scrollLeft, тестируется e2e */
function handlePointerUp(): void {
	if (!isDragging.value) return
	isDragging.value = false
}

let resizeObserver: ResizeObserver | null = null

/** Подключить/переподключить ResizeObserver */
function setupObserver(): void {
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

onMounted(() => {
	setupObserver()
})

/* istanbul ignore next -- переключение isScrollable во время жизни компонента: ResizeObserver callbacks тестируются e2e */
watch(
	() => props.isScrollable,
	() => {
		setupObserver()
	},
)

onUnmounted(() => {
	resizeObserver?.disconnect()
})
</script>
