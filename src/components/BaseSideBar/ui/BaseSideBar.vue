<template>
	<aside
		class="base-side-bar"
		:class="[{ 'base-side-bar--collapsed': isCollapsedState }, variantClass, classes.root]"
		:style="[variantStyle, customColorStyle, sizeScaleStyle, widthStyle, collapsedWidthStyle, paddingStyle, gapStyle]"
		role="complementary">
		<div v-if="hasHeader" class="base-side-bar__header" :class="classes.header">
			<template v-if="!isCollapsedState">
				<slot name="header">
					<BaseText v-if="title" tag="h3" :weight="UI_FONT_WEIGHT.BOLD" class="base-side-bar__title" :custom-class="classes.title">
						{{ title }}
					</BaseText>
				</slot>
			</template>

			<BaseTooltip v-if="isCollapsible && isCollapsedState" :text="UI_TEXT.EXPAND" position="right">
				<BaseButton
					variant="ghost"
					:aria-label="toggleLabel"
					:padding="6"
					class="base-side-bar__toggle"
					:custom-class="classes.toggle"
					@click="handleToggle">
					<BaseIcon :name="toggleIcon" />
				</BaseButton>
			</BaseTooltip>

			<BaseButton
				v-else-if="isCollapsible"
				variant="ghost"
				:aria-label="toggleLabel"
				:padding="6"
				class="base-side-bar__toggle"
				:custom-class="classes.toggle"
				@click="handleToggle">
				<BaseIcon :name="toggleIcon" />
			</BaseButton>
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
				:link-component="linkComponent"
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
			<BaseSkeleton shape="rect" :width="'100%'" :height="20" style="margin-bottom: 8px" />
			<BaseSkeleton shape="rect" :width="'82%'" :height="20" style="margin-bottom: 8px" />
			<BaseSkeleton shape="rect" :width="'64%'" :height="20" style="margin-bottom: 8px" />
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
import { computed, ref, watch } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import { usePadding } from '@composables/usePadding'
import { UI_TEXT, UI_FONT_WEIGHT, UI_SIZE, SIZE_SCALE_DEFAULT} from '@constants'
import BaseSideBarNavigation from './BaseSideBarNavigation.vue'
import type { BaseSideBarEmits, BaseSideBarProps, BaseSideBarSlots, SideBarItem } from '../model/BaseSideBar.types'
import '../styles/BaseSideBar.style.scss'

defineOptions({
	name: 'BaseSideBar',
})

const props = withDefaults(defineProps<BaseSideBarProps>(), {
	width: UI_SIZE.SIDEBAR_DEFAULT_WIDTH,
	collapsedWidth: 68,
	padding: 12,
	gap: 4,
	activeMatch: 'exact',
	linkComponent: 'a',
	isCollapsible: true,
	isLoading: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})
const emit = defineEmits<BaseSideBarEmits>()
const slots = defineSlots<BaseSideBarSlots>()

const { wasPropPassed } = useExplicitPropDetection()

const { variantClass, variantStyle, customColorStyle, sizeScaleStyle, classes } = useStandardBaseComponent('base-side-bar', props, ['root', 'header', 'title', 'toggle', 'navigation', 'loading', 'body', 'footer', 'collapsed'])

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
const toggleLabel = computed(() => (isCollapsedState.value ? UI_TEXT.EXPAND : UI_TEXT.COLLAPSE))

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
	(collapsed: boolean | undefined) => {
		if (isCollapsedControlled.value) {
			internalCollapsed.value = collapsed === true
		}
	},
	{ immediate: true },
)
</script>
