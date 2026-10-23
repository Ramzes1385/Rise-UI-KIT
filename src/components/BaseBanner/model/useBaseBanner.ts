import { UI_BANNER } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { computed, onMounted, ref, watch } from 'vue'
import { readStorage, writeStorage } from '@utils/data/storageUtils'
import { useDismissFocus } from '@composables/interaction/useDismissFocus'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useExpandTransition } from '@composables/interaction/useExpandTransition'
import type { BannerProps, BannerType, BaseBannerEmits } from '../types/BaseBanner.types'

const BANNER_ELEMENTS = ['root', 'body', 'iconWrapper', 'icon', 'content', 'text', 'action', 'close', 'closeIcon']
const BANNER_ICONS: Record<BannerType, string> = {
	primary: 'bell',
	info: 'info',
	success: 'check-circle',
	warning: 'alert-triangle',
	error: 'x-circle',
}
const LIVE_ALERT_TYPES = new Set<BannerType>(['warning', 'error'])
const STORAGE_PREFIX = 'rise-banner:'
const STORAGE_CLOSED = 'closed'
const CLOSE_BUTTON_PADDING = { x: 3, y: 3 } as const

function useBannerOpen(props: BannerProps, emit: BaseBannerEmits) {
	const isShown = ref(props.isOpen)
	const isReady = ref(!props.storageKey)
	const rootRef = ref<HTMLElement | null>(null)
	const { releaseFocus } = useDismissFocus({ elementRef: rootRef })
	const storageName = (): string | null => (props.storageKey ? `${STORAGE_PREFIX}${props.storageKey}` : null)

	function setShown(value: boolean): void {
		isShown.value = value
		emit('update:isOpen', value)
	}

	watch(
		() => props.isOpen,
		value => {
			isShown.value = value
		},
	)
	watch(isShown, shown => {
		if (!shown) releaseFocus()
	})
	onMounted(() => {
		const name = storageName()
		if (name && readStorage(name) === STORAGE_CLOSED) setShown(false)
		isReady.value = true
	})

	return {
		isShown,
		isVisible: computed(() => isReady.value && isShown.value),
		rootRef,
		handleClose(): void {
			const name = storageName()
			if (name) writeStorage(name, STORAGE_CLOSED)
			setShown(false)
			emit('close')
		},
	}
}

export function useBaseBanner(props: BannerProps, emit: BaseBannerEmits) {
	return {
		...useStandardBaseComponent('base-banner', props, BANNER_ELEMENTS),
		...useBannerOpen(props, emit),
		ui: useUi(props, 'base-banner'),
		expand: useExpandTransition(),
		closeButtonPadding: CLOSE_BUTTON_PADDING,
		bannerIcon: computed((): string => props.icon || BANNER_ICONS[props.type]),
		bannerRole: computed((): 'region' | 'alert' | 'status' => {
			if (!props.isLive) return 'region'
			return LIVE_ALERT_TYPES.has(props.type) ? 'alert' : 'status'
		}),
		bannerLabel: computed((): string => props.label || UI_BANNER.LABEL),
	}
}
