/** Реплика субтитров: начало и конец в секундах, текст (строки разделены переводом строки) */
export interface SubtitleCue {
	start: number
	end: number
	text: string
}

/** Формат файла субтитров */
export type SubtitleFormat = 'vtt' | 'srt'
