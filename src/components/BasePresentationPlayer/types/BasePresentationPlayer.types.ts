import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты оформления BasePresentationPlayer: один — тёмный кадр плеера BaseMediaPlayer */
export const PRESENTATION_PLAYER_VARIANTS = ['default'] as const

/** Варианты оформления */
export type PresentationPlayerVariant = (typeof PRESENTATION_PLAYER_VARIANTS)[number]

/** Слайд презентации */
export interface PresentationSlide {
	/** Ключ слайда: события, сохранённый прогресс, переход между слайдами */
	id: string
	/** Название: «Слайд 3 из 12: Название», подсказка над шкалой */
	title: string
	/** Картинка слайда: относительный адрес или http:, https:, blob:, data: */
	image?: string
	/** Видео вместо картинки; без своей озвучки звук и длительность слайда берутся из видео */
	video?: string
	/** Описание картинки или видео для скринридера; без него — название слайда */
	alt?: string
	/** Озвучка слайда: слайд идёт до её конца, затем — следующий */
	audio?: string
	/** Начало слайда на общей дорожке `audio` плеера, секунды; без него — конец предыдущего слайда */
	at?: number
	/**
	 * Длительность показа слайда без озвучки, секунды: затем — следующий слайд. Без озвучки и без `duration` слайд стоит,
	 * пока его не перелистнут
	 */
	duration?: number
}

/** Данные слайда для слота `slide` */
export interface PresentationSlideSlotProps {
	/** Слайд */
	slide: PresentationSlide
	/** Номер слайда с нуля */
	index: number
}

/** Пропсы компонента BasePresentationPlayer */
export interface BasePresentationPlayerProps extends BaseComponentProps<PresentationPlayerVariant, 'root' | 'stage' | 'controls'> {
	/** Слайды по порядку */
	slides: PresentationSlide[]
	/** Название презентации: доступное имя плеера и подпись над кадром */
	title: string
	/**
	 * Общая дорожка озвучки на всю презентацию: начало каждого слайда — `slides[].at`. Своя озвучка слайдов
	 * (`slides[].audio`) при общей дорожке не используется, видео слайдов идут без звука
	 */
	audio?: string
	/** Номер текущего слайда с нуля (`v-model:slide`) */
	slide?: number
	/** Показывать название над кадром вместе с панелью */
	hasTitle?: boolean
	/** Горячие клавиши, пока фокус внутри плеера: ←/→ — слайды, Space/K — пауза, F — полный экран, M — звук, ↑/↓ — громкость */
	hasKeyboardShortcuts?: boolean
	/** Скорости в меню скорости */
	playbackRates?: number[]
	/** Пропорции кадра, CSS `aspect-ratio` */
	aspectRatio?: string
	/** Время без движения до скрытия панели во время показа, мс */
	idleTimeout?: number
	/** Атрибут `crossorigin` картинок, видео и озвучки */
	crossorigin?: 'anonymous' | 'use-credentials'
}

/** События компонента BasePresentationPlayer */
export interface BasePresentationPlayerEmits {
	/** Сменился текущий слайд: номер с нуля */
	(event: 'update:slide', index: number): void
	/** Показ запущен */
	(event: 'play'): void
	/** Показ на паузе */
	(event: 'pause'): void
}

/** Слоты компонента BasePresentationPlayer */
export interface BasePresentationPlayerSlots {
	/** Свой HTML слайда вместо картинки или видео */
	slide?: (props: PresentationSlideSlotProps) => unknown
}

/** Методы компонента через ref */
export interface BasePresentationPlayerExpose {
	/** Запустить показ */
	play: () => void
	/** Поставить на паузу */
	pause: () => void
	/** Следующий слайд */
	next: () => void
	/** Предыдущий слайд */
	previous: () => void
	/** Перейти к слайду по номеру с нуля */
	goTo: (index: number) => void
}
