import type { MediaIconName } from './MediaIcon.types'
import type { MediaAudioOption } from '../content/MediaAudio.types'
import type { MediaQualityOption } from '../playback/MediaHls.types'
import type { MediaCaptionOption, MediaCaptionStyle } from '../content/MediaSubtitles.types'

/**
 * Кнопка панели плеера в стиле VideoStack: иконка 24px, подсказка над кнопкой (у крайних кнопок — по краю), короткий текст рядом
 * («1,5×», «720p») или под иконкой («10» у перемотки), счётчик в кружке
 */
export interface MediaControlButtonProps {
	/** Иконка */
	icon: MediaIconName
	/** Доступное имя и текст подсказки */
	label: string
	/** Подсказка, если она подробнее доступного имени: «Озвучка: AniLibria» */
	tooltip?: string
	/** Короткий текст справа от иконки: текущая скорость, качество */
	text?: string
	/** Текст под иконкой: секунды перемотки */
	caption?: string
	/** Число на значке: количество серий */
	badge?: number
	/** Кнопка-переключатель: `aria-pressed` */
	isPressed?: boolean
	/** Кнопка раскрывает панель, и она открыта (`aria-expanded`): подсказка не показывается, чтобы не закрывать панель */
	ariaExpanded?: boolean
	/** Кнопка включена (подсветка иконки), без `aria-pressed`: например, субтитры у кнопки меню */
	isActive?: boolean
}

/** Компактный переключатель панели («Автовоспроизведение»): подпись — в подсказке и доступном имени */
export interface MediaSwitchProps {
	/** Подпись: подсказка над переключателем и доступное имя */
	label: string
	/** Включён (`v-model:is-checked`) */
	isChecked: boolean
}

export interface MediaSwitchEmits {
	(event: 'update:isChecked', value: boolean): void
}

/** Откуда меню скорости, качества, субтитров и озвучки берут значения и куда сообщают выбор */
export interface MediaMenusSource {
	/** Текущая скорость: текст на кнопке */
	rate: () => number
	/** Варианты качества: источники с подписью или уровни потока */
	qualities: () => MediaQualityOption[]
	activeQualityId: () => string | undefined
	selectQuality: (id: string) => void
	/** Озвучки */
	audioOptions: () => MediaAudioOption[]
	activeAudioId: () => string | null | undefined
	selectAudio: (id: string | null) => void
	/** Дорожки субтитров */
	captionTracks: () => MediaCaptionOption[]
	/** Выбранная дорожка; null — выключены */
	activeCaptionId: () => string | null
	selectCaption: (id: string | null) => void
	/** Пункт «Загрузить файл субтитров…» */
	canLoadCaptions: () => boolean
	loadCaptions: () => void
	/** Оформление субтитров */
	captionStyle: () => MediaCaptionStyle
	updateCaptionStyle: (patch: Partial<MediaCaptionStyle>) => void
}
