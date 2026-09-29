import demoVideo from './media/demo.webm'
import demoDubA from './media/demo-dub-a.webm'
import demoDubB from './media/demo-dub-b.webm'
import demoVideoLow from './media/demo-144.webm'
import demoPoster from './media/demo-poster.webp'
import demoSubtitlesRu from './media/demo.ru.vtt'
import demoSubtitlesEn from './media/demo.en.srt?url'

const WEBM = 'video/webm; codecs="vp9, opus"'

export const DEMO_SOURCES = [{ src: demoVideo, type: WEBM, label: '270p' }]

export const DEMO_QUALITIES = [
	{ src: demoVideo, type: WEBM, label: '270p' },
	{ src: demoVideoLow, type: WEBM, label: '144p' },
]

export const DEMO_POSTER = demoPoster

const DEMO_CHAPTERS = [
	{ start: 0, title: 'Пролог' },
	{ start: 2, end: 5, title: 'Опенинг', kind: 'intro' as const },
	{ start: 5, title: 'Серия' },
	{ start: 10, title: 'Эндинг', kind: 'outro' as const },
]

export const DEMO_PLAYLISTS = [
	{
		id: 'season-1',
		title: 'Сезон 1',
		episodes: [
			{ id: 's1e1', title: 'Серия 1. Начало', sources: DEMO_SOURCES, chapters: DEMO_CHAPTERS },
			{ id: 's1e2', title: 'Серия 2. Дорога', sources: DEMO_QUALITIES, chapters: DEMO_CHAPTERS },
		],
	},
	{ id: 'season-2', title: 'Сезон 2', episodes: [{ id: 's2e1', title: 'Серия 1. Возвращение', sources: DEMO_SOURCES }] },
]

const OPUS = 'audio/webm; codecs="opus"'

export const DEMO_AUDIO_TRACKS = [
	{ label: 'Оригинал' },
	{ src: demoDubA, label: 'Озвучка A (330 Гц)', srclang: 'ru', type: OPUS, isDefault: true },
	{ src: demoDubB, label: 'Озвучка B (550 Гц)', srclang: 'en', type: OPUS },
]

export const DEMO_TRACKS = [
	{ src: demoSubtitlesRu, label: 'Русский', srclang: 'ru', isDefault: true },
	{ src: demoSubtitlesEn, label: 'English', srclang: 'en' },
]

export const DEMO_LOGO = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="32" viewBox="0 0 96 32"><circle cx="16" cy="16" r="12" fill="none" stroke="white" stroke-width="4"/><text x="36" y="23" fill="white" font-family="sans-serif" font-size="18" font-weight="700">RISE</text></svg>',
)}`

export const MISSING_SOURCE = '/__story-missing-media__.webm'

export function storyVideo(canvasElement: HTMLElement): HTMLVideoElement {
	return canvasElement.querySelector('video') as HTMLVideoElement
}
