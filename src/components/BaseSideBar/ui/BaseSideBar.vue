<template>
	<aside
		class="base-sidebar"
		:class="[{ 'base-sidebar--collapsed': isCollapsedState }, variantClass, classes.root]"
		:style="[variantStyle, customColorStyle, sizeScaleStyle, widthStyle, collapsedWidthStyle, paddingStyle, gapStyle]"
		role="complementary">
		<div v-if="hasHeader" class="base-sidebar__header" :class="classes.header">
			<template v-if="!isCollapsedState">
				<slot name="header">
					<BaseText v-if="props.title" tag="h3" :weight="700" class="base-sidebar__title" :custom-class="classes.title">
						{{ props.title }}
					</BaseText>
				</slot>
			</template>

			<BaseTooltip v-if="resolvedIsCollapsible && isCollapsedState" text="Развернуть" position="right">
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
				v-else-if="resolvedIsCollapsible"
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
			v-if="hasNavigation && !resolvedIsLoading && (!isCollapsedState || hasItems)"
			class="base-sidebar__navigation"
			:class="classes.navigation">
			<slot v-if="!isCollapsedState && $slots.navigation" name="navigation" />

			<BaseSideBarNavigation
				v-else-if="hasItems"
				:items="props.items"
				:active-key="props.activeKey"
				:active-path="props.activePath"
				:active-match="resolvedActiveMatch"
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

		<div v-if="resolvedIsLoading" class="base-sidebar__loading" :class="classes.loading">
			<BaseSkeleton shape="rect" :width="'100%'" :height="20" style="margin-bottom: 8px" />
			<BaseSkeleton shape="rect" :width="'82%'" :height="20" style="margin-bottom: 8px" />
			<BaseSkeleton shape="rect" :width="'64%'" :height="20" style="margin-bottom: 8px" />
			<BaseSkeleton shape="rect" :width="'92%'" :height="20" />
		</div>

		<div v-if="hasBody && !isCollapsedState && !resolvedIsLoading" class="base-sidebar__body" :class="classes.body">
			<slot />
		</div>

		<div v-if="hasFooter && !resolvedIsLoading" class="base-sidebar__footer" :class="classes.footer">
			<slot name="footer" />
		</div>

		<div v-if="hasCollapsedContent && isCollapsedState" class="base-sidebar__collapsed" :class="classes.collapsed">
			<slot name="collapsedContent" />
		</div>
	</aside>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref, watch } from 'vue'
import type { BaseSideBarEmits, BaseSideBarProps, BaseSideBarSlots, SideBarItem } from '../model/BaseSideBar.types'

import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { UI_SIDEBAR_DEFAULT_WIDTH } from '@constants/ui'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { usePadding } from '@composables/usePadding'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'

import BaseSideBarNavigation from './BaseSideBarNavigation.vue'

import '../styles/BaseSideBar.style.scss'

defineOptions({
	name: 'BaseSideBar',
})

const props = defineProps<BaseSideBarProps>()
const emit = defineEmits<BaseSideBarEmits>()
const slots = defineSlots<BaseSideBarSlots>()

const instance = getCurrentInstance()

function hasPassedProp(camelCaseName: string, kebabCaseName: string): boolean {
	const rawProps = instance?.vnode.props ?? /* istanbul ignore next */ {}

	return (
		Object.prototype.hasOwnProperty.call(rawProps, camelCaseName) ||
		Object.prototype.hasOwnProperty.call(rawProps, kebabCaseName)
	)
}

const resolvedWidth = computed(() => props.width ?? UI_SIDEBAR_DEFAULT_WIDTH)
const resolvedCollapsedWidth = computed(() => props.collapsedWidth ?? 68)
const resolvedIsCollapsible = computed(() => {
	if (!hasPassedProp('isCollapsible', 'is-collapsible')) {
		return true
	}

	return props.isCollapsible === true
})
const resolvedVariant = computed(() => props.variant ?? 'default')
const resolvedPadding = computed(() => props.padding ?? 12)
const resolvedGap = computed(() => props.gap ?? 4)
const resolvedSizeScale = computed(() => props.sizeScale ?? 100)
const resolvedIsLoading = computed(() => props.isLoading === true)
const resolvedActiveMatch = computed(() => props.activeMatch ?? 'exact')
const resolvedLinkComponent = computed(() => props.linkComponent ?? 'a')

const { variantClass, variantStyle } = useVariant({
	block: 'base-sidebar',
	getVariant: () => resolvedVariant.value,
})

const { customColorStyle } = useCustomColor({
	getColor: () => props.color,
})

const { sizeScaleStyle } = useSizeScale({
	getScale: () => resolvedSizeScale.value,
})

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'header', 'title', 'toggle', 'navigation', 'loading', 'body', 'footer', 'collapsed'],
})

const { paddingStyle } = usePadding({
	getPadding: () => resolvedPadding.value,
	prefix: '--sidebar-pad',
	defaultPadding: 12,
})

const internalCollapsed = ref(false)
const isCollapsedControlled = computed(() => hasPassedProp('isCollapsed', 'is-collapsed'))
const isCollapsedState = computed(() => {
	if (isCollapsedControlled.value) {
		return props.isCollapsed === true
	}

	return internalCollapsed.value
})

const toggleIcon = computed(() => 'menu')
const toggleLabel = computed(() => (isCollapsedState.value ? 'Развернуть' : 'Свернуть'))

const widthStyle = computed(() => ({
	'--sidebar-width': `${resolvedWidth.value}px`,
}))

const collapsedWidthStyle = computed(() => ({
	'--sidebar-collapsed-width': `${resolvedCollapsedWidth.value}px`,
}))

const gapStyle = computed(() => ({
	'--sidebar-gap': `${resolvedGap.value}px`,
}))

const hasItems = computed(() => Boolean(props.items?.length))
const hasHeader = computed(() => Boolean(slots.header) || Boolean(props.title) || resolvedIsCollapsible.value)
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
