import { computed, ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import { useMotion } from '@composables/app/useMotion'
import type { AlertProps, BaseAlertEmits } from '../types/BaseAlert.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

const CLOSE_BUTTON_PADDING = { x: 3, y: 3 } as const
const ALERT_ICONS: Record<string, string> = { info: 'info', success: 'check-circle', warning: 'alert-triangle', error: 'x-circle' }
const ALERT_ELEMENTS = ['root', 'iconWrapper', 'icon', 'content', 'title', 'description', 'text', 'actions', 'close', 'closeIcon']

function useAlertClose(emit: BaseAlertEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const motion = useMotion(rootRef)
	const isVisible = ref(true)
	const isInstant = ref(false)

	return {
		rootRef,
		isVisible,
		isInstant,
		handleClose: (): void => {
			isInstant.value = motion.isReduced.value
			isVisible.value = false
			if (isInstant.value) emit('close')
		},
		handleAfterLeave: (): void => {
			if (!isInstant.value) emit('close')
		},
	}
}

export function useBaseAlert(props: AlertProps, emit: BaseAlertEmits) {
	return {
		...useStandardBaseComponent('base-alert', props, ALERT_ELEMENTS),
		...useAlertClose(emit),
		ui: useUi(props, 'base-alert'),
		closeButtonPadding: CLOSE_BUTTON_PADDING,
		liveRole: computed((): 'alert' | 'status' => (props.type === 'error' || props.type === 'warning' ? 'alert' : 'status')),
		alertIcon: computed((): string => props.icon || ALERT_ICONS[props.type] || 'info'),
	}
}
