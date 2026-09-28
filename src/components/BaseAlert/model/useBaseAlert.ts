import { computed } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { AlertProps, BaseAlertEmits } from '../types/BaseAlert.types'

const CLOSE_BUTTON_PADDING = { x: 3, y: 3 } as const
const ALERT_ICONS: Record<string, string> = { info: 'info', success: 'check-circle', warning: 'alert-triangle', error: 'x-circle' }
const ALERT_ELEMENTS = ['root', 'iconWrapper', 'icon', 'content', 'title', 'description', 'text', 'actions', 'close', 'closeIcon']

export function useBaseAlert(props: AlertProps, emit: BaseAlertEmits) {
	return {
		...useStandardBaseComponent('base-alert', props, ALERT_ELEMENTS),
		closeButtonPadding: CLOSE_BUTTON_PADDING,
		liveRole: computed((): 'alert' | 'status' => (props.type === 'error' || props.type === 'warning' ? 'alert' : 'status')),
		alertIcon: computed((): string => props.icon || ALERT_ICONS[props.type] || 'info'),
		handleClose: () => emit('close'),
	}
}
