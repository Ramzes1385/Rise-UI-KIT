import { computed, ref } from 'vue'
import { UI_PLAYER } from '@/locales/messages'
import type { MediaReportReason } from '../types/BaseMediaPlayer.types'
import type { MediaReportFormEmits, MediaReportFormProps } from '../types/MediaReportForm.types'

const REASON_LABELS: Record<MediaReportReason, () => string> = {
	'no-sound': () => UI_PLAYER.REPORT_NO_SOUND,
	'no-video': () => UI_PLAYER.REPORT_NO_VIDEO,
	buffering: () => UI_PLAYER.REPORT_BUFFERING,
	'out-of-sync': () => UI_PLAYER.REPORT_OUT_OF_SYNC,
	other: () => UI_PLAYER.REPORT_OTHER,
}

export function useMediaReportForm(props: MediaReportFormProps, emit: MediaReportFormEmits) {
	const reason = ref<MediaReportReason>('no-sound')
	const comment = ref('')
	const close = (): void => emit('update:isOpen', false)

	return {
		reason,
		comment,
		isOpen: computed(() => props.isOpen),
		reasonOptions: computed(() => Object.entries(REASON_LABELS).map(([value, label]) => ({ value, label: label() }))),
		close,
		submit(): void {
			emit('submit', { reason: reason.value, comment: comment.value.trim() })
			comment.value = ''
			close()
		},
	}
}
