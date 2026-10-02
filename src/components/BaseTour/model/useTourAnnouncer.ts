import type { Ref } from 'vue'
import { UI_TOUR } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { nextTick, ref, useId, useSlots, watch } from 'vue'
import type { TourTargetOptions } from '../types/BaseTour.types'

function stepMessage(index: number, total: number, title: string | undefined): string {
	const params = { current: index + 1, total, title: title ?? '' }
	return formatMessage(title ? UI_TOUR.STEP_STATUS_TITLED : UI_TOUR.STEP_STATUS, params)
}

export function useTourAnnouncer(options: TourTargetOptions, activeIndex: Ref<number>, isCardShown: Ref<boolean>) {
	const { props, currentStep } = options
	const slots = useSlots()
	const baseId = useId()
	const titleId = `${baseId}-title`
	const contentId = `${baseId}-content`
	const announcement = ref('')

	const isOwnCard = (): boolean => isCardShown.value && !slots.default
	const hasOwnTitle = (): boolean => isOwnCard() && Boolean(currentStep.value?.title) && !slots.title
	const hasOwnContent = (): boolean => isOwnCard() && Boolean(currentStep.value?.content) && !slots.content

	const getDialogAria = (): Record<string, string | undefined> => {
		const describedBy = hasOwnContent() ? contentId : undefined
		if (hasOwnTitle()) return { 'aria-labelledby': titleId, 'aria-describedby': describedBy }
		return { 'aria-label': currentStep.value?.title || UI_TOUR.TITLE, 'aria-describedby': describedBy }
	}

	watch(
		() => (props.isOpen && currentStep.value ? activeIndex.value : -1),
		index => {
			announcement.value = ''
			if (index === -1) return
			const text = stepMessage(index, props.steps.length, currentStep.value?.title)
			void nextTick(() => {
				announcement.value = text
			})
		},
		{ immediate: true, flush: 'post' },
	)

	return { titleId, contentId, getDialogAria, announcement }
}
