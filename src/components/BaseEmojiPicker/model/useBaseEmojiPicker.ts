import type { Ref } from 'vue'
import { currentLocale } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import { nextEmojiIndex } from './emojiNavigation'
import { isImeKeydown } from '@utils/dom/keyboardUtils'
import { buildSections, emojiKey, loadEmojiData } from './emojiData'
import { computed, nextTick, ref, shallowRef, useId, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseEmojiPickerEmits, BaseEmojiPickerProps, EmojiPickerItem, EmojiPickerSection } from '../types/BaseEmojiPicker.types'

function useEmojiItems(props: BaseEmojiPickerProps) {
	const items = shallowRef<readonly EmojiPickerItem[]>(props.emojis ?? [])
	const isLoading = ref(!props.emojis)
	watch(
		() => [props.emojis, currentLocale.value.code] as const,
		([emojis, locale]) => {
			isLoading.value = !emojis
			if (emojis) items.value = emojis
			else
				loadEmojiData(locale).then(list => {
					if (props.emojis || currentLocale.value.code !== locale) return
					items.value = list
					isLoading.value = false
				})
		},
		{ immediate: true },
	)
	return { items, isLoading }
}

function useEmojiRecent(props: BaseEmojiPickerProps, emit: BaseEmojiPickerEmits) {
	const shown = shallowRef<readonly string[]>(props.recent ?? [])
	let current = props.recent ?? []
	let emitted: string[] | null = null
	watch(
		() => props.recent,
		recent => {
			current = recent ?? []
			if (recent !== emitted) shown.value = current
		},
	)
	return {
		shownRecent: shown,
		remember(emoji: string): void {
			const next = [emoji, ...current.filter(item => emojiKey(item) !== emojiKey(emoji))].slice(0, props.maxRecent)
			current = next
			emitted = next
			emit('update:recent', next)
		},
	}
}

function useEmojiFocus(props: BaseEmojiPickerProps, sections: Ref<EmojiPickerSection[]>, scrollRef: Ref<HTMLElement | null>) {
	const activeIndex = ref(0)
	const focusIndex = (index: number): void => {
		activeIndex.value = index
		nextTick(() => scrollRef.value?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.focus())
	}
	return {
		activeIndex,
		focusIndex,
		handleGridKeydown(event: KeyboardEvent): void {
			const lengths = sections.value.map(section => section.items.length)
			const next = nextEmojiIndex(event.key, activeIndex.value, { lengths, columns: props.columns ?? 8 })
			if (next === null) return
			event.preventDefault()
			focusIndex(next)
		},
	}
}

function useEmojiSections(props: BaseEmojiPickerProps, recent: Ref<readonly string[]>) {
	const { items, isLoading } = useEmojiItems(props)
	const query = ref('')
	const sections = computed(() => buildSections(items.value, recent.value, query.value))
	const activeSection = ref<string | null>(null)
	return {
		isLoading,
		query,
		sections,
		currentSection: computed(() => activeSection.value ?? sections.value[0]?.id),
		activeSection,
		isEmpty: computed(() => !isLoading.value && sections.value.length === 0),
	}
}

function useEmojiScroll(state: ReturnType<typeof useEmojiSections>, scrollRef: Ref<HTMLElement | null>) {
	return {
		handleScroll(): void {
			const scroller = scrollRef.value as HTMLElement
			const passed = [...scroller.querySelectorAll<HTMLElement>('[data-section]')].filter(
				element => element.offsetTop <= scroller.scrollTop + 1,
			)
			state.activeSection.value = passed[passed.length - 1]?.dataset.section ?? null
		},
		scrollToSection(section: EmojiPickerSection): void {
			const scroller = scrollRef.value as HTMLElement
			const element = scroller.querySelector<HTMLElement>(`[data-section="${section.id}"]`)
			scroller.scrollTop = element?.offsetTop ?? 0
			state.activeSection.value = section.id
		},
	}
}

export function useBaseEmojiPicker(props: BaseEmojiPickerProps, emit: BaseEmojiPickerEmits) {
	const scrollRef = ref<HTMLElement | null>(null)
	const recent = useEmojiRecent(props, emit)
	const state = useEmojiSections(props, recent.shownRecent)
	const focus = useEmojiFocus(props, state.sections, scrollRef)
	const preview = ref<EmojiPickerItem | null>(null)
	watch(state.query, () => {
		focus.activeIndex.value = 0
	})
	const select = (item: EmojiPickerItem, index: number): void => {
		focus.activeIndex.value = index
		emit('select', item)
		recent.remember(item.emoji)
	}
	return {
		...useStandardBaseComponent('base-emoji-picker', props, ['root', 'search', 'nav', 'grid', 'preview']),
		ui: useUi(props, 'base-emoji-picker'),
		...state,
		...focus,
		...useEmojiScroll(state, scrollRef),
		scrollRef,
		gridId: `rise-emoji-${useId()}`,
		columnsStyle: computed(() => ({ '--emoji-columns': String(props.columns) })),
		preview,
		showPreview: (item: EmojiPickerItem): void => {
			preview.value = item
		},
		select,
		handleSearchKeydown(event: KeyboardEvent): void {
			const first = state.sections.value[0]?.items[0]
			if (!first || isImeKeydown(event) || (event.key !== 'ArrowDown' && event.key !== 'Enter')) return
			event.preventDefault()
			if (event.key === 'Enter') select(first, 0)
			else focus.focusIndex(focus.activeIndex.value)
		},
	}
}
