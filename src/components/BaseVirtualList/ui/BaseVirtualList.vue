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
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseVirtualList } from '../model/useBaseVirtualList'
import '../styles/BaseVirtualList.style.scss'
import type { BaseVirtualListExpose, BaseVirtualListProps, BaseVirtualListSlots } from '../types/BaseVirtualList.types'

const props = withDefaults(
	defineProps<BaseVirtualListProps<T>>(),
	kitDefaults('BaseVirtualList', {
		variant: DEFAULT_VARIANT,
		itemSize: 40,
		overscan: 5,
		height: 400,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseVirtualListSlots<T>>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	classes,
	viewportRef,
	viewportStyle,
	handleFocusin,
	handleFocusout,
	virtualItems,
	totalSize,
	measureElement,
	isScrollable,
	exposed,
} = useBaseVirtualList(props)

defineExpose<BaseVirtualListExpose>(exposed)
</script>
