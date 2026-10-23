import { computed } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import type { BaseAppProps } from '../types/BaseApp.types'
import { loadingBarStore } from '@composables/app/useLoadingBar/useLoadingBar'

export function useAppLoadingBar(props: BaseAppProps) {
	const { status, progress } = loadingBarStore
	const ui = useUi(props, 'base-app')

	return {
		isVisible: computed(() => status.value !== 'idle'),
		label: computed(() => props.loadingBar?.label ?? UI_ARIA.LOADING_BAR),
		classes: computed(() => [
			'base-app-loading-bar',
			`base-app-loading-bar--${status.value}`,
			...ui('loading-bar').split(' ').slice(1),
		]),
		styles: computed<Record<string, string>>(() => {
			const height = props.loadingBar?.height
			const progressStyle = { '--loading-bar-progress': String(progress.value) }
			return height === undefined ? progressStyle : { ...progressStyle, '--loading-bar-height': `${height}px` }
		}),
	}
}
