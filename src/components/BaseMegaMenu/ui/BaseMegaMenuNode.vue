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
			<div ref="anchorRef" class="base-mega-menu__node-header" @click.stop="handleClick">
				<BaseIcon
					v-if="item.icon"
					:name="item.icon"
					:size-scale="iconScale"
					class="base-mega-menu__node-icon" />
				<span class="base-mega-menu__node-label">{{ item.label }}</span>
				<BaseIcon
					v-if="hasChildren"
					name="chevron-right"
					:size-scale="iconScale"
					class="base-mega-menu__node-arrow" />
			</div>
		</slot>

		<BaseText
			v-if="item.description"
			tag="p"
			:size-scale="sizeScale"
			:color="{ text: { base: 'var(--color-text-muted)' } }"
			class="base-mega-menu__node-desc">
			{{ item.description }}
		</BaseText>

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
import { computed, onBeforeUnmount, ref } from 'vue'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useFlyoutPosition } from '@composables/useFlyoutPosition'
import { MEGA_MENU_PATH_SEPARATOR, useMegaMenuTree } from '@composables/useMegaMenuTree'
import { navigateAndEmit } from '@utils/navigationUtils'
import '../styles/BaseMegaMenu.style.scss'
import type { MegaMenuItem } from '../model/BaseMegaMenu.types'
import type { BaseMegaMenuNodeEmits, BaseMegaMenuNodeProps } from '../model/BaseMegaMenuNode.types'

const props = defineProps<BaseMegaMenuNodeProps>()
const emit = defineEmits<BaseMegaMenuNodeEmits>()
defineSlots<{ item?: (props: { item: MegaMenuItem; level: number }) => unknown }>()

/** Реестр дерева: открыт только один узел на уровень во всей ветви */
const tree = useMegaMenuTree()
/** Уникальный путь узла = путь родителя + его label */
const nodePath = computed(() => `${props.parentPath}${MEGA_MENU_PATH_SEPARATOR}${props.item.label}`)
/** Открыт ли узел (его путь — на активной ветви дерева) */
const isOpen = computed(() => tree.isPathOpen(nodePath.value))
/** Якорь для каскадного flyout (шапка узла) — задаёт вертикальное выравнивание */
const anchorRef = ref<HTMLElement | null>(null)
/** Панель-контейнер узла — flyout встаёт встык к её краю, без наезда */
const boundaryRef = ref<HTMLElement | null>(null)
/** Сама flyout-панель (sub-list) */
const panelRef = ref<HTMLElement | null>(null)
/** Есть ли дочерние узлы */
const hasChildren = computed(() => Boolean(props.item.children && props.item.children.length > 0))

/**
 * Каскадный flyout — только в dropdown-layout на десктопе.
 * В columns узлы стоят в середине широкой панели, поэтому боковой flyout
 * накладывался бы на меню — там вложенные уровни раскрываются аккордеоном вниз.
 */
const isFlyout = computed(() => props.layout === 'dropdown' && !props.isMobile)

/** Каскадное позиционирование flyout-панели (только в dropdown-режиме) */
const { panelStyle, isFlipped } = useFlyoutPosition({
	anchorRef,
	panelRef,
	boundaryRef,
	isOpen: () => isOpen.value && isFlyout.value,
})

/** Запомнить панель-контейнер, в которой лежит узел (для расчёта flyout встык) */
function updateBoundary(): void {
	boundaryRef.value = anchorRef.value?.closest('.base-mega-menu__sub-list, .base-mega-menu__dropdown') ?? null
}
/** Единый масштаб иконки для всех уровней */
const iconScale = computed(() => calcIconScale('sm', props.sizeScale))

let hoverTimer: ReturnType<typeof setTimeout> | null = null

/** Очистить таймер hover */
function clearTimer(): void {
	if (hoverTimer) {
		clearTimeout(hoverTimer)
		hoverTimer = null
	}
}

onBeforeUnmount(clearTimer)

function navigate(): void {
	const { to, href, target } = props.item
	navigateAndEmit({ to, href, target }, (url) => emit('navigate', url))
}

/** Клик по узлу: раскрытие (закрывая соседей) или навигация */
function handleClick(): void {
	if (props.item.isDisabled) return
	emit('item-click', props.item)
	if (hasChildren.value) {
		if (isOpen.value) {
			tree.close(nodePath.value)
		} else {
			updateBoundary()
			tree.open(nodePath.value)
		}
	} else {
		navigate()
	}
}

/** Наведение: раскрытие при trigger=hover (закрывая соседей) */
function handleEnter(): void {
	if (props.trigger !== 'hover' || !hasChildren.value) return
	clearTimer()
	updateBoundary()
	tree.open(nodePath.value)
}

/** Уход курсора: закрытие с задержкой при trigger=hover */
function handleLeave(): void {
	if (props.trigger !== 'hover' || !hasChildren.value) return
	hoverTimer = setTimeout(() => {
		tree.close(nodePath.value)
	}, props.hoverDelay)
}
</script>
