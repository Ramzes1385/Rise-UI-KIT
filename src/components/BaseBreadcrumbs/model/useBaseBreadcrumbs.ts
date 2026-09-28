/** Composable: логика BaseBreadcrumbs — свёртка длинной цепочки, ссылки крошек и микроразметка */
import { computed, ref } from 'vue'
import { calcIconScale } from '@utils/iconUtils'
import type { ResolvedLink } from '@composables/useLink'
import { buildBreadcrumbsSchema } from '@utils/schemaUtils'
import { resolveLink, useLinkComponent } from '@composables/useLink'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
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

/** Видимая часть цепочки: при maxItems > 0 до раскрытия видны последние maxItems крошек */
function useVisibleItems(props: BreadcrumbsProps) {
	const isExpanded = ref(false)
	// При showHome первую крошку представляет кнопка «домой», иначе «Главная» выводилась бы дважды.
	// Единственная крошка остаётся в цепочке: это текущая страница
	const trailItems = computed<BreadcrumbItem[]>(() => (props.showHome && props.items.length > 1 ? props.items.slice(1) : props.items))
	const isCollapsed = computed(() => props.maxItems > 0 && !isExpanded.value && trailItems.value.length > props.maxItems)

	return {
		isExpanded,
		visibleItems: computed<BreadcrumbItem[]>(() => (isCollapsed.value ? trailItems.value.slice(-props.maxItems) : trailItems.value)),
		collapsedItems: computed<BreadcrumbItem[]>(() => (isCollapsed.value ? trailItems.value.slice(0, -props.maxItems) : [])),
	}
}

function useItemLinks(props: BreadcrumbsProps, emit: BaseBreadcrumbsEmits) {
	// Компонент ссылок: проп, `linkComponent` из плагина, RouterLink приложения или `a`
	const appLinkComponent = useLinkComponent()

	/** Внешний адрес (`href`) по умолчанию открывается в новой вкладке; крошка без адреса — кнопка (событие item-click) */
	const getLink = (item: BreadcrumbItem): ResolvedLink => {
		if (!item.to && !item.href) return { is: 'button', attrs: { type: 'button' }, hasTarget: false }
		const target = item.target ?? (item.href ? '_blank' : undefined)
		return resolveLink({ to: item.to, href: item.href, target }, props.linkComponent ?? appLinkComponent)
	}

	return {
		getLink,
		/** Переход выполняет сама ссылка; события сообщают о нём приложению (аналитика, закрытие меню) */
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
		// Иконки крошек и «дома» — 16px при sizeScale = 100
		iconScale: computed(() => calcIconScale('sm', props.sizeScale)),
		schemaJson: computed((): string => buildBreadcrumbsSchema(props.items)),
		isCurrent: (index: number): boolean => index === visibleItems.value.length - 1,
		realIndex: (visibleIdx: number): number => props.items.length - visibleItems.value.length + visibleIdx,
		...useItemLinks(props, emit),
	}
}
