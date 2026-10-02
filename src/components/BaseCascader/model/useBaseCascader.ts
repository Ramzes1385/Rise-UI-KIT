import { UI_TEXT } from '@/locales/messages'
import { computed, provide, ref, watch } from 'vue'
import { useCascaderField } from './useCascaderField'
import { useCascaderValue } from './useCascaderValue'
import { useCascaderSearch } from './useCascaderSearch'
import { useCascaderKeyboard } from './useCascaderKeyboard'
import { useCascaderLevels } from './levels/useCascaderLevels'
import { CASCADER_PANEL_KEY } from '../types/BaseCascader.types'
import { useCascaderNavigation } from './levels/useCascaderNavigation'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseCascaderEmits, BaseCascaderNode, CascaderPanelContext, CascaderPath, CascaderProps } from '../types/BaseCascader.types'

const CASCADER_ELEMENTS = [
	'root',
	'dropdown',
	'label',
	'required',
	'trigger',
	'values',
	'tag',
	'placeholder',
	'valueText',
	'arrow',
	'errorText',
	'panel',
	'search',
	'columns',
	'column',
	'option',
	'results',
	'status',
	'empty',
]

function useCascaderState(props: CascaderProps, emit: BaseCascaderEmits) {
	const levels = useCascaderLevels(props, emit)
	const nav = useCascaderNavigation(levels, () => Boolean(props.isLoading))
	const value = useCascaderValue(props, emit, levels)
	const search = useCascaderSearch(props, levels)
	const isSelectable = (node: BaseCascaderNode): boolean => !node.isDisabled && (Boolean(props.isAnyLevel) || !levels.hasChildren(node))
	const pathAt = (level: number, node: BaseCascaderNode): CascaderPath => [...nav.expandedPath.value.slice(0, level), node.id]
	return { levels, nav, value, search, isSelectable, pathAt }
}

function useCascaderActions(props: CascaderProps, state: ReturnType<typeof useCascaderState>, onBlur: () => void) {
	const { levels, nav, value, search } = state
	const isOpen = ref(false)

	function close(): void {
		isOpen.value = false
		search.searchQuery.value = ''
		onBlur()
	}

	function commit(path: CascaderPath, isFinal: boolean): void {
		value.commit(path)
		if (!props.isMultiple && isFinal) close()
	}

	function choose(level: number, node: BaseCascaderNode, isKeyboard: boolean): void {
		if (node.isDisabled) return
		const isSelectable = state.isSelectable(node)
		const hasChildren = levels.hasChildren(node)
		if (isSelectable) commit(state.pathAt(level, node), !hasChildren)
		if (hasChildren) void nav.expand(level, node, isKeyboard && !isSelectable)
	}

	watch(
		isOpen,
		open => {
			if (open) void nav.reveal(value.paths.value[value.paths.value.length - 1] ?? [])
		},
		{ flush: 'sync' },
	)

	return { isOpen, close, commit, choose }
}

function useCascaderKeys(
	state: ReturnType<typeof useCascaderState>,
	actions: ReturnType<typeof useCascaderActions>,
	isDisabled: () => boolean,
) {
	const { nav, search } = state
	return useCascaderKeyboard({
		isOpen: actions.isOpen,
		isDisabled,
		isSearching: () => search.isSearching.value,
		open: () => {
			actions.isOpen.value = true
		},
		close: actions.close,
		activate: () => {
			const node = nav.activeNode()
			if (node) actions.choose(nav.activeLevel.value, node, true)
		},
		move: nav.move,
		moveToEdge: nav.moveToEdge,
		forward: () => {
			const node = nav.activeNode()
			if (node && state.levels.hasChildren(node)) void nav.expand(nav.activeLevel.value, node, true)
		},
		back: nav.back,
		moveResult: search.moveResult,
		chooseResult: () => {
			const result = search.results.value[search.activeResult.value]
			if (result && !result.isDisabled) actions.commit(result.path, true)
		},
	})
}

function useCascaderIds(baseId: string) {
	return {
		optionId: (level: number, index: number): string => `${baseId}-option-${level}-${index}`,
		resultId: (index: number): string => `${baseId}-result-${index}`,
		columnId: (level: number): string => `${baseId}-level-${level}`,
		resultsId: `${baseId}-results`,
	}
}

function useTriggerAria(state: ReturnType<typeof useCascaderState>, isOpen: () => boolean, ids: ReturnType<typeof useCascaderIds>) {
	const { nav, search } = state
	return {
		activeDescendant: computed(() => {
			if (!isOpen()) return undefined
			if (search.isSearching.value) return search.activeResult.value >= 0 ? ids.resultId(search.activeResult.value) : undefined
			const index = nav.activeIndex()
			return index >= 0 ? ids.optionId(nav.activeLevel.value, index) : undefined
		}),
		controls: computed(() => {
			if (!isOpen()) return undefined
			if (search.isSearching.value) return ids.resultsId
			return nav.columns.value[nav.activeLevel.value]?.status === 'ready' ? ids.columnId(nav.activeLevel.value) : undefined
		}),
	}
}

function buildPanelContext(
	props: CascaderProps,
	base: { standard: ReturnType<typeof useStandardBaseComponent>; field: ReturnType<typeof useCascaderField> },
	core: {
		state: ReturnType<typeof useCascaderState>
		actions: ReturnType<typeof useCascaderActions>
		keys: ReturnType<typeof useCascaderKeys>
		ids: ReturnType<typeof useCascaderIds>
		aria: ReturnType<typeof useTriggerAria>
	},
): CascaderPanelContext {
	const { standard, field } = base
	const { state, actions, keys, ids, aria } = core
	const { nav, value, search } = state
	return {
		baseId: field.baseId,
		...ids,
		columns: nav.columns,
		expandedPath: nav.expandedPath,
		activeLevel: nav.activeLevel,
		activeId: nav.activeId,
		...search,
		separator: () => props.separator,
		isMultiple: () => Boolean(props.isMultiple),
		isSearchable: () => Boolean(props.isSearchable),
		sizeScale: () => props.sizeScale,
		sizeScaleStyle: standard.sizeScaleStyle,
		classes: standard.classes,
		rootLabelledBy: field.triggerLabelledBy,
		rootLabel: field.unlabelledName,
		hasChildren: state.levels.hasChildren,
		isSelectable: state.isSelectable,
		isNodeSelected: (level, node) => value.isPathSelected(state.pathAt(level, node)),
		isPathSelected: value.isPathSelected,
		clickNode: (level, node) => actions.choose(level, node, false),
		hoverNode: nav.hover,
		clickResult: result => {
			if (!result.isDisabled) actions.commit(result.path, true)
		},
		hoverResult: index => {
			if (!search.results.value[index]?.isDisabled) search.activeResult.value = index
		},
		retry: column => {
			if (column.parent) void nav.expand(column.level - 1, column.parent, true)
		},
		handleSearchKeydown: keys.handleSearchKeydown,
		...aria,
	}
}

export function useBaseCascader(props: CascaderProps, emit: BaseCascaderEmits) {
	const standard = useStandardBaseComponent('base-cascader', props, CASCADER_ELEMENTS)
	const field = useCascaderField(props)
	const state = useCascaderState(props, emit)
	const actions = useCascaderActions(props, state, field.formField.onBlur)
	const keys = useCascaderKeys(state, actions, () => field.isControlDisabled.value)
	const ids = useCascaderIds(field.baseId)
	const triggerRef = ref<HTMLDivElement | null>(null)
	const { value } = state
	const aria = useTriggerAria(state, () => actions.isOpen.value, ids)

	provide(CASCADER_PANEL_KEY, buildPanelContext(props, { standard, field }, { state, actions, keys, ids, aria }))

	return {
		...standard,
		...field,
		...value,
		isOpen: actions.isOpen,
		handleClose: actions.close,
		triggerRef,
		...aria,
		handleTriggerKeydown: keys.handleTriggerKeydown,
		resolvedPlaceholder: computed(() => props.placeholder ?? UI_TEXT.SELECT_PLACEHOLDER),
		hasTags: computed(() => value.tags.value.length > 0),
		toggle(): void {
			if (field.isControlDisabled.value) return
			if (actions.isOpen.value) actions.close()
			else actions.isOpen.value = true
		},
		focusTrigger(): void {
			if (!field.isControlDisabled.value) triggerRef.value?.focus()
		},
		exposed: {
			rootRef: triggerRef,
			focus: () => triggerRef.value?.focus(),
			blur: () => triggerRef.value?.blur(),
			validate: field.formField.validate,
			reset: field.formField.reset,
		},
	}
}
