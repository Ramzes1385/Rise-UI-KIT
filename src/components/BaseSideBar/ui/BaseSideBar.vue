<template>
	<aside
		class="base-side-bar"
		:class="[{ 'base-side-bar--collapsed': isCollapsedState }, variantClass, classes.root]"
		:style="[variantStyle, customColorStyle, sizeScaleStyle, widthStyle, collapsedWidthStyle, paddingStyle, gapStyle]"
		role="complementary">
		<div v-if="hasHeader" class="base-side-bar__header" :class="classes.header">
			<template v-if="!isCollapsedState">
				<slot name="header">
					<h3 v-if="title" class="base-side-bar__title" :class="classes.title">{{ title }}</h3>
				</slot>
			</template>

			<BaseTooltip v-if="isCollapsible" :text="toggleLabel" position="right" class="base-side-bar__toggle-tooltip">
				<BaseButton
					variant="ghost"
					:aria-label="toggleLabel"
					class="base-side-bar__toggle"
					:custom-class="classes.toggle"
					@click="handleToggle">
					<BaseIcon :name="toggleIcon" />
				</BaseButton>
			</BaseTooltip>
		</div>

		<div
			v-if="hasNavigation && !isLoading && (!isCollapsedState || hasItems)"
			class="base-side-bar__navigation"
			:class="classes.navigation">
			<slot v-if="!isCollapsedState && $slots.navigation" name="navigation" />

			<BaseSideBarNavigation
				v-else-if="hasItems"
				:items="items"
				:active-key="activeKey"
				:active-path="activePath"
				:active-match="activeMatch"
				:link-component="resolvedLinkComponent"
				:is-collapsed="isCollapsedState"
				@item-click="handleItemClick">
				<template v-if="$slots.item" #item="slotProps">
					<slot name="item" v-bind="slotProps" />
				</template>

				<template v-if="$slots.icon" #icon="slotProps">
					<slot name="icon" v-bind="slotProps" />
				</template>

				<template v-if="$slots.label" #label="slotProps">
					<slot name="label" v-bind="slotProps" />
				</template>

				<template v-if="$slots.badge" #badge="slotProps">
					<slot name="badge" v-bind="slotProps" />
				</template>
			</BaseSideBarNavigation>
		</div>

		<div v-if="isLoading" class="base-side-bar__loading" :class="classes.loading">
			<BaseSkeleton shape="rect" :width="'100%'" :height="20" />
			<BaseSkeleton shape="rect" :width="'82%'" :height="20" />
			<BaseSkeleton shape="rect" :width="'64%'" :height="20" />
			<BaseSkeleton shape="rect" :width="'92%'" :height="20" />
		</div>

		<div v-if="hasBody && !isCollapsedState && !isLoading" class="base-side-bar__body" :class="classes.body">
			<slot />
		</div>

		<div v-if="hasFooter && !isLoading" class="base-side-bar__footer" :class="classes.footer">
			<slot name="footer" />
		</div>

		<div v-if="hasCollapsedContent && isCollapsedState" class="base-side-bar__collapsed" :class="classes.collapsed">
			<slot name="collapsedContent" />
		</div>
	</aside>
</template>

<script setup lang="ts">
import '@components/BaseLink/styles/BaseLink.style.scss'
import '../styles/BaseSideBar.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseTooltip } from '@components/BaseTooltip'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { useBaseSideBar } from '../model/useBaseSideBar'
import { kitDefaults } from '@composables/base/useDefaults'
import BaseSideBarNavigation from './BaseSideBarNavigation.vue'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseSideBarEmits, BaseSideBarProps, BaseSideBarSlots } from '../types/BaseSideBar.types'

defineOptions({
	name: 'BaseSideBar',
})

const props = withDefaults(
	defineProps<BaseSideBarProps>(),
	kitDefaults('BaseSideBar', {
		variant: DEFAULT_VARIANT,
		width: 280,
		collapsedWidth: 68,
		padding: undefined,
		gap: 4,
		activeMatch: 'exact',
		isCollapsible: true,
		isLoading: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseSideBarEmits>()
defineSlots<BaseSideBarSlots>()

const {
	variantClass,
	variantStyle,
	customColorStyle,
	sizeScaleStyle,
	classes,
	resolvedLinkComponent,
	paddingStyle,
	widthStyle,
	collapsedWidthStyle,
	gapStyle,
	isCollapsedState,
	toggleLabel,
	handleToggle,
	toggleIcon,
	hasItems,
	hasHeader,
	hasNavigation,
	hasFooter,
	hasBody,
	hasCollapsedContent,
	handleItemClick,
} = useBaseSideBar(props, emit)
</script>
