import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { getLocale, pluralize } from '@/locales/state'
import { useMotion } from '@composables/app/useMotion'
import { calcIconScale } from '@utils/media/iconUtils'
import type { ResolvedLink } from '@composables/interaction/useLink'
import type { StructuredData } from '@utils/seo/structuredDataUtils'
import { useStructuredData } from '@composables/seo/useStructuredData'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { StructuredDataContext } from '@composables/seo/useStructuredData'
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

function breadcrumbsSchema(items: BreadcrumbItem[], { url }: StructuredDataContext): StructuredData | null {
	if (!items.length) return null
	return {
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.label,
			item: url(item.href ?? item.to),
		})),
	}
}

function useVisibleItems(props: BreadcrumbsProps) {
	const isExpanded = ref(false)
	const isToggled = ref(false)
	const trailItems = computed<BreadcrumbItem[]>(() => (props.showHome && props.items.length > 1 ? props.items.slice(1) : props.items))
	const canCollapse = computed(() => props.maxItems > 0 && trailItems.value.length > props.maxItems)
	const isCollapsed = computed(() => canCollapse.value && !isExpanded.value)
	const collapsedItems = computed<BreadcrumbItem[]>(() => (isCollapsed.value ? trailItems.value.slice(0, -props.maxItems) : []))

	watch(
		() => props.items,
		() => {
			isExpanded.value = false
			isToggled.value = false
		},
	)

	return {
		isExpanded,
		isToggled,
		canCollapse,
		visibleItems: computed<BreadcrumbItem[]>(() => (isCollapsed.value ? trailItems.value.slice(-props.maxItems) : trailItems.value)),
		collapsedItems,
		toggleLabel: computed(() =>
			isCollapsed.value
				? pluralize(getLocale().plural.BREADCRUMBS_HIDDEN, collapsedItems.value.length)
				: UI_ARIA.BREADCRUMBS_COLLAPSE,
		),
		toggleExpanded(): void {
			isExpanded.value = !isExpanded.value
			isToggled.value = true
		},
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

function useReveal(isToggled: Ref<boolean>) {
	const rootRef = ref<HTMLElement | null>(null)
	const motion = useMotion(rootRef)
	const isRevealAnimated = computed(() => isToggled.value && !motion.isReduced.value)

	return {
		rootRef,
		isRevealAnimated,
		revealName: computed(() => (isRevealAnimated.value ? 'base-breadcrumbs-reveal' : 'base-breadcrumbs-static')),
		leaveAtOnce: (_el: Element, done: () => void): void => done(),
	}
}

export function useBaseBreadcrumbs(props: BreadcrumbsProps, emit: BaseBreadcrumbsEmits) {
	const standard = useStandardBaseComponent('base-breadcrumbs', props, BREADCRUMBS_ELEMENTS)
	const { isToggled, ...visible } = useVisibleItems(props)
	const { visibleItems } = visible

	return {
		...standard,
		...visible,
		...useReveal(isToggled),
		ui: useUi(props, 'base-breadcrumbs'),
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
		...useStructuredData(
			'BaseBreadcrumbs',
			() => props.seo,
			context => breadcrumbsSchema(props.items, context),
		),
		isCurrent: (index: number): boolean => index === visibleItems.value.length - 1,
		realIndex: (visibleIdx: number): number => props.items.length - visibleItems.value.length + visibleIdx,
		...useItemLinks(props, emit),
	}
}
