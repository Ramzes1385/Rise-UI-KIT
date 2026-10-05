import slideVoice1 from './media/slide-voice-1.webm'
import slideVoice2 from './media/slide-voice-2.webm'
import slideVoice3 from './media/slide-voice-3.webm'
import { placeholderImage } from '@/stories/helpers'
import slideCaptions1 from './media/slide-captions-1.vtt'
import slideCaptions2 from './media/slide-captions-2.vtt'
import slideCaptions3 from './media/slide-captions-3.vtt'
import presentationVoice from './media/presentation-voice.webm'
import type { PresentationSlide } from '../types/BasePresentationPlayer.types'

export const PRESENTATION_VOICE = presentationVoice

export const SLIDE_VOICES = [slideVoice1, slideVoice2, slideVoice3] as const

const SLIDE_CAPTIONS = [slideCaptions1, slideCaptions2, slideCaptions3] as const

const SLIDE_NOTES = [
	'Мы делаем курсы для новых сотрудников.\n\nЗа первую неделю вы узнаете, как устроена работа и к кому идти с вопросами.',
	'Наши ценности — ясность, забота и честность.\n\nЯсность — короткие письма и понятные задачи. Забота — о коллегах и клиентах.',
	'',
] as const

export const SLIDE_SPEECH = [
	'Здравствуйте! Это курс знакомства с компанией.',
	'Наши ценности: ясность, забота и честность.',
	'Команда — двенадцать человек в трёх городах.',
] as const

const SLIDES = [
	{ id: 'intro', title: 'Кто мы', hue: 24, alt: 'Горы на рассвете — обложка курса' },
	{ id: 'values', title: 'Наши ценности', hue: 200, alt: 'Горы в тумане — три ценности компании' },
	{ id: 'team', title: 'Команда', hue: 140, alt: 'Зелёная долина — состав команды' },
] as const

const slideImage = (hue: number): string => placeholderImage({ width: 1280, height: 720, hue })

export function voicedSlides(extra: Partial<PresentationSlide> = {}): PresentationSlide[] {
	return SLIDES.map(({ hue, ...slide }, index) => ({ ...slide, image: slideImage(hue), audio: SLIDE_VOICES[index], ...extra }))
}

export function sharedTrackSlides(): PresentationSlide[] {
	return SLIDES.map(({ hue, ...slide }, index) => ({ ...slide, image: slideImage(hue), at: index * 3 }))
}

export function textSlides(duration: number): PresentationSlide[] {
	return SLIDES.map(({ id, title }) => ({ id, title, duration }))
}

export function captionedSlides(): PresentationSlide[] {
	return voicedSlides().map((slide, index) => ({ ...slide, captions: SLIDE_CAPTIONS[index] }))
}

export function notedSlides(extra: Partial<PresentationSlide> = {}): PresentationSlide[] {
	return voicedSlides(extra).map((slide, index) => (SLIDE_NOTES[index] ? { ...slide, notes: SLIDE_NOTES[index] } : slide))
}

export function spokenSlides(duration?: number): PresentationSlide[] {
	return SLIDES.map(({ hue, ...slide }, index) => ({ ...slide, image: slideImage(hue), speech: SLIDE_SPEECH[index], duration }))
}
