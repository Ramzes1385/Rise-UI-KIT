/** Composable: логика BaseAlert — роль live-региона, иконка и закрытие */
import { computed } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { AlertProps, BaseAlertEmits } from '../types/BaseAlert.types'

/** Отступы кнопки закрытия: квадрат 24px при sizeScale = 100 */
const CLOSE_BUTTON_PADDING = { x: 3, y: 3 } as const
const ALERT_ICONS: Record<string, string> = { info: 'info', success: 'check-circle', warning: 'alert-triangle', error: 'x-circle' }
const ALERT_ELEMENTS = ['root', 'iconWrapper', 'icon', 'content', 'title', 'description', 'text', 'actions', 'close', 'closeIcon']

export function useBaseAlert(props: AlertProps, emit: BaseAlertEmits) {
	return {
		...useStandardBaseComponent('base-alert', props, ALERT_ELEMENTS),
		closeButtonPadding: CLOSE_BUTTON_PADDING,
		/**
		 * Роль live-региона по срочности: error/warning прерывают озвучивание (alert = assertive), info/success объявляются
		 * вежливо (status = polite). Явный aria-live не ставится, чтобы не переопределять неявную вежливость роли.
		 */
		liveRole: computed((): 'alert' | 'status' => (props.type === 'error' || props.type === 'warning' ? 'alert' : 'status')),
		alertIcon: computed((): string => props.icon || ALERT_ICONS[props.type] || 'info'),
		handleClose: () => emit('close'),
	}
}
