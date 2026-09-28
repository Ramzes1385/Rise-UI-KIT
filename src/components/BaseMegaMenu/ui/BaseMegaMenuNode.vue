<template>
	<li
		class="base-mega-menu__node"
		:class="{
			'base-mega-menu__node--open': isOpen,
			'base-mega-menu__node--disabled': item.isDisabled,
			'base-mega-menu__node--has-children': hasChildren,
		}"
		@mouseenter="handleEnter"
		@mouseleave="handleLeave">
		<slot name="item" :item="item" :level="level">
			<BaseLink
				v-if="isLink"
				class="base-mega-menu__node-header"
				variant="ghost"
				:to="item.to"
				:href="item.href"
				:target="item.target"
				:is-disabled="item.isDisabled"
				:size-scale="sizeScale"
				@click="handleLinkClick">
				<BaseIcon v-if="item.icon" :name="item.icon" :size-scale="iconScale" class="base-mega-menu__node-icon" />
				<span class="base-mega-menu__node-label">{{ item.label }}</span>
			</BaseLink>
			<div
				v-else
				ref="anchorRef"
				class="base-mega-menu__node-header"
				role="button"
				:tabindex="item.isDisabled ? -1 : 0"
				:aria-expanded="hasChildren ? isOpen : undefined"
				:aria-disabled="item.isDisabled || undefined"
				@click.stop="handleClick"
				@keydown.enter.prevent="handleClick"
				@keydown.space.prevent="handleClick">
				<BaseIcon v-if="item.icon" :name="item.icon" :size-scale="iconScale" class="base-mega-menu__node-icon" />
				<span class="base-mega-menu__node-label">{{ item.label }}</span>
				<BaseIcon v-if="hasChildren" name="chevron-right" :size-scale="iconScale" class="base-mega-menu__node-arrow" />
			</div>
		</slot>

		<p v-if="item.description" class="base-mega-menu__node-desc">{{ item.description }}</p>

		<ul
			v-if="hasChildren && isOpen"
			ref="panelRef"
			class="base-mega-menu__sub-list"
			:class="{
				'base-mega-menu__sub-list--flyout': isFlyout,
				'base-mega-menu__sub-list--flip': isFlyout && isFlipped,
			}"
			:style="isFlyout ? panelStyle : undefined">
			<BaseMegaMenuNode
				v-for="child in item.children"
				:key="child.label"
				:item="child"
				:level="level + 1"
				:parent-path="nodePath"
				:trigger="trigger"
				:layout="layout"
				:is-mobile="isMobile"
				:hover-delay="hoverDelay"
				:size-scale="sizeScale"
				@navigate="emit('navigate', $event)"
				@item-click="emit('item-click', $event)">
				<template #item="{ item: childItem, level: childLevel }">
					<slot name="item" :item="childItem" :level="childLevel" />
				</template>
			</BaseMegaMenuNode>
		</ul>
	</li>
</template>

<script setup lang="ts">
import '@components/BaseIcon/styles/BaseIcon.style.scss'
import '@components/BaseLink/styles/BaseLink.style.scss'
import '../styles/BaseMegaMenu.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { useBaseMegaMenuNode } from '../model/useBaseMegaMenuNode'
import type { BaseMegaMenuNodeEmits, BaseMegaMenuNodeProps, BaseMegaMenuNodeSlots } from '../types/BaseMegaMenuNode.types'

const props = defineProps<BaseMegaMenuNodeProps>()
const emit = defineEmits<BaseMegaMenuNodeEmits>()
defineSlots<BaseMegaMenuNodeSlots>()

const {
	nodePath,
	isOpen,
	hasChildren,
	isLink,
	anchorRef,
	panelRef,
	isFlyout,
	panelStyle,
	isFlipped,
	iconScale,
	handleLinkClick,
	handleClick,
	handleEnter,
	handleLeave,
} = useBaseMegaMenuNode(props, emit)
</script>
