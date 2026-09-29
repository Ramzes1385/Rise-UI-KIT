import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import { useHoverTimer } from './useHoverTimer'
import { calcIconScale } from '@utils/media/iconUtils'
import { useFlyoutPosition } from '@composables/overlay/useFlyoutPosition'
import type { BaseMegaMenuNodeEmits, BaseMegaMenuNodeProps } from '../types/BaseMegaMenuNode.types'
import { MEGA_MENU_PATH_SEPARATOR, useMegaMenuTree } from '@composables/navigation/useMegaMenuTree'

function useNodeFlyout(props: BaseMegaMenuNodeProps, isOpen: ComputedRef<boolean>) {
	const anchorRef = ref<HTMLElement | null>(null)
	const boundaryRef = ref<HTMLElement | null>(null)
	const panelRef = ref<HTMLElement | null>(null)
	const isFlyout = computed(() => props.layout === 'dropdown' && !props.isMobile)
	const { panelStyle, isFlipped } = useFlyoutPosition({ anchorRef, panelRef, boundaryRef, isOpen: () => isOpen.value && isFlyout.value })

	return {
		anchorRef,
		panelRef,
		isFlyout,
		panelStyle,
		isFlipped,
		updateBoundary(): void {
			boundaryRef.value = anchorRef.value?.closest('.base-mega-menu__sub-list, .base-mega-menu__dropdown') ?? null
		},
	}
}

function useNodeHandlers(
	props: BaseMegaMenuNodeProps,
	emit: BaseMegaMenuNodeEmits,
	node: {
		tree: ReturnType<typeof useMegaMenuTree>
		path: ComputedRef<string>
		isOpen: ComputedRef<boolean>
		hasChildren: ComputedRef<boolean>
		updateBoundary: () => void
	},
) {
	const { tree } = node
	const timer = useHoverTimer()
	const isHoverBranch = (): boolean => props.trigger === 'hover' && node.hasChildren.value
	return {
		handleLinkClick(): void {
			emit('item-click', props.item)
			emit('navigate', (props.item.href ?? props.item.to) as string)
		},
		handleClick(): void {
			if (props.item.isDisabled) return
			emit('item-click', props.item)
			if (!node.hasChildren.value) return
			if (node.isOpen.value) {
				tree.close(node.path.value)
			} else {
				node.updateBoundary()
				tree.open(node.path.value)
			}
		},
		handleEnter(): void {
			if (!isHoverBranch()) return
			timer.clearTimer()
			node.updateBoundary()
			tree.open(node.path.value)
		},
		handleLeave(): void {
			if (!isHoverBranch()) return
			timer.later(() => tree.close(node.path.value), props.hoverDelay)
		},
	}
}

export function useBaseMegaMenuNode(props: BaseMegaMenuNodeProps, emit: BaseMegaMenuNodeEmits) {
	const tree = useMegaMenuTree()
	const nodePath = computed(() => `${props.parentPath}${MEGA_MENU_PATH_SEPARATOR}${props.item.label}`)
	const isOpen = computed(() => tree.isPathOpen(nodePath.value))
	const hasChildren = computed(() => Boolean(props.item.children && props.item.children.length > 0))
	const flyout = useNodeFlyout(props, isOpen)

	return {
		nodePath,
		isOpen,
		hasChildren,
		isLink: computed(() => !hasChildren.value && Boolean(props.item.to || props.item.href)),
		anchorRef: flyout.anchorRef,
		panelRef: flyout.panelRef,
		isFlyout: flyout.isFlyout,
		panelStyle: flyout.panelStyle,
		isFlipped: flyout.isFlipped,
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
		...useNodeHandlers(props, emit, { tree, path: nodePath, isOpen, hasChildren, updateBoundary: flyout.updateBoundary }),
	}
}
