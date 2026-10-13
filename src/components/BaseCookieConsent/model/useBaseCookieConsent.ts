import { useUi } from '@composables/base/useUi'
import { UI_COOKIE_CONSENT } from '@/locales/messages'
import { computed, onMounted, ref, useId, watch } from 'vue'
import { readStorage, writeStorage } from '@utils/data/storageUtils'
import { useDismissFocus } from '@composables/interaction/useDismissFocus'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseCookieConsentEmits, CookieConsentProps } from '../types/BaseCookieConsent.types'
import { allIds, isSameSelection, normalizeSelection, parseStoredSelection } from './cookieSelection'

const CONSENT_ELEMENTS = [
	'root',
	'content',
	'title',
	'description',
	'settings',
	'category',
	'hint',
	'categoryDescription',
	'actions',
	'customize',
	'acceptSelected',
	'rejectAll',
	'acceptAll',
]
const STORAGE_PREFIX = 'rise-cookie-consent:'
const BUTTON_PADDING = { x: 6, y: 4 } as const

function useConsentSelection(props: CookieConsentProps, emit: BaseCookieConsentEmits) {
	const selected = ref(normalizeSelection(props.modelValue ?? [], props.categories))

	function select(ids: string[]): void {
		const next = normalizeSelection(ids, props.categories)
		if (isSameSelection(next, selected.value)) return
		selected.value = next
		emit('update:modelValue', next)
		emit('change', next)
	}

	watch(
		() => [props.modelValue, props.categories] as const,
		([value, categories]) => {
			selected.value = normalizeSelection(value ?? selected.value, categories)
		},
	)

	return {
		selected,
		select,
		isChecked: (id: string): boolean => selected.value.includes(id),
		toggle(id: string, isOn: boolean): void {
			select(isOn ? [...selected.value, id] : selected.value.filter(item => item !== id))
		},
	}
}

function useConsentState(props: CookieConsentProps, emit: BaseCookieConsentEmits) {
	const isShown = ref(props.isOpen)
	const isReady = ref(!props.storageKey)
	const rootRef = ref<HTMLElement | null>(null)
	const { releaseFocus } = useDismissFocus({ elementRef: rootRef })
	const isSettingsShown = ref(props.isSettingsOpen)

	watch(
		() => props.isOpen,
		value => {
			isShown.value = value
		},
	)
	watch(
		() => props.isSettingsOpen,
		value => {
			isSettingsShown.value = value
		},
	)

	watch(isShown, shown => {
		if (!shown) releaseFocus()
	})

	return {
		isShown,
		isReady,
		rootRef,
		isVisible: computed(() => isReady.value && isShown.value),
		isSettingsShown,
		hide(): void {
			isShown.value = false
			emit('update:isOpen', false)
		},
		toggleSettings(): void {
			isSettingsShown.value = !isSettingsShown.value
			emit('update:isSettingsOpen', isSettingsShown.value)
		},
	}
}

function useStoredDecision(
	storageName: () => string | null,
	select: (ids: string[]) => void,
	state: ReturnType<typeof useConsentState>,
): void {
	onMounted(() => {
		const name = storageName()
		const stored = name ? parseStoredSelection(readStorage(name)) : null
		if (stored) {
			select(stored)
			state.hide()
		}
		state.isReady.value = true
	})
}

export function useBaseCookieConsent(props: CookieConsentProps, emit: BaseCookieConsentEmits) {
	const selection = useConsentSelection(props, emit)
	const state = useConsentState(props, emit)
	const id = useId()
	const storageName = (): string | null => (props.storageKey ? `${STORAGE_PREFIX}${props.storageKey}` : null)

	function finish(ids: string[]): void {
		const name = storageName()
		if (name) writeStorage(name, JSON.stringify(ids))
		emit('accept', ids)
		state.hide()
	}

	useStoredDecision(storageName, selection.select, state)

	return {
		...useStandardBaseComponent('base-cookie-consent', props, CONSENT_ELEMENTS),
		ui: useUi(props, 'base-cookie-consent'),
		isVisible: state.isVisible,
		rootRef: state.rootRef,
		isSettingsShown: state.isSettingsShown,
		toggleSettings: state.toggleSettings,
		isChecked: selection.isChecked,
		toggle: selection.toggle,
		titleId: `${id}-title`,
		descriptionId: `${id}-description`,
		settingsId: `${id}-settings`,
		categoryDescriptionId: (categoryId: string): string => `${id}-category-${categoryId}`,
		buttonPadding: BUTTON_PADDING,
		consentTitle: computed((): string => props.title || UI_COOKIE_CONSENT.TITLE),
		consentDescription: computed((): string => props.description || UI_COOKIE_CONSENT.DESCRIPTION),
		acceptAll(): void {
			const ids = allIds(props.categories)
			selection.select(ids)
			finish(ids)
		},
		rejectAll(): void {
			const ids = normalizeSelection([], props.categories)
			selection.select(ids)
			finish(ids)
		},
		acceptSelected(): void {
			finish(selection.selected.value)
		},
	}
}
