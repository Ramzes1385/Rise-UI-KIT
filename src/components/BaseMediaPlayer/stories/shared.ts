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

export const DEMO_AD_BREAKS = [
	{
		id: 'pre',
		at: 'pre' as const,
		ads: [
			{
				id: 'banner',
				src: demoPoster,
				type: 'image/webp',
				duration: 3,
				skipAfter: 1,
				title: 'Rise UI Kit',
				clickUrl: 'https://example.com/',
			},
		],
	},
	{ id: 'mid', at: 6, ads: [{ id: 'clip', src: demoVideoLow, type: WEBM, skipAfter: 2 }] },
]

const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='

export function demoVastUrl(): string {
	const media = new URL(demoVideoLow, window.location.href).href
	const xml = `<VAST version="4.1"><Ad id="demo-vast"><InLine>
		<AdTitle>Демо рекламной сети</AdTitle>
		<Impression>${PIXEL}</Impression>
		<Creatives><Creative><Linear skipoffset="00:00:02">
			<Duration>00:00:12</Duration>
			<TrackingEvents><Tracking event="start">${PIXEL}</Tracking><Tracking event="complete">${PIXEL}</Tracking></TrackingEvents>
			<VideoClicks><ClickThrough>https://example.com/</ClickThrough></VideoClicks>
			<MediaFiles><MediaFile delivery="progressive" type="video/webm" width="256" height="144">${media}</MediaFile></MediaFiles>
		</Linear></Creative></Creatives>
	</InLine></Ad></VAST>`
	return URL.createObjectURL(new Blob([xml], { type: 'application/xml' }))
}

const DEMO_LOGO_ICON = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#fc0"/><path d="M14 25l7 7 13-15" fill="none" stroke="#000" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
)}`

export const DEMO_BANNERS = [
	{
		id: 'promo',
		start: 1,
		end: 11,
		text: 'Rise UI Kit — компоненты для Vue',
		href: 'https://example.com/',
		image: demoPoster,
		position: 'top-right' as const,
	},
]

export const DEMO_ACHIEVEMENTS = [
	{ id: 'first-seconds', title: 'Первые секунды', description: 'Досмотрите до второй секунды', icon: DEMO_LOGO_ICON, at: 2 },
	{ id: 'finale', title: 'До конца', description: 'Досмотрите ролик до конца', icon: DEMO_LOGO_ICON, at: 'end' as const },
]

export const DEMO_AD_SEGMENTS = [{ id: 'sponsor', start: 8, end: 10, title: 'Интеграция' }]

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

export const DEMO_AUDIO_SOURCES = [{ src: demoDubA, type: OPUS }]

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
