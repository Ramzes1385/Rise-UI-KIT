/** Composable: логика BaseMegaMenuNode — раскрытие узла в дереве меню, каскадный flyout и события перехода */
import { computed, ref } from 'vue'
import { calcIconScale } from '@utils/iconUtils'
import { useFlyoutPosition } from '@composables/useFlyoutPosition'
import { MEGA_MENU_PATH_SEPARATOR, useMegaMenuTree } from '@composables/useMegaMenuTree'
import { useHoverTimer } from './useHoverTimer'
import type { ComputedRef } from 'vue'
import type { BaseMegaMenuNodeEmits, BaseMegaMenuNodeProps } from '../types/BaseMegaMenuNode.types'

/**
 * Каскадный flyout — только в dropdown-layout на десктопе. В columns узлы стоят в середине широкой панели, поэтому
 * боковой flyout накладывался бы на меню — там вложенные уровни раскрываются аккордеоном вниз
 */
function useNodeFlyout(props: BaseMegaMenuNodeProps, isOpen: ComputedRef<boolean>) {
	// Якорь для каскадного flyout (шапка узла) — задаёт вертикальное выравнивание
	const anchorRef = ref<HTMLElement | null>(null)
	// Панель-контейнер узла — flyout встаёт встык к её краю, без наезда
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
		/** Запомнить панель-контейнер, в которой лежит узел (для расчёта flyout встык) */
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
		/** Клик по ссылке: переход выполняет BaseLink, компонент сообщает о нём событиями */
		handleLinkClick(): void {
			emit('item-click', props.item)
			emit('navigate', (props.item.href ?? props.item.to) as string)
		},
		/** Клик по узлу: раскрытие вложенного уровня (закрывая соседей); у листа без адреса — только item-click */
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
		/** Наведение: раскрытие при trigger=hover (закрывая соседей) */
		handleEnter(): void {
			if (!isHoverBranch()) return
			timer.clearTimer()
			node.updateBoundary()
			tree.open(node.path.value)
		},
		/** Уход курсора: закрытие с задержкой при trigger=hover */
		handleLeave(): void {
			if (!isHoverBranch()) return
			timer.later(() => tree.close(node.path.value), props.hoverDelay)
		},
	}
}

export function useBaseMegaMenuNode(props: BaseMegaMenuNodeProps, emit: BaseMegaMenuNodeEmits) {
	// Реестр дерева: открыт только один узел на уровень во всей ветви
	const tree = useMegaMenuTree()
	const nodePath = computed(() => `${props.parentPath}${MEGA_MENU_PATH_SEPARATOR}${props.item.label}`)
	const isOpen = computed(() => tree.isPathOpen(nodePath.value))
	const hasChildren = computed(() => Boolean(props.item.children && props.item.children.length > 0))
	const flyout = useNodeFlyout(props, isOpen)

	return {
		nodePath,
		isOpen,
		hasChildren,
		// Лист с адресом — ссылка, переход выполняет она сама
		isLink: computed(() => !hasChildren.value && Boolean(props.item.to || props.item.href)),
		anchorRef: flyout.anchorRef,
		panelRef: flyout.panelRef,
		isFlyout: flyout.isFlyout,
		panelStyle: flyout.panelStyle,
		isFlipped: flyout.isFlipped,
		// Единый масштаб иконки для всех уровней
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
		...useNodeHandlers(props, emit, { tree, path: nodePath, isOpen, hasChildren, updateBoundary: flyout.updateBoundary }),
	}
}
