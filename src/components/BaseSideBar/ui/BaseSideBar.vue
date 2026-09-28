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

			<!--
				Одна кнопка в обоих состояниях: при сворачивании она не пересоздаётся, и фокус клавиатуры остаётся на ней.
				Подсказка повторяет её имя: «Свернуть» / «Развернуть».
			-->
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
import { computed, ref, watch } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { usePadding } from '@composables/usePadding'
import { BaseTooltip } from '@components/BaseTooltip'
import { kitDefaults } from '@composables/useDefaults'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { useLinkComponent } from '@composables/useLink'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import BaseSideBarNavigation from './BaseSideBarNavigation.vue'
import type { BaseSideBarEmits, BaseSideBarProps, BaseSideBarSlots, SideBarItem } from '../types/BaseSideBar.types'
import '../styles/BaseSideBar.style.scss'

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
const slots = defineSlots<BaseSideBarSlots>()

const { wasPropPassed } = useExplicitPropDetection()

/** Компонент ссылок: проп, `linkComponent` из плагина, RouterLink приложения или `a` */
const appLinkComponent = useLinkComponent()
const resolvedLinkComponent = computed(() => props.linkComponent ?? appLinkComponent)

const { variantClass, variantStyle, customColorStyle, sizeScaleStyle, classes } = useStandardBaseComponent('base-side-bar', props, [
	'root',
	'header',
	'title',
	'toggle',
	'navigation',
	'loading',
	'body',
	'footer',
	'collapsed',
])

const { paddingStyle: explicitPaddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--sidebar-pad' })
/** Без пропа padding отступы берутся из стилей (8px 12px): inline-переменные --sidebar-pad-* пишутся только для явного значения. */
const paddingStyle = computed(() => (props.padding === undefined ? undefined : explicitPaddingStyle.value))

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
