<template>
	<div
		class="base-mega-menu"
		:class="[
			[
				`base-mega-menu--${layout}`,
				{ 'base-mega-menu--hover': effectiveTrigger === 'hover', 'base-mega-menu--accordion': isMobile },
				variantClass,
			],
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-if="layout === 'columns'" class="base-mega-menu__container" :class="classes.container">
			<div
				v-for="column in columns"
				:key="column.title"
				class="base-mega-menu__column"
				:class="classes.column"
				@mouseenter="handleColumnEnter(column.title)"
				@mouseleave="handleColumnLeave">
				<slot name="column-title" :column="column">
					<h4
						tabindex="0"
						class="base-mega-menu__title"
						:class="[{ 'base-mega-menu__title--open': isColumnOpen(column.title) }, classes.title]"
						@click="toggleColumn(column.title)">
						<BaseIcon v-if="column.icon" :name="column.icon" :size-scale="iconScale" class="base-mega-menu__title-icon" />
						<span class="base-mega-menu__title-text">{{ column.title }}</span>
						<BaseIcon class="base-mega-menu__title-arrow" name="chevron-down" :size-scale="iconScale" />
					</h4>
				</slot>

				<ul v-if="isColumnOpen(column.title)" class="base-mega-menu__list" :class="classes.list">
					<BaseMegaMenuNode
						v-for="item in column.items"
						:key="item.label"
						:item="item"
						:level="0"
						:parent-path="column.title"
						:trigger="effectiveTrigger"
						:layout="layout"
						:is-mobile="isMobile"
						:hover-delay="hoverDelay"
						:size-scale="sizeScale"
						@navigate="emit('navigate', $event)"
						@item-click="emit('item-click', $event)">
						<template #item="slotProps">
							<slot name="item" v-bind="slotProps" />
						</template>
					</BaseMegaMenuNode>
				</ul>
			</div>
		</div>

		<ul v-else class="base-mega-menu__nav" :class="classes.nav">
			<li
				v-for="item in items"
				:key="item.label"
				class="base-mega-menu__nav-item"
				:class="[
					{
						'base-mega-menu__nav-item--open': isNavOpen(item.label),
						'base-mega-menu__nav-item--disabled': item.isDisabled,
					},
					classes.navItem,
				]"
				@mouseenter="handleNavEnter(item)"
				@mouseleave="handleNavLeave">
				<slot name="nav-item" :item="item">
					<BaseButton
						variant="ghost"
						class="base-mega-menu__nav-link"
						:is-disabled="item.isDisabled"
						:size-scale="sizeScale"
						:custom-class="classes.navLink"
						:aria-expanded="hasChildren(item) ? isNavOpen(item.label) : undefined"
						@click="handleNavClick(item)">
						<BaseIcon v-if="item.icon" :name="item.icon" :size-scale="iconScale" class="base-mega-menu__nav-icon" />
						<span class="base-mega-menu__nav-label">{{ item.label }}</span>
						<BaseIcon v-if="hasChildren(item)" name="chevron-down" :size-scale="iconScale" class="base-mega-menu__nav-arrow" />
					</BaseButton>
				</slot>

				<div v-if="hasChildren(item) && isNavOpen(item.label)" class="base-mega-menu__dropdown" :class="classes.dropdown">
					<ul class="base-mega-menu__list">
						<BaseMegaMenuNode
							v-for="child in item.children"
							:key="child.label"
							:item="child"
							:level="0"
							:parent-path="item.label"
							:trigger="effectiveTrigger"
							:layout="layout"
							:is-mobile="isMobile"
							:hover-delay="hoverDelay"
							:size-scale="sizeScale"
							@navigate="emit('navigate', $event)"
							@item-click="emit('item-click', $event)">
							<template #item="slotProps">
								<slot name="item" v-bind="slotProps" />
							</template>
						</BaseMegaMenuNode>
					</ul>
				</div>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import '@components/BaseIcon/styles/BaseIcon.style.scss'
import '@components/BaseLink/styles/BaseLink.style.scss'
import '../styles/BaseMegaMenu.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import BaseMegaMenuNode from './BaseMegaMenuNode.vue'
import { useBaseMegaMenu } from '../model/useBaseMegaMenu'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseMegaMenuEmits, BaseMegaMenuProps, BaseMegaMenuSlots } from '../types/BaseMegaMenu.types'

const props = withDefaults(
	defineProps<BaseMegaMenuProps>(),
	kitDefaults('BaseMegaMenu', {
		variant: DEFAULT_VARIANT,
		trigger: 'click',
		layout: 'columns',
		hoverDelay: 200,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseMegaMenuEmits>()
defineSlots<BaseMegaMenuSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isMobile,
	effectiveTrigger,
	iconScale,
	hasChildren,
	toggleColumn,
	isColumnOpen,
	handleColumnEnter,
	handleColumnLeave,
	isNavOpen,
	handleNavClick,
	handleNavEnter,
	handleNavLeave,
} = useBaseMegaMenu(props, emit)
</script>
