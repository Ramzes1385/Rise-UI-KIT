import { computed, ref } from 'vue'
import { calcIconScale } from '@utils/media/iconUtils'
import { buildBreadcrumbsSchema } from '@utils/form/schemaUtils'
import type { ResolvedLink } from '@composables/interaction/useLink'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { resolveLink, useLinkComponent } from '@composables/interaction/useLink'
import type { BaseBreadcrumbsEmits, BreadcrumbItem, BreadcrumbsProps } from '../types/BaseBreadcrumbs.types'

const BREADCRUMBS_ELEMENTS = [
	'root',
	'list',
	'item',
	'ellipsisBtn',
	'link',
	'current',
	'separator',
	'separatorIcon',
	'separatorText',
	'homeIcon',
	'itemIcon',
	'itemText',
	'currentIcon',
	'currentText',
]

function useVisibleItems(props: BreadcrumbsProps) {
	const isExpanded = ref(false)
	const trailItems = computed<BreadcrumbItem[]>(() => (props.showHome && props.items.length > 1 ? props.items.slice(1) : props.items))
	const isCollapsed = computed(() => props.maxItems > 0 && !isExpanded.value && trailItems.value.length > props.maxItems)

	return {
		isExpanded,
		visibleItems: computed<BreadcrumbItem[]>(() => (isCollapsed.value ? trailItems.value.slice(-props.maxItems) : trailItems.value)),
		collapsedItems: computed<BreadcrumbItem[]>(() => (isCollapsed.value ? trailItems.value.slice(0, -props.maxItems) : [])),
	}
}

function useItemLinks(props: BreadcrumbsProps, emit: BaseBreadcrumbsEmits) {
	const appLinkComponent = useLinkComponent()

	const getLink = (item: BreadcrumbItem): ResolvedLink => {
		if (!item.to && !item.href) return { is: 'button', attrs: { type: 'button' }, hasTarget: false }
		const target = item.target ?? (item.href ? '_blank' : undefined)
		return resolveLink({ to: item.to, href: item.href, target }, props.linkComponent ?? appLinkComponent)
	}

	return {
		getLink,
		handleItemClick(item: BreadcrumbItem): void {
			emit('item-click', item)
			if (getLink(item).hasTarget) emit('navigate', (item.href ?? item.to)!)
		},
	}
}

export function useBaseBreadcrumbs(props: BreadcrumbsProps, emit: BaseBreadcrumbsEmits) {
	const standard = useStandardBaseComponent('base-breadcrumbs', props, BREADCRUMBS_ELEMENTS)
	const { isExpanded, visibleItems, collapsedItems } = useVisibleItems(props)

	return {
		...standard,
		isExpanded,
		visibleItems,
		collapsedItems,
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
		schemaJson: computed((): string => buildBreadcrumbsSchema(props.items)),
		isCurrent: (index: number): boolean => index === visibleItems.value.length - 1,
		realIndex: (visibleIdx: number): number => props.items.length - visibleItems.value.length + visibleIdx,
		...useItemLinks(props, emit),
	}
}
