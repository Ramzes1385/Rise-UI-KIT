import { computed } from 'vue'
import { UI_RESULT } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { ResultProps, ResultRole, ResultStatus } from '../types/BaseResult.types'

const RESULT_ELEMENTS = ['root', 'iconWrapper', 'icon', 'code', 'content', 'title', 'description', 'body', 'extra']
const STATUS_ROLES: Record<ResultStatus, ResultRole> = {
	success: 'success',
	info: 'info',
	warning: 'warning',
	error: 'error',
	'403': 'warning',
	'404': 'info',
	'500': 'error',
}
const STATUS_ICONS: Record<ResultRole, string> = { success: 'check-circle', info: 'info', warning: 'alert-triangle', error: 'x-circle' }
const STATUS_TITLES: Record<ResultStatus, () => string> = {
	success: () => UI_RESULT.TITLE_SUCCESS,
	info: () => UI_RESULT.TITLE_INFO,
	warning: () => UI_RESULT.TITLE_WARNING,
	error: () => UI_RESULT.TITLE_ERROR,
	'403': () => UI_RESULT.TITLE_403,
	'404': () => UI_RESULT.TITLE_404,
	'500': () => UI_RESULT.TITLE_500,
}
const STATUS_DESCRIPTIONS: Partial<Record<ResultStatus, () => string>> = {
	'403': () => UI_RESULT.DESCRIPTION_403,
	'404': () => UI_RESULT.DESCRIPTION_404,
	'500': () => UI_RESULT.DESCRIPTION_500,
}
const ALERT_ROLES = new Set<ResultRole>(['warning', 'error'])

export function useBaseResult(props: ResultProps) {
	const resultRole = computed((): ResultRole => STATUS_ROLES[props.status])

	return {
		...useStandardBaseComponent('base-result', props, RESULT_ELEMENTS),
		ui: useUi(props, 'base-result'),
		resultRole,
		isCode: computed((): boolean => props.status in STATUS_DESCRIPTIONS && !props.icon),
		liveRole: computed((): 'alert' | 'status' | undefined => {
			if (!props.isLive) return undefined
			return ALERT_ROLES.has(resultRole.value) ? 'alert' : 'status'
		}),
		resultIcon: computed((): string => props.icon || STATUS_ICONS[resultRole.value]),
		resultTitle: computed((): string => props.title || STATUS_TITLES[props.status]()),
		resultDescription: computed((): string => props.description || STATUS_DESCRIPTIONS[props.status]?.() || ''),
	}
}
