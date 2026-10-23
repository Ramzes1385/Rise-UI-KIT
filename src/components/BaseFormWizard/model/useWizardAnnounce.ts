import { nextTick, ref, watch } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FORM_WIZARD } from '@/locales/messages'
import type { useWizardNavigation } from './useWizardNavigation'
import type { FormWizardProps } from '../types/BaseFormWizard.types'

export function useWizardAnnounce(props: FormWizardProps, nav: ReturnType<typeof useWizardNavigation>) {
	const titleRef = ref<HTMLElement | null>(null)
	const liveText = ref('')

	watch(nav.currentId, async () => {
		liveText.value = formatMessage(UI_FORM_WIZARD.PROGRESS, {
			current: nav.currentIndex.value + 1,
			total: props.steps.length,
			title: nav.currentStep.value?.title ?? '',
		})
		await nextTick()
		titleRef.value?.focus()
	})

	return { titleRef, liveText }
}
