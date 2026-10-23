import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { useRoadmapEditorContext } from './roadmapEditorContext'
import type { RoadmapHooks } from '../../../types/BaseRoadmap.types'
import type { HookSubscription } from '@composables/editor/useCommandHistory/types/useCommandHistory.types'
const INTERNAL_SUFFIX = 'Internal'

const DESCRIPTION: Record<keyof RoadmapHooks, () => string> = {
	beforeStatusChange: () => UI_ROADMAP_EDIT.HOOK_D_STATUS,
	beforeChange: () => UI_ROADMAP_EDIT.HOOK_D_CHANGE,
	beforeDelete: () => UI_ROADMAP_EDIT.HOOK_D_DELETE,
}
function listRoadmapHooks(subscriptions: readonly HookSubscription[]): HookSubscription[] {
	return subscriptions.filter(item => !item.handler.endsWith(INTERNAL_SUFFIX))
}

export function useRoadmapHooksTab() {
	const { edit, isDisabled } = useRoadmapEditorContext()
	const { hooks } = edit
	const items = computed(() => {
		void hooks.revision.value
		return listRoadmapHooks(hooks.list())
	})
	return {
		items,
		count: computed(() => items.value.filter(item => item.isEnabled).length),
		isDisabled,
		describe: (item: HookSubscription): string => DESCRIPTION[item.name as keyof RoadmapHooks]?.() ?? '',
		handler: (item: HookSubscription): string => item.handler || UI_ROADMAP_EDIT.HOOK_ANONYMOUS,
		calls: (item: HookSubscription): string => formatMessage(UI_ROADMAP_EDIT.HOOK_CALLS, { count: item.calls }),
		toggleLabel: (item: HookSubscription): string =>
			formatMessage(UI_ROADMAP_EDIT.HOOK_TOGGLE, { name: `${item.name} → ${item.handler || UI_ROADMAP_EDIT.HOOK_ANONYMOUS}` }),
		last: (item: HookSubscription): string => {
			void hooks.revision.value
			const result = hooks.resultOf(item.id)
			if (!result) return ''
			const text = result.isCancelled
				? formatMessage(UI_ROADMAP_EDIT.HOOK_RESULT_DENIED, { reason: result.reason! })
				: UI_ROADMAP_EDIT.HOOK_RESULT_ALLOWED
			return formatMessage(UI_ROADMAP_EDIT.HOOK_LAST, { result: text })
		},
		toggle: (item: HookSubscription, isEnabled: boolean): void => hooks.setEnabled(item.id, isEnabled),
	}
}
