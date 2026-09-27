<template>
	<!--
		Дерево по образцу APG Tree View: один узел в порядке Tab (roving tabindex), стрелки вверх и вниз — по видимым
		узлам, вправо — раскрыть или к первому ребёнку, влево — свернуть или к родителю, Home/End, `*` — раскрыть соседей,
		буквы — поиск по началу подписи, Enter — действие узла (ссылка, выбор, раскрытие), Space — выбор.
	-->
	<div
		class="base-tree"
		:class="[variantClass, { 'base-tree--arrow-right': arrowPosition === 'right' }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="tree"
		:aria-label="ariaLabel"
		@keydown="handleKeydown">
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
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, provide, ref, toRef } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useTreeState } from '@composables/useTreeState'
import '../styles/BaseTree.style.scss'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@constants'
import { findTypeaheadIndex } from '@utils/menuUtils'
import { TREE_CONTEXT_KEY } from '../model/BaseTree.types'
import BaseTreeNode from './BaseTreeNode.vue'
import type { BaseTreeEmits, BaseTreeProps, BaseTreeSlots, TreeNode } from '../model/BaseTree.types'

const props = withDefaults(defineProps<BaseTreeProps>(), kitDefaults('BaseTree', {
	variant: DEFAULT_VARIANT,
	selectionMode: 'none',
	arrowPosition: 'left',
	sizeScale: SIZE_SCALE_DEFAULT,
	isDefaultExpandAll: false,
}))

const emit = defineEmits<BaseTreeEmits>()
defineSlots<BaseTreeSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent(
	'base-tree',
	props,
	['root', 'node', 'header', 'arrow', 'checkbox', 'icon', 'label', 'actions', 'children'],
)

const { expandedIds, selectedIds, expandedSet, selectedSet, toggleNode, expandNodes, selectNode } = useTreeState({
	items: toRef(props, 'items'),
	selectionMode: toRef(props, 'selectionMode'),
	expandedIds: toRef(props, 'expandedIds'),
	selectedIds: toRef(props, 'selectedIds'),
	isDefaultExpandAll: toRef(props, 'isDefaultExpandAll'),
	emit,
})

/** Видимый узел: раскрыты все его предки */
interface VisibleNode {
	node: TreeNode
	parentId: string | null
}

/** Видимые узлы сверху вниз — по ним ходят стрелки и поиск по буквам */
const visibleNodes = computed((): VisibleNode[] => {
	const result: VisibleNode[] = []
	const walk = (nodes: TreeNode[], parentId: string | null): void => {
		for (const node of nodes) {
			result.push({ node, parentId })
			if (node.children?.length && expandedSet.value.has(node.id)) walk(node.children, node.id)
		}
	}
	walk(props.items ?? [], null)
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

function focusNode(id: string | undefined): void {
	if (id) headers.get(id)?.focus()
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
			expandNodes(visible.filter(({ parentId, node: sibling }) => parentId === entry.parentId && sibling.children?.length && !sibling.isDisabled).map(({ node: sibling }) => sibling.id))
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
	},
	unregisterHeader: (id: string, element: HTMLElement) => {
		if (headers.get(id) === element) headers.delete(id)
	},
})
</script>
