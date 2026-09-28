<template>
	<div
		class="base-tree__node"
		:class="[nodeClasses, treeContext.classes.value.node]"
		:style="isFlat ? { '--base-tree-depth': depth } : undefined"
		role="none">
		<!-- Заголовок — treeitem: уровень, позиция, раскрытие и выбор; фокус и клавиши — у корня дерева -->
		<div
			:ref="setHeaderElement"
			class="base-tree__header"
			:class="treeContext.classes.value.header"
			role="treeitem"
			:tabindex="tabIndex"
			:aria-labelledby="labelId"
			:aria-level="depth + 1"
			:aria-setsize="setSize"
			:aria-posinset="posInSet"
			:aria-expanded="hasChildren ? isExpanded : undefined"
			:aria-selected="treeContext.selectionMode.value === 'single' && isSelected ? true : undefined"
			:aria-checked="treeContext.selectionMode.value === 'multiple' ? isSelected : undefined"
			:aria-disabled="node.isDisabled ? 'true' : undefined"
			@click="handleHeaderClick"
			@focus="treeContext.setActive(node.id)">
			<span
				v-if="treeContext.arrowPosition.value === 'left'"
				class="base-tree__arrow"
				:class="[{ 'base-tree__arrow--expanded': isExpanded }, treeContext.classes.value.arrow]"
				aria-hidden="true"
				@click.stop="handleArrowClick">
				<slot name="arrow" :node="node" :is-expanded="isExpanded">
					<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', sizeScale)" />
				</slot>
			</span>
			<!--
				Флажок — только вид: отметку объявляет aria-checked узла, клик по флажку — клик по узлу.
				inert убирает его из порядка Tab и дерева доступности, указатель проходит сквозь него к заголовку
			-->
			<span v-if="treeContext.selectionMode.value === 'multiple'" class="base-tree__checkbox-wrap" aria-hidden="true" inert>
				<BaseCheckbox
					class="base-tree__checkbox"
					:custom-class="checkboxClasses"
					:model-value="isSelected"
					:label="node.label"
					:is-disabled="node.isDisabled"
					:size-scale="sizeScale" />
			</span>
			<slot name="icon" :node="node">
				<BaseIcon
					v-if="node.icon"
					:name="node.icon"
					class="base-tree__icon"
					:custom-class="treeContext.classes.value.icon"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</slot>
			<!-- Имя узла — только подпись: кнопки слота actions в имя не попадают -->
			<span :id="labelId" class="base-tree__label" :class="treeContext.classes.value.label">
				<slot name="label" :node="node" :depth="depth" :is-selected="isSelected" :is-expanded="isExpanded">
					<!-- Узел с адресом — ссылка (BaseLink): клик и Enter переходят по ней, фокус остаётся у узла -->
					<BaseLink
						v-if="(node.to || node.href) && !node.isDisabled"
						class="base-tree__link"
						variant="ghost"
						tabindex="-1"
						:to="node.to"
						:href="node.href"
						:target="node.target"
						@mousedown="handleLinkMousedown"
						@click="handleLinkClick">
						{{ node.label }}
					</BaseLink>
					<template v-else>{{ node.label }}</template>
				</slot>
			</span>
			<span
				v-if="treeContext.arrowPosition.value === 'right'"
				class="base-tree__arrow base-tree__arrow--right"
				:class="[{ 'base-tree__arrow--expanded': isExpanded }, treeContext.classes.value.arrow]"
				aria-hidden="true"
				@click.stop="handleArrowClick">
				<slot name="arrow" :node="node" :is-expanded="isExpanded">
					<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', sizeScale)" />
				</slot>
			</span>
			<div class="base-tree__actions" :class="treeContext.classes.value.actions">
				<slot name="actions" :node="node" />
			</div>
		</div>
		<BaseTreeChildren
			v-if="hasChildren && !isFlat"
			:children="childNodes"
			:depth="depth + 1"
			:size-scale="sizeScale"
			:is-expanded="isExpanded"
			:was-expanded="wasExpanded">
			<template #icon="slotProps">
				<slot name="icon" :node="slotProps.node" />
			</template>
			<template #arrow="slotProps">
				<slot name="arrow" :node="slotProps.node" :is-expanded="slotProps.isExpanded" />
			</template>
			<template #label="slotProps">
				<slot
					name="label"
					:node="slotProps.node"
					:depth="slotProps.depth"
					:is-selected="slotProps.isSelected"
					:is-expanded="slotProps.isExpanded" />
			</template>
			<template #actions="slotProps">
				<slot name="actions" :node="slotProps.node" />
			</template>
		</BaseTreeChildren>
	</div>
</template>

<script setup lang="ts">
import { computed, inject, ref, useId, watch } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { calcIconScale } from '@utils/iconUtils'
import { BaseCheckbox } from '@components/BaseCheckbox'
import BaseTreeChildren from './BaseTreeChildren.vue'
import { TREE_CONTEXT_KEY } from '../model/BaseTree.types'
import type { TreeContext } from '../model/BaseTree.types'
import type { BaseTreeNodeProps, BaseTreeNodeSlots } from '../model/BaseTreeNode.types'
import '../styles/BaseTree.style.scss'

const props = defineProps<BaseTreeNodeProps>()
defineSlots<BaseTreeNodeSlots>()

const treeContext = getTreeContext()

function getTreeContext(): TreeContext {
	const context = inject(TREE_CONTEXT_KEY, undefined)
	/* istanbul ignore if -- defensive: BaseTreeNode всегда рендерится внутри BaseTree, контекст предоставляется родителем */
	if (!context) {
		throw new Error('BaseTreeNode: TreeContext not found. Ensure BaseTreeNode is rendered inside BaseTree.')
	}
	return context
}

const labelId = `rise-tree-${useId()}-label`

/** Текущий элемент заголовка — чтобы снять именно его регистрацию при размонтировании */
let headerElement: HTMLElement | null = null

/** Заголовок регистрируется в дереве: на него дерево переводит фокус стрелками и поиском по буквам */
function setHeaderElement(element: unknown): void {
	if (element instanceof HTMLElement) {
		headerElement = element
		treeContext.registerHeader(props.node.id, element)
	} else if (headerElement) {
		treeContext.unregisterHeader(props.node.id, headerElement)
		headerElement = null
	}
}

const hasChildren = computed(function getHasChildren() {
	return Boolean(props.node.children?.length)
})

/** Дочерние узлы для рендера — рендерится только при hasChildren, поэтому всегда непустой. */
const childNodes = computed(function getChildNodes() {
	/* istanbul ignore next -- defensive: childNodes читается только при hasChildren=true */
	return props.node.children ?? []
})

const isExpanded = computed(function getIsExpanded() {
	return treeContext.expandedSet.value.has(props.node.id)
})

const isSelected = computed(function getIsSelected() {
	return treeContext.selectedSet.value.has(props.node.id)
})

/** 0 — узел в порядке Tab, −1 — нет. Computed: при переходе стрелкой перерисовываются только два узла */
const tabIndex = computed(function getTabIndex() {
	return treeContext.tabIndexOf(props.node.id)
})

/**
 * Классы чекбокса: пользовательский класс checkbox — на корень, подпись скрыта визуально.
 * Флажок скрыт от скринридера (отметку объявляет aria-checked узла); подпись оставлена, чтобы поле не было безымянным.
 */
const checkboxClasses = computed(function getCheckboxClasses() {
	return { root: treeContext.classes.value.checkbox, label: 'base-tree__visually-hidden' }
})

/** Узел был раскрыт хотя бы раз — для ленивого рендеринга детей */
const wasExpanded = ref(isExpanded.value)

/** Запомнить что узел раскрывался */
watch(isExpanded, function handleExpandedWatch(expanded) {
	if (expanded && !wasExpanded.value) {
		wasExpanded.value = true
	}
})

const nodeClasses = computed(function getNodeClasses() {
	return {
		'base-tree__node--expanded': isExpanded.value,
		'base-tree__node--selected': isSelected.value,
		'base-tree__node--disabled': props.node.isDisabled,
		'base-tree__node--leaf': !hasChildren.value,
		'base-tree__node--flat': props.isFlat,
	}
})

/** Клик по стрелке — только раскрытие/скрытие */
function handleArrowClick(): void {
	if (props.node.isDisabled) {
		return
	}
	treeContext.toggleNode(props.node.id)
}

/** Нажатие мышью на ссылку: фокус остаётся на узле (treeitem), иначе стрелки перестали бы работать */
function handleLinkMousedown(event: MouseEvent): void {
	if (event.button !== 0) return
	event.preventDefault()
	headerElement?.focus()
}

/**
 * Переход по ссылке узла (клик или Enter). Раскрытие не меняется — для него стрелка; в режиме single узел
 * становится выбранным (текущая страница), повторный переход выбор не снимает.
 */
function handleLinkClick(event: MouseEvent): void {
	event.stopPropagation()
	if (treeContext.selectionMode.value === 'single' && !isSelected.value) treeContext.selectNode(props.node.id)
}

/** Клик по заголовку узла */
function handleHeaderClick(): void {
	if (props.node.isDisabled) {
		return
	}
	const mode = treeContext.selectionMode.value

	if (mode === 'none') {
		if (hasChildren.value) {
			treeContext.toggleNode(props.node.id)
		}
		return
	}

	treeContext.selectNode(props.node.id)
}
</script>
