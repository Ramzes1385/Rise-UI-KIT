import type { MediaAudioOption } from './MediaAudio.types'
import type { MediaQualityOption } from './MediaHls.types'
import type { MediaCaptionOption, MediaCaptionStyle } from './MediaSubtitles.types'

export interface MediaSettingsMenuProps {
	/** Скорости на выбор */
	rates: number[]
	/** Текущая скорость */
	rate: number
	/** Варианты качества: источники с подписью или уровни потока; меню качества появляется, когда их хотя бы два */
	qualities: MediaQualityOption[]
	/** Выбранное качество */
	activeQualityId?: string
	/** Дорожки субтитров; пункт «Субтитры» есть, если дорожки есть или можно загрузить файл */
	captionTracks?: MediaCaptionOption[]
	/** Выбранная дорожка субтитров; null — выключены */
	activeCaptionId?: string | null
	/** Оформление субтитров: пункт «Вид субтитров» появляется вместе с дорожками */
	captionStyle?: MediaCaptionStyle
	/** Пункт «Загрузить файл субтитров…» */
	canLoadCaptions?: boolean
	/** Озвучки; пункт «Озвучка» появляется, когда их хотя бы две */
	audioOptions?: MediaAudioOption[]
	/** Выбранная озвучка */
	activeAudioId?: string | null
}

export interface MediaSettingsMenuEmits {
	/** Выбрана скорость */
	(event: 'select-rate', rate: number): void
	/** Выбрано качество */
	(event: 'select-quality', id: string): void
	/** Выбрана дорожка субтитров или «Выкл» (null) */
	(event: 'select-caption', id: string | null): void
	/** Выбран пункт «Загрузить файл субтитров…» */
	(event: 'load-captions'): void
	/** Изменено оформление субтитров */
	(event: 'update-caption-style', patch: Partial<MediaCaptionStyle>): void
	/** Выбрана озвучка */
	(event: 'select-audio', id: string | null): void
}
