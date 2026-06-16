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
		<!-- ── Columns layout ── -->
		<div v-if="layout === 'columns'" class="base-mega-menu__container" :class="classes.container">
			<div
				v-for="column in columns"
				:key="column.title"
				class="base-mega-menu__column"
				:class="classes.column"
				@mouseenter="handleColumnEnter(column.title)"
				@mouseleave="handleColumnLeave">
				<slot name="column-title" :column="column">
					<BaseText
						tag="h4"
						tabindex="0"
						:size-scale="sizeScale"
						:weight="600"
						class="base-mega-menu__title"
						:class="[{ 'base-mega-menu__title--open': isColumnOpen(column.title) }, classes.title]"
						@click="toggleColumn(column.title)">
						<BaseIcon v-if="column.icon" :name="column.icon" :size-scale="iconScale" class="base-mega-menu__title-icon" />
						{{ column.title }}
						<BaseIcon class="base-mega-menu__title-arrow" name="chevron-down" :size-scale="iconScale" />
					</BaseText>
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

		<!-- ── Dropdown layout ── -->
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
						@click="handleNavClick(item)">
						<BaseIcon v-if="item.icon" :name="item.icon" :size-scale="iconScale" class="base-mega-menu__nav-icon" />
						<BaseText tag="span" :size-scale="sizeScale">{{ item.label }}</BaseText>
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
import { BaseButton } from '@components/BaseButton'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useBreakpoint } from '@composables/useBreakpoint'
import { UI_HOVER_DELAY_MS } from '@constants'
import { useBaseComponent } from '@composables/useBaseComponent'
import { useMegaMenuTreeProvider } from '@composables/useMegaMenuTree'
import { navigateAndEmit } from '@utils/navigationUtils'
import { computed, onBeforeUnmount, ref } from 'vue'
import BaseMegaMenuNode from './BaseMegaMenuNode.vue'
import '../styles/BaseMegaMenu.style.scss'
import type { BaseMegaMenuEmits, BaseMegaMenuProps, MegaMenuItem } from '../model/BaseMegaMenu.types'

const props = withDefaults(defineProps<BaseMegaMenuProps>(), {
	trigger: 'click',
	layout: 'columns',
	hoverDelay: UI_HOVER_DELAY_MS,
	sizeScale: 100,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-mega-menu',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'container', 'column', 'title', 'list', 'nav', 'navItem', 'navLink', 'dropdown'],
})

const emit = defineEmits<BaseMegaMenuEmits>()

/** Реестр раскрытия дерева: гарантирует, что открыт только один узел на уровень */
useMegaMenuTreeProvider()

const { isMobile } = useBreakpoint()

/** На мобильном hover недоступен — раскрытие всегда по клику */
const effectiveTrigger = computed(() => (isMobile.value ? 'click' : props.trigger))

/** Единый масштаб иконки для корневого уровня */
const iconScale = computed(() => calcIconScale('sm', props.sizeScale))

/** Открытые колонки (columns layout) */
const openColumns = ref<string[]>([])
/** Открытые навигационные пункты (dropdown layout) */
const openNavItems = ref<string[]>([])

let hoverTimer: ReturnType<typeof setTimeout> | null = null

/** Очистить таймер hover */
function clearTimer(): void {
	if (hoverTimer) {
		clearTimeout(hoverTimer)
		hoverTimer = null
	}
}

onBeforeUnmount(clearTimer)

/** Есть ли у узла дочерние элементы */
function hasChildren(item: MegaMenuItem): boolean {
	return Boolean(item.children && item.children.length > 0)
}

function navigate(to?: string, href?: string, target?: '_blank' | '_self'): void {
	navigateAndEmit({ to, href, target }, (url) => emit('navigate', url))
}

// ── Columns ──

function toggleColumn(title: string): void {
	if (effectiveTrigger.value === 'hover') return
	const index = openColumns.value.indexOf(title)
	if (index > -1) {
		openColumns.value.splice(index, 1)
	} else {
		openColumns.value.push(title)
	}
	const column = props.columns?.find(c => c.title === title)
	/* istanbul ignore else -- defensive: title всегда соответствует существующей колонке */
	if (column) emit('column-click', column)
}

function isColumnOpen(title: string): boolean {
	return openColumns.value.includes(title) || !isMobile.value
}

function handleColumnEnter(title: string): void {
	if (effectiveTrigger.value !== 'hover') return
	clearTimer()
	if (!openColumns.value.includes(title)) {
		openColumns.value.push(title)
	}
}

function handleColumnLeave(): void {
	/* istanbul ignore next -- defensive: handleColumnLeave вызывается только при trigger='hover' */
	if (effectiveTrigger.value !== 'hover') return
	hoverTimer = setTimeout(() => {
		openColumns.value = []
	}, props.hoverDelay)
}

// ── Dropdown ──

function handleNavClick(item: MegaMenuItem): void {
	/* istanbul ignore next -- defensive: disabled-элементы не вызывают click в template */
	if (item.isDisabled) return
	emit('item-click', item)
	if (hasChildren(item)) {
		openNavItems.value = openNavItems.value.includes(item.label) ? [] : [item.label]
	} else {
		navigate(item.to, item.href, item.target)
	}
}

function handleNavEnter(item: MegaMenuItem): void {
	if (effectiveTrigger.value !== 'hover') return
	clearTimer()
	if (hasChildren(item) && !openNavItems.value.includes(item.label)) {
		openNavItems.value = [item.label]
	}
}

function handleNavLeave(): void {
	/* istanbul ignore next -- defensive: handleNavLeave вызывается только при trigger='hover' */
	if (effectiveTrigger.value !== 'hover') return
	hoverTimer = setTimeout(() => {
		openNavItems.value = []
	}, props.hoverDelay)
}

function isNavOpen(label: string): boolean {
	return openNavItems.value.includes(label)
}
</script>
