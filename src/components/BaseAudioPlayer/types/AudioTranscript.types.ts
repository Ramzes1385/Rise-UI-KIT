/** Состояние загрузки расшифровки: нет, загружается, готова, не загрузилась */
export type AudioTranscriptStatus = 'idle' | 'loading' | 'ready' | 'error'

/** Реплика расшифровки: время в секундах, говорящий из `<v Имя>` и текст без тегов */
export interface AudioTranscriptCue {
	index: number
	start: number
	end: number
	speaker: string
	text: string
}

/** Кусок текста реплики: `isMatch` — совпадение с поиском, подсвечивается */
export interface AudioTranscriptPart {
	text: string
	isMatch: boolean
}

/** Реплика для шаблона: время подписью, куски говорящего и текста для подсветки, текущая ли */
export interface AudioTranscriptItem extends AudioTranscriptCue {
	time: string
	speakerParts: AudioTranscriptPart[]
	parts: AudioTranscriptPart[]
	isCurrent: boolean
}

/** Что панели расшифровки нужно от плеера: позиция, длительность и перемотка */
export interface AudioTranscriptPlayback {
	currentTime: () => number
	duration: () => number
	seek: (time: number) => void
}

/** Что прокрутке панели нужно знать: видимые реплики, индекс текущей, открыта ли панель */
export interface AudioTranscriptScrollSource {
	items: () => AudioTranscriptItem[]
	current: () => number
	isOpen: () => boolean
}
