import slideVoice1 from './media/slide-voice-1.webm'
import slideVoice2 from './media/slide-voice-2.webm'
import slideVoice3 from './media/slide-voice-3.webm'
import { placeholderImage } from '@/stories/helpers'
import presentationVoice from './media/presentation-voice.webm'
import type { PresentationSlide } from '../types/BasePresentationPlayer.types'

export const PRESENTATION_VOICE = presentationVoice

const SLIDE_VOICES = [slideVoice1, slideVoice2, slideVoice3] as const

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
