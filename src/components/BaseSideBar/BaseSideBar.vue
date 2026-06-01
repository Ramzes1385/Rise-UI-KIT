<template>
	<aside
		class="base-sidebar"
		:class="[{ 'base-sidebar--collapsed': isCollapsedState }, variantClass, classes.root]"
		:style="[variantStyle, customColorStyle, sizeScaleStyle, widthStyle, collapsedWidthStyle, paddingStyle, gapStyle]"
		role="complementary">
		<!-- Заголовок -->
		<div v-if="hasHeader" class="base-sidebar__header" :class="classes.header">
			<template v-if="!isCollapsedState">
				<slot name="header">
					<BaseText v-if="title" tag="h3" :weight="600" class="base-sidebar__title" :custom-class="classes.title">
						{{ title }}
					</BaseText>
				</slot>
			</template>
			<BaseTooltip v-if="isCollapsible && isCollapsedState" text="Развернуть" position="right">
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
				v-else-if="isCollapsible"
				variant="ghost"
				:aria-label="toggleLabel"
				:padding="6"
				class="base-sidebar__toggle"
				:custom-class="classes.toggle"
				@click="handleToggle">
				<BaseIcon :name="toggleIcon" />
			</BaseButton>
		</div>

		<!-- Навигация (скрыта при загрузке) -->
		<div
			v-if="hasNavigation && !isCollapsedState && !isLoading"
			class="base-sidebar__navigation"
			:class="classes.navigation">
			<slot name="navigation" />
		</div>

		<!-- Скелетон загрузки (вместо навигации и body) -->
		<div v-if="isLoading" class="base-sidebar__loading" :class="classes.loading">
			<BaseSkeleton shape="rect" :width="'100%'" :height="20" style="margin-bottom: 8px" />
			<BaseSkeleton shape="rect" :width="'80%'" :height="20" style="margin-bottom: 8px" />
			<BaseSkeleton shape="rect" :width="'60%'" :height="20" style="margin-bottom: 8px" />
			<BaseSkeleton shape="rect" :width="'90%'" :height="20" />
		</div>

		<!-- Основной контент (скрыт при загрузке) -->
		<div v-if="hasBody && !isCollapsedState && !isLoading" class="base-sidebar__body" :class="classes.body">
			<slot />
		</div>

		<!-- Подвал -->
		<div v-if="hasFooter && !isCollapsedState && !isLoading" class="base-sidebar__footer" :class="classes.footer">
			<slot name="footer" />
		</div>

		<!-- Контент свёрнутого состояния -->
		<div v-if="hasCollapsedContent && isCollapsedState" class="base-sidebar__collapsed" :class="classes.collapsed">
			<slot name="collapsedContent" />
		</div>
	</aside>
</template>

<script setup lang="ts">
import type { BaseSideBarEmits, BaseSideBarProps } from './BaseSideBar.types'

import { computed, ref, useSlots, watch } from 'vue'

import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { usePadding } from '@composables/usePadding'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'

import './BaseSideBar.style.scss'

const props = withDefaults(defineProps<BaseSideBarProps>(), {
	width: 280,
	collapsedWidth: 64,
	isCollapsible: true,
	variant: 'default',
	padding: 12,
	gap: 0,
	sizeScale: 100,
	isLoading: false,
})

const emit = defineEmits<BaseSideBarEmits>()
const slots = useSlots()

const { variantClass, variantStyle } = useVariant({ block: 'base-sidebar', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'header', 'title', 'toggle', 'navigation', 'loading', 'body', 'footer', 'collapsed'],
})
const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--sidebar-pad', defaultPadding: 12 })

/** Внутреннее состояние сворачивания */
const internalCollapsed = ref(false)

/** Свёрнутое состояние (контролируемое или внутреннее) */
const isCollapsedState = computed(() => props.isCollapsed ?? internalCollapsed.value)

/** Иконка кнопки сворачивания */
const toggleIcon = computed(() => 'menu')

/** Aria-label кнопки сворачивания */
const toggleLabel = computed(() => (isCollapsedState.value ? 'Развернуть' : 'Свернуть'))

/** Стили ширины */
const widthStyle = computed(() => ({
	'--sidebar-width': `${props.width}px`,
}))

/** Стили ширины свёрнутого состояния */
const collapsedWidthStyle = computed(() => ({
	'--sidebar-collapsed-width': `${props.collapsedWidth}px`,
}))

/** Стили gap между секциями */
const gapStyle = computed(() => ({
	'--sidebar-gap': `${props.gap}px`,
}))

/** Есть ли заголовок */
const hasHeader = computed(() => !!slots.header || !!props.title || props.isCollapsible)

/** Есть ли навигация */
const hasNavigation = computed(() => !!slots.navigation)

/** Есть ли подвал */
const hasFooter = computed(() => !!slots.footer)

/** Есть ли body */
const hasBody = computed(() => !!slots.default)

/** Есть ли контент свёрнутого состояния */
const hasCollapsedContent = computed(() => !!slots.collapsedContent)

/** Переключить свёрнутое состояние */
function handleToggle(): void {
	const newValue = !isCollapsedState.value
	if (props.isCollapsed === undefined) {
		internalCollapsed.value = newValue
	}
	emit('update:isCollapsed', newValue)
	if (newValue) {
		emit('collapse')
	} else {
		emit('expand')
	}
}

/** Синхронизация с внешним пропсом */
watch(
	() => props.isCollapsed,
	(val: boolean | undefined) => {
		if (val !== undefined) {
			internalCollapsed.value = val
		}
	},
	{ immediate: true },
)
</script>
