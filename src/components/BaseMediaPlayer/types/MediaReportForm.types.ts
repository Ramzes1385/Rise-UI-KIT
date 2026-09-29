import type { MediaReportReason } from './BaseMediaPlayer.types'

export interface MediaReportFormProps {
	/** Форма открыта */
	isOpen: boolean
}

export interface MediaReportFormEmits {
	(event: 'update:isOpen', value: boolean): void
	/** Зритель выбрал причину и отправил форму */
	(event: 'submit', report: { reason: MediaReportReason; comment: string }): void
}
