import type { MediaIconName } from './MediaIcon.types'
import type { MediaAudioOption } from './MediaAudio.types'
import type { MediaQualityOption } from './MediaHls.types'
import type { MediaCaptionOption, MediaCaptionStyle } from './MediaSubtitles.types'

/**
 * Кнопка панели плеера в стиле VideoStack: иконка 24px, подсказка над кнопкой (у крайних кнопок — по краю), короткий текст рядом
 * («1,5×», «720p») или под иконкой («10» у перемотки), счётчик в кружке
 */
export interface MediaControlButtonProps {
	/** Иконка */
	icon: MediaIconName
	/** Доступное имя и текст подсказки */
	label: string
	/** Короткий текст справа от иконки: текущая скорость, качество */
	text?: string
	/** Текст под иконкой: секунды перемотки */
	caption?: string
	/** Число в кружке: количество серий */
	badge?: number
	/** Кнопка-переключатель: `aria-pressed` */
	isPressed?: boolean
	/** Кнопка включена (подсветка иконки), без `aria-pressed`: например, субтитры у кнопки меню */
	isActive?: boolean
}

/** Переключатель второго ряда панели: «Автовоспроизведение» */
export interface MediaSwitchProps {
	/** Подпись */
	label: string
	/** Включён (`v-model:is-checked`) */
	isChecked: boolean
}

export interface MediaSwitchEmits {
	(event: 'update:isChecked', value: boolean): void
}

/** Откуда меню скорости, качества, субтитров и озвучки берут значения и куда сообщают выбор */
export interface MediaMenusSource {
	/** Скорости на выбор */
	rates: () => number[]
	/** Текущая скорость */
	rate: () => number
	selectRate: (rate: number) => void
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
