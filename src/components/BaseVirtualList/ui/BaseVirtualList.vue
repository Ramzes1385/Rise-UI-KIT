<template>
	<!--
		Виртуальный список: в DOM только видимые строки и запас, остальные — высотой внутреннего блока. Список —
		role="list" с именем, строки — listitem с aria-setsize и aria-posinset: скринридер знает длину всего списка.
		Строка с фокусом остаётся в DOM и вне видимой области. Область с прокруткой получает tabindex="0"
	-->
	<div
		ref="viewportRef"
		class="base-virtual-list"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, viewportStyle]"
		role="list"
		:aria-label="ariaLabel"
		:tabindex="isScrollable ? 0 : undefined"
		@focusin="handleFocusin"
		@focusout="handleFocusout">
		<div class="base-virtual-list__inner" role="none" :style="{ height: `${totalSize}px` }">
			<div
				v-for="entry in virtualItems"
				:key="entry.key"
				:ref="element => measureElement(element, entry.index)"
				class="base-virtual-list__item"
				:class="classes.item"
				:style="{ transform: `translateY(${entry.start}px)` }"
				role="listitem"
				:aria-setsize="items.length"
				:aria-posinset="entry.index + 1"
				:data-index="entry.index">
				<slot :item="items[entry.index]" :index="entry.index" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" generic="T">
import { computed, ref } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useVirtualList } from '@composables/useVirtualList'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@constants'
import '../styles/BaseVirtualList.style.scss'
import type { BaseVirtualListExpose, BaseVirtualListProps, BaseVirtualListSlots } from '../model/BaseVirtualList.types'
import type { VirtualKey } from '@composables/useVirtualList'

const props = withDefaults(defineProps<BaseVirtualListProps<T>>(), kitDefaults('BaseVirtualList', {
	variant: DEFAULT_VARIANT,
	itemSize: 40,
	overscan: 5,
	height: 400,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

defineSlots<BaseVirtualListSlots<T>>()

const { sizeScaleStyle, variantClass, variantStyle, classes } = useStandardBaseComponent('base-virtual-list', props, ['root', 'item'])

const viewportRef = ref<HTMLElement | null>(null)

const viewportStyle = computed(() => ({ height: typeof props.height === 'number' ? `${props.height}px` : props.height }))

/** Ключ строки: функция, поле из itemKey, поле id, иначе индекс */
function keyOf(index: number): VirtualKey {
	const item = props.items[index]
	if (typeof props.itemKey === 'function') return props.itemKey(item, index)
	const field = props.itemKey ?? 'id'
	const value = item !== null && typeof item === 'object' ? (item as Record<string, unknown>)[field] : undefined
	return typeof value === 'string' || typeof value === 'number' ? value : index
}

/** Строка, в которой фокус: она не уходит из DOM при прокрутке */
const focusedIndex = ref<number>()

function handleFocusin(event: FocusEvent): void {
	const row = (event.target as HTMLElement).closest<HTMLElement>('.base-virtual-list__item')
	focusedIndex.value = row ? Number(row.dataset.index) : undefined
}

function handleFocusout(event: FocusEvent): void {
	if (!viewportRef.value?.contains(event.relatedTarget as Node | null)) focusedIndex.value = undefined
}

const {
	items: virtualItems,
	totalSize,
	viewportSize,
	measureElement,
	scrollToIndex,
} = useVirtualList({
	count: () => props.items.length,
	estimateSize: () => props.itemSize,
	overscan: () => props.overscan,
	scrollElement: viewportRef,
	getKey: keyOf,
	pinnedIndex: () => focusedIndex.value,
})

/** Содержимое выше области — её можно прокрутить с клавиатуры, поэтому она в порядке Tab */
const isScrollable = computed(() => totalSize.value > viewportSize.value)

defineExpose<BaseVirtualListExpose>({
	scrollToIndex,
	getViewport: () => viewportRef.value,
})
</script>
