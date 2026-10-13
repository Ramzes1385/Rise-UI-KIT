<template>
	<div
		:class="[
			ui('root'),
			classes.root,
			variantClass,
			{
				'base-tabs--full-width': isFullWidth,
				'base-tabs--scrollable': isScrollable,
				'base-tabs--indicator-ready': isIndicatorVisible,
			},
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div :class="[ui('nav'), classes.nav]">
			<Transition name="base-tabs-scroll">
				<BaseButton
					v-if="isScrollable && canScrollLeft"
					variant="ghost"
					:class="[ui('scroll-btn'), 'base-tabs__scroll-btn--left', classes.scrollBtn]"
					:size-scale="sizeScale"
					:aria-label="UI_ARIA.TABS_SCROLL_LEFT"
					@click="handleScrollLeft">
					<template #left><BaseIcon name="chevron-left" :size-scale="sizeScale" /></template>
				</BaseButton>
			</Transition>
			<div
				ref="listRef"
				:class="[ui('list'), classes.list, { 'base-tabs__list--dragging': isDragging }]"
				:style="indicatorStyle"
				role="tablist"
				@keydown="handleListKeydown"
				@scroll="handleListScroll"
				@pointerdown="handlePointerDown"
				@pointermove="handlePointerMove"
				@pointerup="handlePointerUp"
				@pointercancel="handlePointerUp"
				@pointerleave="handlePointerUp">
				<span
					v-if="isIndicatorVisible"
					:class="[ui('indicator'), { 'base-tabs__indicator--instant': isIndicatorInstant }]"
					aria-hidden="true"></span>
				<BaseButton
					v-for="(item, index) in items"
					:id="getTabId(index)"
					:key="item.id"
					variant="ghost"
					role="tab"
					data-indicator-item
					:class="[
						ui('tab'),
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
					<span v-if="item.icon || $slots.icon" :class="[ui('icon'), classes.icon]" aria-hidden="true">
						<slot name="icon" :item="item">
							<BaseIcon v-if="item.icon" :name="item.icon" :size-scale="sizeScale" />
						</slot>
					</span>
					<span :class="[ui('label'), classes.label]">{{ item.label }}</span>
				</BaseButton>
			</div>
			<Transition name="base-tabs-scroll">
				<BaseButton
					v-if="isScrollable && canScrollRight"
					variant="ghost"
					:class="[ui('scroll-btn'), 'base-tabs__scroll-btn--right', classes.scrollBtn]"
					:size-scale="sizeScale"
					:aria-label="UI_ARIA.TABS_SCROLL_RIGHT"
					@click="handleScrollRight">
					<template #left><BaseIcon name="chevron-right" :size-scale="sizeScale" /></template>
				</BaseButton>
			</Transition>
		</div>
		<div
			:id="panelId"
			:class="[ui('content'), classes.content]"
			:role="hasPanel() ? 'tabpanel' : undefined"
			:aria-labelledby="hasPanel() && selectedIndex !== -1 ? getTabId(selectedIndex) : undefined"
			:tabindex="hasPanel() ? 0 : undefined">
			<Transition name="base-tabs-panel" @before-leave="handlePanelBeforeLeave">
				<div v-if="hasCurrentPanel()" :key="modelValue" :class="ui('panel')">
					<slot :name="panelSlot()"></slot>
				</div>
			</Transition>
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
	ui,
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
	handlePanelBeforeLeave,
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
	hasCurrentPanel,
	panelSlot,
	indicatorStyle,
	isIndicatorVisible,
	isIndicatorInstant,
} = useBaseTabs(props, emit)
</script>
