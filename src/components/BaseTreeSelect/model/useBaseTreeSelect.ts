import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useTreeSelectKeys } from './useTreeSelectKeys'
import { useTreeSelectTree } from './useTreeSelectTree'
import { useTreeSelectField } from './useTreeSelectField'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseTreeSelectEmits, TreeSelectProps, TreeSelectRow } from '../types/BaseTreeSelect.types'

const TREE_SELECT_ELEMENTS = [
	'root',
	'dropdown',
	'label',
	'required',
	'trigger',
	'values',
	'tag',
	'tagText',
	'tagClose',
	'more',
	'placeholder',
	'valueText',
	'arrow',
	'errorText',
	'panel',
	'search',
	'searchInput',
	'tree',
	'node',
	'toggle',
	'checkbox',
	'icon',
	'nodeLabel',
	'status',
]

function useActiveRow(rows: ComputedRef<TreeSelectRow[]>, isOpen: Ref<boolean>, isSelected: (id: string) => boolean) {
	const activeId = ref<string | null>(null)
	const activeIndex = computed(() => rows.value.findIndex(({ node }) => node.id === activeId.value))
	const initialId = (): string | null => (rows.value.find(({ node }) => isSelected(node.id)) ?? rows.value[0])?.node.id ?? null

	watch(isOpen, value => (activeId.value = value ? initialId() : null), { flush: 'sync' })
	watch(rows, () => {
		if (isOpen.value && activeIndex.value === -1) activeId.value = rows.value[0]?.node.id ?? null
	})

	return {
		activeIndex,
		moveTo(index: number): void {
			const row = rows.value[index]
			if (row) activeId.value = row.node.id
		},
	}
}

function useTreeSelectActions(props: TreeSelectProps, model: ReturnType<typeof useTreeSelectTree>, isOpen: Ref<boolean>) {
	const { tree } = model
	return {
		selectRow({ node }: TreeSelectRow): void {
			if (node.isDisabled) return
			if (props.isMultiple) {
				tree.selectNode(node.id)
				return
			}
			model.emitValue(node.id)
			isOpen.value = false
		},
		toggleRow({ node, isExpanded }: TreeSelectRow): void {
			if (node.isDisabled || isExpanded !== tree.expandedSet.value.has(node.id)) return
			tree.toggleNode(node.id)
		},
		removeValue(id: string): void {
			if (tree.selectedSet.value.has(id)) tree.selectNode(id)
		},
	}
}

function useTreeSelectDisplay(props: TreeSelectProps, model: ReturnType<typeof useTreeSelectTree>, treeId: string) {
	const { valueNodes } = model
	return {
		ui: useUi(props, 'base-tree-select'),
		popupId: computed(() => (model.rows.value.length && !props.isLoading ? treeId : `${treeId}-panel`)),
		selectedNode: computed(() => (props.isMultiple ? undefined : valueNodes.value[0])),
		tagNodes: computed(() => (props.isMultiple ? valueNodes.value.slice(0, props.maxTagCount ?? valueNodes.value.length) : [])),
		moreCount: computed(() =>
			props.isMultiple && props.maxTagCount !== undefined ? Math.max(valueNodes.value.length - props.maxTagCount, 0) : 0,
		),
		resolvedPlaceholder: computed(() => props.placeholder ?? UI_TEXT.SELECT_PLACEHOLDER),
	}
}

export function useBaseTreeSelect(props: TreeSelectProps, emit: BaseTreeSelectEmits) {
	const standard = useStandardBaseComponent('base-tree-select', props, TREE_SELECT_ELEMENTS)
	const field = useTreeSelectField(props)
	const triggerRef = ref<HTMLDivElement | null>(null)
	const isOpen = ref(false)
	const searchQuery = ref('')
	const model = useTreeSelectTree(props, emit, searchQuery)
	const active = useActiveRow(model.rows, isOpen, id => model.tree.selectedSet.value.has(id))
	const actions = useTreeSelectActions(props, model, isOpen)
	const handleClose = (): void => field.formField.onBlur()
	const isDisabled = (): boolean => field.isControlDisabled.value
	const open = (): void => {
		isOpen.value = true
	}
	const close = (): void => {
		isOpen.value = false
		handleClose()
	}
	watch(isOpen, value => {
		if (!value) searchQuery.value = ''
	})

	return {
		...standard,
		...field,
		...useTreeSelectDisplay(props, model, field.treeId),
		...actions,
		triggerRef,
		isOpen,
		searchQuery,
		rows: model.rows,
		selectedSet: model.tree.selectedSet,
		indeterminateSet: model.tree.indeterminateSet,
		activeIndex: active.activeIndex,
		setActive: active.moveTo,
		handleClose,
		toggleDropdown(): void {
			if (!isDisabled()) isOpen.value = !isOpen.value
		},
		focusTrigger(): void {
			if (!isDisabled()) triggerRef.value?.focus()
		},
		...useTreeSelectKeys({ ...actions, ...active, rows: model.rows, isOpen, searchQuery, isDisabled, open, close }),
		exposed: {
			focus: () => triggerRef.value?.focus(),
			blur: () => triggerRef.value?.blur(),
			validate: field.formField.validate,
			reset: field.formField.reset,
		},
	}
}
