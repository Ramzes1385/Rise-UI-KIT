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
			<!-- Лист с адресом — ссылка (BaseLink): RouterLink приложения или <a href>, открывается и в новой вкладке -->
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
			<!-- Узел без адреса — кнопка: раскрывает вложенный уровень (Enter/Space — как клик) -->
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
import { computed, onBeforeUnmount, ref } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { calcIconScale } from '@utils/iconUtils'
import { useFlyoutPosition } from '@composables/useFlyoutPosition'
import { MEGA_MENU_PATH_SEPARATOR, useMegaMenuTree } from '@composables/useMegaMenuTree'
import '../styles/BaseMegaMenu.style.scss'
import type { BaseMegaMenuNodeEmits, BaseMegaMenuNodeProps, BaseMegaMenuNodeSlots } from '../types/BaseMegaMenuNode.types'

const props = defineProps<BaseMegaMenuNodeProps>()
const emit = defineEmits<BaseMegaMenuNodeEmits>()
defineSlots<BaseMegaMenuNodeSlots>()

/** Реестр дерева: открыт только один узел на уровень во всей ветви */
const tree = useMegaMenuTree()
const nodePath = computed(() => `${props.parentPath}${MEGA_MENU_PATH_SEPARATOR}${props.item.label}`)
const isOpen = computed(() => tree.isPathOpen(nodePath.value))
/** Якорь для каскадного flyout (шапка узла) — задаёт вертикальное выравнивание */
const anchorRef = ref<HTMLElement | null>(null)
/** Панель-контейнер узла — flyout встаёт встык к её краю, без наезда */
const boundaryRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const hasChildren = computed(() => Boolean(props.item.children && props.item.children.length > 0))
/** Лист с адресом — ссылка, переход выполняет она сама */
const isLink = computed(() => !hasChildren.value && Boolean(props.item.to || props.item.href))

/**
 * Каскадный flyout — только в dropdown-layout на десктопе.
 * В columns узлы стоят в середине широкой панели, поэтому боковой flyout
 * накладывался бы на меню — там вложенные уровни раскрываются аккордеоном вниз.
 */
const isFlyout = computed(() => props.layout === 'dropdown' && !props.isMobile)

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

function clearTimer(): void {
	if (hoverTimer) {
		clearTimeout(hoverTimer)
		hoverTimer = null
	}
}

onBeforeUnmount(clearTimer)

/** Клик по ссылке: переход выполняет BaseLink, компонент сообщает о нём событиями */
function handleLinkClick(): void {
	emit('item-click', props.item)
	emit('navigate', (props.item.href ?? props.item.to) as string)
}

/** Клик по узлу: раскрытие вложенного уровня (закрывая соседей); у листа без адреса — только item-click */
function handleClick(): void {
	if (props.item.isDisabled) return
	emit('item-click', props.item)
	if (!hasChildren.value) return
	if (isOpen.value) {
		tree.close(nodePath.value)
	} else {
		updateBoundary()
		tree.open(nodePath.value)
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
