import { computed, ref, watch } from 'vue'
import { findEnabled } from './cascaderTree'
import type {
	BaseCascaderNode,
	CascaderColumn,
	CascaderColumnStatus,
	CascaderLevels,
	CascaderNavigation,
	CascaderPath,
} from '../../types/BaseCascader.types'

function columnStatus(levels: CascaderLevels, id: string): CascaderColumnStatus {
	if (levels.isLoadingNode(id)) return 'loading'
	return levels.hasErrorNode(id) ? 'error' : 'ready'
}

function buildColumns(levels: CascaderLevels, expandedPath: string[], isRootLoading: boolean): CascaderColumn[] {
	const columns: CascaderColumn[] = [{ level: 0, nodes: levels.roots.value, status: isRootLoading ? 'loading' : 'ready' }]
	for (const id of expandedPath) {
		const parent = levels.index.value.nodes.get(id)
		if (!parent) break
		const status = columnStatus(levels, id)
		columns.push({ level: columns.length, parent, nodes: status === 'ready' ? levels.childrenOf(parent) : [], status })
	}
	return columns
}

function useNavState(levels: CascaderLevels, isRootLoading: () => boolean) {
	const expandedPath = ref<string[]>([])
	const activeLevel = ref(0)
	const activeId = ref<string | null>(null)
	const columns = computed(() => buildColumns(levels, expandedPath.value, isRootLoading()))
	const columnAt = (level: number): BaseCascaderNode[] => columns.value[level]?.nodes ?? []
	const activeIndex = (): number => columnAt(activeLevel.value).findIndex(node => node.id === activeId.value)

	return {
		nav: { expandedPath, activeLevel, activeId, columns } satisfies CascaderNavigation,
		columnAt,
		activeIndex,
		activateAt(level: number, position: number): void {
			if (position < 0) return
			activeLevel.value = level
			activeId.value = columnAt(level)[position].id
		},
		focusFirst(level: number): void {
			activeLevel.value = level
			activeId.value = columnAt(level)[findEnabled(columnAt(level), 0, 1)]?.id ?? null
		},
	}
}

function useNavMoves(state: ReturnType<typeof useNavState>) {
	const { nav, columnAt, activeIndex, activateAt } = state
	const collapseBelowActive = (): void => {
		nav.expandedPath.value = nav.expandedPath.value.slice(0, nav.activeLevel.value)
	}

	return {
		move(step: 1 | -1): void {
			const nodes = columnAt(nav.activeLevel.value)
			const current = activeIndex()
			const edge = step === 1 ? 0 : nodes.length - 1
			const position = findEnabled(nodes, current === -1 ? edge : current + step, step)
			if (position === -1) return
			collapseBelowActive()
			activateAt(nav.activeLevel.value, position)
		},
		moveToEdge(edge: 'first' | 'last'): void {
			const nodes = columnAt(nav.activeLevel.value)
			collapseBelowActive()
			activateAt(nav.activeLevel.value, edge === 'first' ? findEnabled(nodes, 0, 1) : findEnabled(nodes, nodes.length - 1, -1))
		},
		back(): void {
			if (nav.activeLevel.value === 0) return
			nav.activeLevel.value -= 1
			nav.activeId.value = nav.expandedPath.value[nav.activeLevel.value]
		},
		hover(level: number, node: BaseCascaderNode): void {
			activateAt(
				level,
				columnAt(level).findIndex(item => item.id === node.id),
			)
		},
	}
}

export function useCascaderNavigation(levels: CascaderLevels, isRootLoading: () => boolean) {
	const state = useNavState(levels, isRootLoading)
	const { nav, columnAt, activateAt, focusFirst } = state

	watch(nav.columns, () => {
		if (nav.activeLevel.value >= nav.columns.value.length) focusFirst(nav.columns.value.length - 1)
		else if (state.activeIndex() === -1) focusFirst(nav.activeLevel.value)
	})

	async function expand(level: number, node: BaseCascaderNode, isMovingInto: boolean): Promise<void> {
		nav.expandedPath.value = [...nav.expandedPath.value.slice(0, level), node.id]
		activateAt(
			level,
			columnAt(level).findIndex(item => item.id === node.id),
		)
		const isReady = await levels.ensureChildren(node)
		const isStillActive = nav.activeId.value === node.id && nav.expandedPath.value[level] === node.id
		if (isReady && isMovingInto && isStillActive) focusFirst(level + 1)
	}

	async function reveal(path: CascaderPath): Promise<void> {
		nav.expandedPath.value = []
		focusFirst(0)
		for (let level = 0; level < path.length; level++) {
			const position = columnAt(level).findIndex(node => node.id === path[level])
			if (position === -1) return
			activateAt(level, position)
			const node = columnAt(level)[position]
			if (level === path.length - 1 || !levels.hasChildren(node)) return
			await expand(level, node, false)
			if (nav.expandedPath.value.length !== level + 1) return
		}
	}

	return {
		...nav,
		activeNode: (): BaseCascaderNode | undefined => columnAt(nav.activeLevel.value)[state.activeIndex()],
		activeIndex: state.activeIndex,
		expand,
		reveal,
		...useNavMoves(state),
	}
}
