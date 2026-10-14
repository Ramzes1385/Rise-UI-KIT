import { useUi } from '@composables/base/useUi'
import { computed, ref, useId, watch } from 'vue'
import { toHTMLElement } from '@utils/dom/domUtils'
import type { StructuredData } from '@utils/seo/structuredDataUtils'
import { useStructuredData } from '@composables/seo/useStructuredData'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseAccordionEmits, AccordionProps, BaseAccordionItem } from '../types/BaseAccordion.types'

const ACCORDION_ELEMENTS = [
	'root',
	'item',
	'heading',
	'header',
	'icon',
	'label',
	'description',
	'arrow',
	'arrowIcon',
	'collapse',
	'content',
	'contentText',
]

const DEFAULT_EXPAND_ICON = 'chevron-down'

const HEADER_SELECTOR = ':scope > .base-accordion__item > .base-accordion__heading > .base-accordion__header'

const HEADER_KEY_TARGETS: Record<string, (index: number, count: number) => number> = {
	ArrowDown: (index, count) => (index + 1) % count,
	ArrowUp: (index, count) => (index - 1 + count) % count,
	Home: () => 0,
	End: (_, count) => count - 1,
}

function handleHeaderKeydown(event: KeyboardEvent): void {
	const target = HEADER_KEY_TARGETS[event.key]
	const header = toHTMLElement(event.currentTarget)
	const root = header?.closest('.base-accordion')
	if (!target || !header || !root || event.altKey || event.ctrlKey || event.metaKey) return
	const headers = Array.from(root.querySelectorAll<HTMLElement>(HEADER_SELECTOR))
	event.preventDefault()
	headers[target(headers.indexOf(header), headers.length)]?.focus()
}

function faqSchema(items: BaseAccordionItem[]): StructuredData | null {
	if (!items.length) return null
	return {
		'@type': 'FAQPage',
		mainEntity: items.map(item => ({
			'@type': 'Question',
			name: item.label,
			acceptedAnswer: { '@type': 'Answer', text: item.seoAnswer ?? item.content },
		})),
	}
}

function useAccordionAppearance(props: AccordionProps) {
	return {
		appearanceClass: computed((): string[] =>
			[
				props.showArrow === false ? '' : `base-accordion--arrow-${props.arrowPosition ?? 'end'}`,
				`base-accordion--density-${props.density ?? 'default'}`,
				props.divider ? `base-accordion--divider-${props.divider}` : '',
				props.collapseIcon ? 'base-accordion--icon-swap' : '',
				props.isAccented ? 'base-accordion--accented' : '',
			].filter(Boolean),
		),
		hasArrow: computed((): boolean => props.showArrow !== false),
		arrowIconName: (isItemOpen: boolean): string =>
			isItemOpen && props.collapseIcon ? props.collapseIcon : (props.expandIcon ?? DEFAULT_EXPAND_ICON),
	}
}

function accordionKeys(items: BaseAccordionItem[]): string[] {
	const seen = new Set<string>()
	return items.map((item, index) => {
		const key = item.id ?? item.label
		const unique = seen.has(key) ? `${key}#${index}` : key
		seen.add(unique)
		return unique
	})
}

function defaultOpenKeys(items: BaseAccordionItem[], keys: string[]): string[] {
	return keys.filter((_, index) => items[index]?.defaultOpen)
}

function useOpenState(props: AccordionProps, emit: BaseAccordionEmits) {
	const keys = computed(() => accordionKeys(props.items))
	const normalize = (list: readonly string[]): string[] => (props.isMultiple ? [...list] : list.slice(0, 1))
	const openKeys = ref<string[]>(normalize(props.open ?? defaultOpenKeys(props.items, keys.value)))

	const setOpen = (next: string[]): void => {
		openKeys.value = next
		emit('update:open', next)
	}

	watch(
		() => props.open,
		value => {
			if (value) openKeys.value = normalize(value)
		},
	)

	watch(keys, (next, previous) => {
		if (props.open) return
		const added = defaultOpenKeys(props.items, next).filter(key => !previous.includes(key))
		if (added.length && (props.isMultiple || !openKeys.value.some(key => next.includes(key))))
			setOpen(normalize([...openKeys.value.filter(key => next.includes(key)), ...added]))
	})

	return { keys, openKeys, setOpen }
}

function useOpenItems(props: AccordionProps, emit: BaseAccordionEmits) {
	const { keys, openKeys, setOpen } = useOpenState(props, emit)
	const isOpen = (index: number): boolean => openKeys.value.includes(keys.value[index]!)

	const open = (index: number): void => {
		const closed = props.isMultiple ? [] : keys.value.flatMap((key, i) => (openKeys.value.includes(key) ? [i] : []))
		setOpen(props.isMultiple ? [...openKeys.value, keys.value[index]!] : [keys.value[index]!])
		closed.forEach(i => emit('toggle', i, false))
		emit('toggle', index, true)
	}

	return {
		itemKey: (index: number): string => keys.value[index]!,
		isOpen,
		toggleItem(index: number): void {
			if (props.items[index]?.isDisabled) return
			if (!isOpen(index)) {
				open(index)
				return
			}
			setOpen(openKeys.value.filter(key => key !== keys.value[index]))
			emit('toggle', index, false)
		},
	}
}

export function useBaseAccordion(props: AccordionProps, emit: BaseAccordionEmits) {
	const baseId = useId()

	return {
		...useStandardBaseComponent('base-accordion', props, ACCORDION_ELEMENTS),
		ui: useUi(props, 'base-accordion'),
		...useOpenItems(props, emit),
		...useAccordionAppearance(props),
		getHeaderId: (index: number): string => `${baseId}-header-${index}`,
		getPanelId: (index: number): string => `${baseId}-panel-${index}`,
		handleHeaderKeydown,
		...useStructuredData(
			'BaseAccordion',
			() => props.seo,
			() => faqSchema(props.items),
		),
	}
}
