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
					:aria-controls="hasPanel() ? panelId : undefined"
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
		<div
			:id="panelId"
			class="base-tabs__content"
			:class="classes.content"
			:role="hasPanel() ? 'tabpanel' : undefined"
			:aria-labelledby="hasPanel() && selectedIndex !== -1 ? getTabId(selectedIndex) : undefined"
			:tabindex="hasPanel() ? 0 : undefined">
			<slot :name="panelSlot()"></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseTabs.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseTabs } from '../model/useBaseTabs'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/base/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseTabsEmits, BaseTabsProps, BaseTabsSlots } from '../types/BaseTabs.types'

const props = withDefaults(
	defineProps<BaseTabsProps>(),
	kitDefaults('BaseTabs', {
		isFullWidth: false,
		isScrollable: false,
		sizeScale: SIZE_SCALE_DEFAULT,
		variant: 'underline',
	}),
)
const emit = defineEmits<BaseTabsEmits>()
defineSlots<BaseTabsSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	listRef,
	panelId,
	getTabId,
	selectedIndex,
	rovingIndex,
	handleTabClick,
	handleListKeydown,
	isDragging,
	handlePointerDown,
	handlePointerMove,
	handlePointerUp,
	canScrollLeft,
	canScrollRight,
	handleListScroll,
	handleScrollLeft,
	handleScrollRight,
	hasPanel,
	panelSlot,
} = useBaseTabs(props, emit)
</script>
