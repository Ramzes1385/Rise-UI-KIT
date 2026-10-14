import { UI_ARIA } from '@/locales/messages'
import { getFocusable, hasChildren } from '../megaMenuItems'
import { computed, nextTick, provide, ref, shallowRef } from 'vue'
import { formatMessage, getLocale, pluralize } from '@/locales/state'
import { LEVEL_LINK_SELECTOR, MEGA_MENU_CASCADE_KEY } from './cascadeItems'
import type { MegaMenuDrillGroupEmits, MegaMenuDrillGroupProps, MegaMenuLink, MegaMenuLinkEntry } from '../../types/BaseMegaMenu.types'

function announceLevel(title: string, links: MegaMenuLink[]): string {
	return formatMessage(UI_ARIA.MEGA_MENU_LEVEL, { title, count: pluralize(getLocale().plural.MEGA_MENU_ITEMS, links.length) })
}

function isParent(entry: MegaMenuLinkEntry): boolean {
	return hasChildren(entry.link) && !entry.link.isDisabled
}

const isNever = (): boolean => false

function stop(event: KeyboardEvent): void {
	event.preventDefault()
	event.stopPropagation()
}

function useDrillLevel(props: MegaMenuDrillGroupProps) {
	const path = shallowRef<MegaMenuLinkEntry[]>([])
	const current = computed(() => path.value.at(-1))
	const depth = computed(() => path.value.length)
	const rootTitle = computed(() => props.group.title ?? props.item.label)
	const levelTitle = computed(() => current.value?.link.label ?? props.group.title)

	return {
		path,
		current,
		depth,
		rootTitle,
		levelTitle,
		links: computed(() => current.value?.link.children ?? props.group.items),
		levelId: computed(() => `${props.titleId}-level-${depth.value}`),
		levelTitleId: computed(() => `${props.titleId}-${depth.value}`),
		parentId: computed(() => current.value?.id ?? props.linksId),
		backLabel: computed(() =>
			formatMessage(UI_ARIA.MEGA_MENU_BACK_TO, { title: depth.value > 1 ? path.value[depth.value - 2].link.label : rootTitle.value }),
		),
	}
}

function createBackKeydown(back: () => void): (event: KeyboardEvent) => void {
	return (event: KeyboardEvent): void => {
		if (event.key !== 'ArrowLeft' && event.key !== 'Escape') return
		stop(event)
		back()
	}
}

function createLevelKeydown(actions: { open: (entry: MegaMenuLinkEntry) => void; back: () => void }) {
	return (entry: MegaMenuLinkEntry, event: KeyboardEvent): void => {
		if (event.key === 'ArrowRight' && isParent(entry)) {
			stop(event)
			actions.open(entry)
		} else if (entry.depth > 0 && (event.key === 'ArrowLeft' || event.key === 'Escape')) {
			stop(event)
			actions.back()
		}
	}
}

export function useMegaMenuDrill(props: MegaMenuDrillGroupProps, emit: MegaMenuDrillGroupEmits) {
	const level = useDrillLevel(props)
	const direction = ref<'forward' | 'back'>('forward')
	const announcement = ref('')

	function open(entry: MegaMenuLinkEntry): void {
		direction.value = 'forward'
		level.path.value = [...level.path.value, entry]
		announcement.value = announceLevel(entry.link.label, entry.link.children ?? [])
		void nextTick(() => getFocusable(document.getElementById(level.levelId.value), LEVEL_LINK_SELECTOR)[0]?.focus())
	}

	function back(): void {
		const leftId = level.current.value?.id ?? ''
		direction.value = 'back'
		level.path.value = level.path.value.slice(0, -1)
		announcement.value = announceLevel(level.levelTitle.value ?? level.rootTitle.value, level.links.value)
		void nextTick(() => document.getElementById(leftId)?.focus())
	}

	const handleKeydown = createLevelKeydown({ open, back })

	provide(MEGA_MENU_CASCADE_KEY, {
		isExpanded: isNever,
		isBelow: isNever,
		isDrilldown: true,
		toggle: open,
		select: (link, event) => emit('select', link, event),
		handleEnter: () => undefined,
		handleKeydown,
		isMotionReduced: () => Boolean(props.isMotionReduced),
	})

	return {
		depth: level.depth,
		links: level.links,
		levelId: level.levelId,
		levelTitle: level.levelTitle,
		levelTitleId: level.levelTitleId,
		parentId: level.parentId,
		backLabel: level.backLabel,
		direction,
		announcement,
		back,
		handleBackKeydown: createBackKeydown(back),
	}
}
