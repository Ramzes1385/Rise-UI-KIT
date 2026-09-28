import type { ComputedRef } from 'vue'
/** Composable: логика BaseTreeNode — узел дерева: заголовок для фокуса, раскрытие, выбор и переход по ссылке */
import { computed, inject, ref, useId, watch } from 'vue'
import { TREE_CONTEXT_KEY } from '../types/BaseTree.types'
import type { TreeContext } from '../types/BaseTree.types'
import type { BaseTreeNodeProps } from '../types/BaseTreeNode.types'

function getTreeContext(): TreeContext {
	const context = inject(TREE_CONTEXT_KEY, undefined)
	/* istanbul ignore if -- defensive: BaseTreeNode всегда рендерится внутри BaseTree, контекст предоставляется родителем */
	if (!context) {
		throw new Error('BaseTreeNode: TreeContext not found. Ensure BaseTreeNode is rendered inside BaseTree.')
	}
	return context
}

/** Заголовок регистрируется в дереве: на него дерево переводит фокус стрелками и поиском по буквам */
function useHeaderRegistration(props: BaseTreeNodeProps, treeContext: TreeContext) {
	// Текущий элемент заголовка — чтобы снять именно его регистрацию при размонтировании
	let headerElement: HTMLElement | null = null
	return {
		getHeader: (): HTMLElement | null => headerElement,
		setHeaderElement(element: unknown): void {
			if (element instanceof HTMLElement) {
				headerElement = element
				treeContext.registerHeader(props.node.id, element)
			} else if (headerElement) {
				treeContext.unregisterHeader(props.node.id, headerElement)
				headerElement = null
			}
		},
	}
}

function useNodeState(props: BaseTreeNodeProps, treeContext: TreeContext) {
	const hasChildren = computed(() => Boolean(props.node.children?.length))
	const isExpanded = computed(() => treeContext.expandedSet.value.has(props.node.id))
	const isSelected = computed(() => treeContext.selectedSet.value.has(props.node.id))
	// Узел был раскрыт хотя бы раз — для ленивого рендеринга детей
	const wasExpanded = ref(isExpanded.value)
	watch(isExpanded, expanded => {
		if (expanded && !wasExpanded.value) wasExpanded.value = true
	})

	return {
		hasChildren,
		isExpanded,
		isSelected,
		wasExpanded,
		// Дочерние узлы рендерятся только при hasChildren, поэтому список всегда непустой
		childNodes: computed(() => {
			/* istanbul ignore next -- defensive: childNodes читается только при hasChildren=true */
			return props.node.children ?? []
		}),
		// 0 — узел в порядке Tab, −1 — нет. Computed: при переходе стрелкой перерисовываются только два узла
		tabIndex: computed(() => treeContext.tabIndexOf(props.node.id)),
		nodeClasses: computed(() => ({
			'base-tree__node--expanded': isExpanded.value,
			'base-tree__node--selected': isSelected.value,
			'base-tree__node--disabled': props.node.isDisabled,
			'base-tree__node--leaf': !hasChildren.value,
			'base-tree__node--flat': props.isFlat,
		})),
	}
}

function useNodeHandlers(
	props: BaseTreeNodeProps,
	treeContext: TreeContext,
	state: { hasChildren: ComputedRef<boolean>; isSelected: ComputedRef<boolean>; getHeader: () => HTMLElement | null },
) {
	return {
		/** Клик по стрелке — только раскрытие/скрытие */
		handleArrowClick(): void {
			if (props.node.isDisabled) return
			treeContext.toggleNode(props.node.id)
		},
		/** Нажатие мышью на ссылку: фокус остаётся на узле (treeitem), иначе стрелки перестали бы работать */
		handleLinkMousedown(event: MouseEvent): void {
			if (event.button !== 0) return
			event.preventDefault()
			state.getHeader()?.focus()
		},
		/**
		 * Переход по ссылке узла (клик или Enter). Раскрытие не меняется — для него стрелка; в режиме single узел
		 * становится выбранным (текущая страница), повторный переход выбор не снимает
		 */
		handleLinkClick(event: MouseEvent): void {
			event.stopPropagation()
			if (treeContext.selectionMode.value === 'single' && !state.isSelected.value) treeContext.selectNode(props.node.id)
		},
		handleHeaderClick(): void {
			if (props.node.isDisabled) return
			if (treeContext.selectionMode.value !== 'none') {
				treeContext.selectNode(props.node.id)
				return
			}
			if (state.hasChildren.value) treeContext.toggleNode(props.node.id)
		},
	}
}

export function useBaseTreeNode(props: BaseTreeNodeProps) {
	const treeContext = getTreeContext()
	const labelId = `rise-tree-${useId()}-label`
	const header = useHeaderRegistration(props, treeContext)
	const state = useNodeState(props, treeContext)

	return {
		treeContext,
		labelId,
		setHeaderElement: header.setHeaderElement,
		...state,
		// Пользовательский класс checkbox — на корень, подпись скрыта визуально. Флажок скрыт от скринридера (отметку
		// объявляет aria-checked узла); подпись оставлена, чтобы поле не было безымянным
		checkboxClasses: computed(() => ({ root: treeContext.classes.value.checkbox, label: 'base-tree__visually-hidden' })),
		...useNodeHandlers(props, treeContext, { ...state, getHeader: header.getHeader }),
	}
}
