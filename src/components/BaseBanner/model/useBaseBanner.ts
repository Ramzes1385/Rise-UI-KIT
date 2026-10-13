import { UI_BANNER } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { computed, onMounted, ref, watch } from 'vue'
import { readStorage, writeStorage } from '@utils/data/storageUtils'
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
const STORAGE_PREFIX = 'rise-banner:'
const STORAGE_CLOSED = 'closed'
const CLOSE_BUTTON_PADDING = { x: 3, y: 3 } as const

function useBannerOpen(props: BannerProps, emit: BaseBannerEmits) {
	const isShown = ref(props.isOpen)
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
	onMounted(() => {
		const name = storageName()
		if (name && readStorage(name) === STORAGE_CLOSED) setShown(false)
	})

	return {
		isShown,
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
		bannerLabel: computed((): string => props.label || UI_BANNER.LABEL),
	}
}
