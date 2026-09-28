<template>
	<!--
		Дерево по образцу APG Tree View: один узел в порядке Tab (roving tabindex), стрелки вверх и вниз — по видимым
		узлам, вправо — раскрыть или к первому ребёнку, влево — свернуть или к родителю, Home/End, `*` — раскрыть соседей,
		буквы — поиск по началу подписи, Enter — действие узла (ссылка, выбор, раскрытие), Space — выбор.
	-->
	<div
		ref="rootRef"
		class="base-tree"
		:class="[variantClass, { 'base-tree--arrow-right': arrowPosition === 'right', 'base-tree--virtual': isVirtual }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, virtualStyle]"
		role="tree"
		:aria-label="ariaLabel"
		@keydown="handleKeydown">
		<!--
			Виртуальная прокрутка: плоский список видимых узлов, в DOM только видимые и запас. Узел в порядке Tab
			остаётся в DOM и вне видимой области; стрелки к неотрисованному узлу сначала прокручивают к нему
		-->
		<div v-if="isVirtual" class="base-tree__virtual" role="none" :style="{ height: `${totalSize}px` }">
			<div
				v-for="entry in virtualItems"
				:key="entry.key"
				:ref="element => measureElement(element, entry.index)"
				class="base-tree__row"
				role="none"
				:style="{ transform: `translateY(${entry.start}px)` }">
				<BaseTreeNode
					:node="visibleNodes[entry.index].node"
					:depth="visibleNodes[entry.index].depth"
					:set-size="visibleNodes[entry.index].setSize"
					:pos-in-set="visibleNodes[entry.index].posInSet"
					:size-scale="sizeScale"
					is-flat>
					<template #icon="slotProps"><slot name="icon" v-bind="slotProps" /></template>
					<template #arrow="slotProps"><slot name="arrow" v-bind="slotProps" /></template>
					<template #label="slotProps"><slot name="label" v-bind="slotProps" /></template>
					<template #actions="slotProps"><slot name="actions" v-bind="slotProps" /></template>
				</BaseTreeNode>
			</div>
		</div>
		<template v-else>
			<BaseTreeNode
				v-for="(node, index) in items"
				:key="node.id"
				:node="node"
				:depth="0"
				:set-size="items.length"
				:pos-in-set="index + 1"
				:size-scale="sizeScale">
				<template #icon="slotProps"><slot name="icon" v-bind="slotProps" /></template>
				<template #arrow="slotProps"><slot name="arrow" v-bind="slotProps" /></template>
				<template #label="slotProps"><slot name="label" v-bind="slotProps" /></template>
				<template #actions="slotProps"><slot name="actions" v-bind="slotProps" /></template>
			</BaseTreeNode>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, provide, ref, toRef } from 'vue'
import { findTypeaheadIndex } from '@utils/menuUtils'
import { kitDefaults } from '@composables/useDefaults'
import { useTreeState } from '@composables/useTreeState'
import { useVirtualList } from '@composables/useVirtualList'
import '../styles/BaseTree.style.scss'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import BaseTreeNode from './BaseTreeNode.vue'
import { TREE_CONTEXT_KEY } from '../model/BaseTree.types'
import type { BaseTreeEmits, BaseTreeProps, BaseTreeSlots, TreeNode } from '../model/BaseTree.types'

const props = withDefaults(
	defineProps<BaseTreeProps>(),
	kitDefaults('BaseTree', {
		variant: DEFAULT_VARIANT,
		selectionMode: 'none',
		arrowPosition: 'left',
		sizeScale: SIZE_SCALE_DEFAULT,
		isDefaultExpandAll: false,
		isVirtual: false,
		height: 400,
		itemSize: 36,
	}),
)

const emit = defineEmits<BaseTreeEmits>()
defineSlots<BaseTreeSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-tree', props, [
	'root',
	'node',
	'header',
	'arrow',
	'checkbox',
	'icon',
	'label',
	'actions',
	'children',
])

const { expandedIds, selectedIds, expandedSet, selectedSet, toggleNode, expandNodes, selectNode } = useTreeState({
	items: toRef(props, 'items'),
	selectionMode: toRef(props, 'selectionMode'),
	expandedIds: toRef(props, 'expandedIds'),
	selectedIds: toRef(props, 'selectedIds'),
	isDefaultExpandAll: toRef(props, 'isDefaultExpandAll'),
	emit,
})

/** Видимый узел: раскрыты все его предки. Уровень и позиция — для плоского списка виртуальной прокрутки */
interface VisibleNode {
	node: TreeNode
	parentId: string | null
	depth: number
	setSize: number
	posInSet: number
}

/** Видимые узлы сверху вниз — по ним ходят стрелки и поиск по буквам */
const visibleNodes = computed((): VisibleNode[] => {
	const result: VisibleNode[] = []
	const walk = (nodes: TreeNode[], parentId: string | null, depth: number): void => {
		nodes.forEach((node, index) => {
			result.push({ node, parentId, depth, setSize: nodes.length, posInSet: index + 1 })
			if (node.children?.length && expandedSet.value.has(node.id)) walk(node.children, node.id, depth + 1)
		})
	}
	walk(props.items ?? [], null, 0)
	return result
})

/** Узел, на котором стоит фокус (или стоял последним) */
const activeId = ref<string | null>(null)
const headers = new Map<string, HTMLElement>()

/** Узел в порядке Tab: последний с фокусом, иначе первый выбранный, иначе первый видимый */
const tabbableId = computed((): string | undefined => {
	const visible = visibleNodes.value
	if (activeId.value && visible.some(({ node }) => node.id === activeId.value)) return activeId.value
	return (visible.find(({ node }) => selectedSet.value.has(node.id)) ?? visible[0])?.node.id
})

/** Узел, на который перейдёт фокус, когда появится в DOM: виртуальная прокрутка сначала прокручивает к нему */
let pendingFocusId: string | null = null

function focusNode(id: string | undefined): void {
	if (!id) return
	const header = headers.get(id)
	if (header) header.focus()
	else if (props.isVirtual) {
		pendingFocusId = id
		scrollToIndex(visibleNodes.value.findIndex(({ node }) => node.id === id))
	}
}

function currentIndex(): number {
	return visibleNodes.value.findIndex(({ node }) => node.id === activeId.value)
}

/** Действие узла — как клик по заголовку: ссылка, выбор или раскрытие */
function activate(entry: VisibleNode): void {
	const header = headers.get(entry.node.id)
	const link = header?.querySelector<HTMLElement>('.base-tree__link')
	if (link && !entry.node.isDisabled) link.click()
	else header?.click()
}

let typeahead = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | null = null

function handleTypeahead(char: string): void {
	typeahead += char
	if (typeaheadTimer) clearTimeout(typeaheadTimer)
	typeaheadTimer = setTimeout(() => {
		typeahead = ''
		typeaheadTimer = null
	}, 500)
	const index = findTypeaheadIndex(
		visibleNodes.value.map(({ node }) => node.label),
		typeahead,
		currentIndex(),
	)
	if (index !== -1) focusNode(visibleNodes.value[index].node.id)
}

onBeforeUnmount(() => {
	if (typeaheadTimer) clearTimeout(typeaheadTimer)
})

function handleKeydown(event: KeyboardEvent): void {
	const visible = visibleNodes.value
	const index = currentIndex()
	const entry = visible[index]
	// Клавиши из полей и кнопок внутри узла (слот actions) дереву не нужны
	if (!entry || event.target !== headers.get(entry.node.id)) return

	const { node } = entry
	const hasChildren = Boolean(node.children?.length)
	const isExpanded = expandedSet.value.has(node.id)

	switch (event.key) {
		case 'ArrowDown':
			focusNode(visible[index + 1]?.node.id)
			break
		case 'ArrowUp':
			focusNode(visible[index - 1]?.node.id)
			break
		case 'Home':
			focusNode(visible[0].node.id)
			break
		case 'End':
			focusNode(visible[visible.length - 1].node.id)
			break
		case 'ArrowRight':
			if (!hasChildren) break
			if (!isExpanded) {
				if (!node.isDisabled) toggleNode(node.id)
			} else focusNode(node.children?.[0]?.id)
			break
		case 'ArrowLeft':
			if (hasChildren && isExpanded && !node.isDisabled) toggleNode(node.id)
			else focusNode(entry.parentId ?? undefined)
			break
		case '*':
			expandNodes(
				visible
					.filter(({ parentId, node: sibling }) => parentId === entry.parentId && sibling.children?.length && !sibling.isDisabled)
					.map(({ node: sibling }) => sibling.id),
			)
			break
		case 'Enter':
			activate(entry)
			break
		case ' ':
			if (typeahead) handleTypeahead(' ')
			else headers.get(node.id)?.click()
			break
		default:
			if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return
			handleTypeahead(event.key)
	}
	event.preventDefault()
}

// ─── Виртуальная прокрутка ─────────────────────────────────────────────────────

const rootRef = ref<HTMLElement | null>(null)

const virtualStyle = computed(() => {
	if (!props.isVirtual) return undefined
	return { height: typeof props.height === 'number' ? `${props.height}px` : props.height }
})

/** Узел в порядке Tab остаётся в DOM: иначе Tab проскочил бы дерево, а фокус терялся бы при прокрутке */
const tabbableIndex = computed(() => visibleNodes.value.findIndex(({ node }) => node.id === tabbableId.value))

const {
	items: virtualItems,
	totalSize,
	measureElement,
	scrollToIndex,
} = useVirtualList({
	count: () => (props.isVirtual ? visibleNodes.value.length : 0),
	estimateSize: () => props.itemSize,
	scrollElement: computed(() => (props.isVirtual ? rootRef.value : null)),
	getKey: index => visibleNodes.value[index].node.id,
	pinnedIndex: () => (tabbableIndex.value === -1 ? undefined : tabbableIndex.value),
})

provide(TREE_CONTEXT_KEY, {
	selectionMode: toRef(props, 'selectionMode'),
	arrowPosition: toRef(props, 'arrowPosition'),
	expandedIds,
	selectedIds,
	expandedSet,
	selectedSet,
	toggleNode,
	selectNode,
	classes: computed(function getClasses() {
		return classes.value
	}),
	tabIndexOf: (id: string) => (id === tabbableId.value ? 0 : -1),
	setActive: (id: string) => {
		activeId.value = id
	},
	registerHeader: (id: string, element: HTMLElement) => {
		headers.set(id, element)
		if (id !== pendingFocusId) return
		pendingFocusId = null
		// ref вызывается до вставки строки в документ: фокус — после отрисовки
		void nextTick(() => element.focus())
	},
	unregisterHeader: (id: string, element: HTMLElement) => {
		if (headers.get(id) === element) headers.delete(id)
	},
})
</script>
