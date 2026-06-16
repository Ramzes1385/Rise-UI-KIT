<template>
	<aside
		class="base-sidebar"
		:class="[{ 'base-sidebar--collapsed': isCollapsedState }, variantClass, classes.root]"
		:style="[variantStyle, customColorStyle, sizeScaleStyle, widthStyle, collapsedWidthStyle, paddingStyle, gapStyle]"
		role="complementary">
		<div v-if="hasHeader" class="base-sidebar__header" :class="classes.header">
			<template v-if="!isCollapsedState">
				<slot name="header">
					<BaseText v-if="props.title" tag="h3" :weight="UI_FONT_WEIGHT_BOLD" class="base-sidebar__title" :custom-class="classes.title">
						{{ props.title }}
					</BaseText>
				</slot>
			</template>

			<BaseTooltip v-if="props.isCollapsible && isCollapsedState" :text="UI_EXPAND_TEXT" position="right">
				<BaseButton
					variant="ghost"
					:aria-label="toggleLabel"
					:padding="6"
					class="base-sidebar__toggle"
					:custom-class="classes.toggle"
					@click="handleToggle">
					<BaseIcon :name="toggleIcon" />
				</BaseButton>
			</BaseTooltip>

			<BaseButton
				v-else-if="props.isCollapsible"
				variant="ghost"
				:aria-label="toggleLabel"
				:padding="6"
				class="base-sidebar__toggle"
				:custom-class="classes.toggle"
				@click="handleToggle">
				<BaseIcon :name="toggleIcon" />
			</BaseButton>
		</div>

		<div
			v-if="hasNavigation && !props.isLoading && (!isCollapsedState || hasItems)"
			class="base-sidebar__navigation"
			:class="classes.navigation">
			<slot v-if="!isCollapsedState && $slots.navigation" name="navigation" />

			<BaseSideBarNavigation
				v-else-if="hasItems"
				:items="props.items"
				:active-key="props.activeKey"
				:active-path="props.activePath"
				:active-match="props.activeMatch"
				:link-component="props.linkComponent"
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

		<div v-if="props.isLoading" class="base-sidebar__loading" :class="classes.loading">
			<BaseSkeleton shape="rect" :width="'100%'" :height="20" style="margin-bottom: 8px" />
			<BaseSkeleton shape="rect" :width="'82%'" :height="20" style="margin-bottom: 8px" />
			<BaseSkeleton shape="rect" :width="'64%'" :height="20" style="margin-bottom: 8px" />
			<BaseSkeleton shape="rect" :width="'92%'" :height="20" />
		</div>

		<div v-if="hasBody && !isCollapsedState && !props.isLoading" class="base-sidebar__body" :class="classes.body">
			<slot />
		</div>

		<div v-if="hasFooter && !props.isLoading" class="base-sidebar__footer" :class="classes.footer">
			<slot name="footer" />
		</div>

		<div v-if="hasCollapsedContent && isCollapsedState" class="base-sidebar__collapsed" :class="classes.collapsed">
			<slot name="collapsedContent" />
		</div>
	</aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { BaseSideBarEmits, BaseSideBarProps, BaseSideBarSlots, SideBarItem } from '../model/BaseSideBar.types'

import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { UI_COLLAPSE_TEXT, UI_EXPAND_TEXT, UI_FONT_WEIGHT_BOLD, UI_SIDEBAR_DEFAULT_WIDTH } from '@constants'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'
import { useBaseComponent } from '@composables/useBaseComponent'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import { usePadding } from '@composables/usePadding'

import BaseSideBarNavigation from './BaseSideBarNavigation.vue'

import '../styles/BaseSideBar.style.scss'

defineOptions({
	name: 'BaseSideBar',
})

const props = withDefaults(defineProps<BaseSideBarProps>(), {
	width: UI_SIDEBAR_DEFAULT_WIDTH,
	collapsedWidth: 68,
	padding: 12,
	gap: 4,
	activeMatch: 'exact',
	linkComponent: 'a',
	isCollapsible: true,
	isLoading: false,
	sizeScale: 100,
})
const emit = defineEmits<BaseSideBarEmits>()
const slots = defineSlots<BaseSideBarSlots>()

const { wasPropPassed } = useExplicitPropDetection()

const { variantClass, variantStyle, customColorStyle, sizeScaleStyle, classes } = useBaseComponent({
	block: 'base-sidebar',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'header', 'title', 'toggle', 'navigation', 'loading', 'body', 'footer', 'collapsed'],
})

const { paddingStyle } = usePadding({
	getPadding: () => props.padding,
	prefix: '--sidebar-pad',
	defaultPadding: 12,
})

const internalCollapsed = ref(false)
const isCollapsedControlled = computed(() => wasPropPassed('isCollapsed'))
const isCollapsedState = computed(() => {
	if (isCollapsedControlled.value) {
		return props.isCollapsed === true
	}

	return internalCollapsed.value
})

const toggleIcon = computed(() => 'menu')
const toggleLabel = computed(() => (isCollapsedState.value ? UI_EXPAND_TEXT : UI_COLLAPSE_TEXT))

const widthStyle = computed(() => ({
	'--sidebar-width': `${props.width}px`,
}))

const collapsedWidthStyle = computed(() => ({
	'--sidebar-collapsed-width': `${props.collapsedWidth}px`,
}))

const gapStyle = computed(() => ({
	'--sidebar-gap': `${props.gap}px`,
}))

const hasItems = computed(() => Boolean(props.items?.length))
const hasHeader = computed(() => Boolean(slots.header) || Boolean(props.title) || props.isCollapsible)
const hasNavigation = computed(() => Boolean(slots.navigation) || hasItems.value)
const hasFooter = computed(() => Boolean(slots.footer))
const hasBody = computed(() => Boolean(slots.default))
const hasCollapsedContent = computed(() => Boolean(slots.collapsedContent))

function handleToggle(): void {
	const newValue = !isCollapsedState.value

	if (!isCollapsedControlled.value) {
		internalCollapsed.value = newValue
	}

	emit('update:isCollapsed', newValue)

	if (newValue) {
		emit('collapse')
	} else {
		emit('expand')
	}
}

function handleItemClick(item: SideBarItem, event: MouseEvent): void {
	emit('itemClick', item, event)
}

watch(
	() => props.isCollapsed,
	(val: boolean | undefined) => {
		if (isCollapsedControlled.value) {
			internalCollapsed.value = val === true
		}
	},
	{ immediate: true },
)
</script>
