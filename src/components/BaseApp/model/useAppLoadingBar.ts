import { computed } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import type { BaseAppProps } from '../types/BaseApp.types'
import { loadingBarStore } from '@composables/app/useLoadingBar'

const LOADING_BAR_HEIGHT = 3

export function useAppLoadingBar(props: BaseAppProps) {
	const { status, progress } = loadingBarStore

	return {
		isVisible: computed(() => status.value !== 'idle'),
		label: computed(() => props.loadingBar?.label ?? UI_ARIA.LOADING_BAR),
		classes: computed(() => ['base-app-loading-bar', `base-app-loading-bar--${status.value}`]),
		styles: computed<Record<string, string>>(() => ({
			'--loading-bar-progress': String(progress.value),
			'--loading-bar-height': `${props.loadingBar?.height ?? LOADING_BAR_HEIGHT}px`,
		})),
	}
}
