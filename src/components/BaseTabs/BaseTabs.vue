<template>
	<div
		class="base-tabs"
		:class="[
			classes.root,
			variantClass,
			{ 'base-tabs--full-width': isFullWidth, 'base-tabs--scrollable': isScrollable },
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div class="base-tabs__nav" :class="classes.nav">
			<BaseButton
				v-if="isScrollable && canScrollLeft"
				variant="ghost"
				class="base-tabs__scroll-btn base-tabs__scroll-btn--left"
				:class="classes.scrollBtn"
				:size-scale="sizeScale"
				@click="handleScrollLeft">
				<template #left><BaseIcon name="chevron-left" :size-scale="sizeScale" /></template>
			</BaseButton>
			<div
				ref="listRef"
				class="base-tabs__list"
				:class="[classes.list, { 'base-tabs__list--dragging': isDragging }]"
				role="tablist"
				@scroll="handleListScroll"
				@pointerdown="handlePointerDown"
				@pointermove="handlePointerMove"
				@pointerup="handlePointerUp"
				@pointercancel="handlePointerUp"
				@pointerleave="handlePointerUp">
				<BaseButton
					v-for="item in items"
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
					:size-scale="sizeScale"
					@click="handleTabClick(item.id)">
					<span v-if="item.icon" class="base-tabs__icon" :class="classes.icon" v-html="item.icon"></span>
					<BaseText tag="span" class="base-tabs__label" :class="classes.label" :size-scale="sizeScale">
						{{ item.label }}
					</BaseText>
				</BaseButton>
			</div>
			<BaseButton
				v-if="isScrollable && canScrollRight"
				variant="ghost"
				class="base-tabs__scroll-btn base-tabs__scroll-btn--right"
				:class="classes.scrollBtn"
				:size-scale="sizeScale"
				@click="handleScrollRight">
				<template #left><BaseIcon name="chevron-right" :size-scale="sizeScale" /></template>
			</BaseButton>
		</div>
		<div class="base-tabs__content" :class="classes.content">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import './BaseTabs.style.scss'
import type { BaseTabsEmits, BaseTabsProps } from './BaseTabs.types'

const props = withDefaults(defineProps<BaseTabsProps>(), {
	variant: 'underline',
	isFullWidth: false,
	isScrollable: false,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-tabs', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'nav', 'scrollBtn', 'list', 'tab', 'icon', 'label', 'content'],
})

const emit = defineEmits<BaseTabsEmits>()

const listRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const isDragging = ref(false)

let dragStartX = 0
let dragStartScrollLeft = 0
let hasDragMoved = false

function handleTabClick(id: string): void {
	/* istanbul ignore next -- hasDragMoved выставляется только при drag-to-scroll (e2e) */
	if (hasDragMoved) {
		hasDragMoved = false
		return
	}

	const tab = props.items.find(item => item.id === id)
	/* istanbul ignore next — defensive: id всегда из items (template v-for) */
	if (tab?.isDisabled) return

	emit('update:modelValue', id)
	emit('change', id)
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
