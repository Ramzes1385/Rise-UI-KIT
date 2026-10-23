import type {
	VastContext,
	MediaVastFile,
	MediaAdTracking,
	MediaAdCreative,
	MediaVastOptions,
	MediaAdTrackingEvent,
} from '../../types/overlays/MediaAds.types'

const DEFAULT_MAX_DEPTH = 5

const WRAPPER_ERROR = 301

const NO_ADS_ERROR = 303

const NO_MEDIA_ERROR = 403

const TIME = /^(\d+):(\d{2}):(\d{2}(?:\.\d+)?)$/

const TRACKING_EVENTS = new Set<MediaAdTrackingEvent>([
	'start',
	'firstQuartile',
	'midpoint',
	'thirdQuartile',
	'complete',
	'skip',
	'pause',
	'resume',
	'mute',
	'unmute',
])

function text(element: Element | null | undefined): string {
	return element?.textContent?.trim() ?? ''
}

function texts(root: Element, selector: string): string[] {
	return [...root.querySelectorAll(selector)].map(text).filter(Boolean)
}

export function parseVastTime(value: string | null | undefined): number | undefined {
	const match = TIME.exec(value?.trim() ?? '')
	return match ? Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) : undefined
}

function parseSkip(offset: string | null, duration: number | undefined): number | undefined {
	const percent = /^(\d+(?:\.\d+)?)%$/.exec(offset?.trim() ?? '')
	return percent ? ((duration ?? 0) * Number(percent[1])) / 100 : parseVastTime(offset)
}

export function mergeTracking(base: MediaAdTracking, extra: MediaAdTracking): MediaAdTracking {
	const events = new Set([...Object.keys(base), ...Object.keys(extra)]) as Set<MediaAdTrackingEvent>
	return Object.fromEntries([...events].map(event => [event, [...(base[event] ?? []), ...(extra[event] ?? [])]]))
}

function collectTracking(root: Element): MediaAdTracking {
	const tracking: MediaAdTracking = {
		impression: texts(root, 'Impression'),
		error: texts(root, ':scope > Error'),
		click: texts(root, 'VideoClicks > ClickTracking'),
	}
	for (const element of root.querySelectorAll('Linear TrackingEvents > Tracking')) {
		const event = element.getAttribute('event') as MediaAdTrackingEvent
		if (TRACKING_EVENTS.has(event) && text(element)) tracking[event] = [...(tracking[event] ?? []), text(element)]
	}
	return tracking
}

function pickMediaFile(linear: Element, options: MediaVastOptions): MediaVastFile | null {
	const files = [...linear.querySelectorAll('MediaFiles > MediaFile')]
		.filter(file => file.getAttribute('delivery') !== 'streaming' && !file.getAttribute('apiFramework'))
		.map(file => ({ src: text(file), type: file.getAttribute('type') ?? '', width: Number(file.getAttribute('width')) || 0 }))
		.filter(file => file.src && file.type && options.canPlay(file.type))
		.sort((a, b) => a.width - b.width)
	return files.find(file => file.width >= options.width) ?? files[files.length - 1] ?? null
}

function parseInline(ad: Element, inline: Element, context: VastContext): MediaAdCreative | null {
	const { options } = context
	const tracking = mergeTracking(context.inherited, collectTracking(inline))
	const linear = inline.querySelector('Creatives > Creative > Linear')
	const media = linear && pickMediaFile(linear, options)
	if (!linear || !media) {
		options.onError(tracking.error ?? [], NO_MEDIA_ERROR)
		return null
	}
	const duration = parseVastTime(text(linear.querySelector('Duration')))
	return {
		id: ad.getAttribute('id') ?? undefined,
		src: media.src,
		type: media.type,
		duration,
		skipAfter: parseSkip(linear.getAttribute('skipoffset'), duration),
		clickUrl: text(linear.querySelector('VideoClicks > ClickThrough')) || undefined,
		title: text(inline.querySelector('AdTitle')) || undefined,
		tracking,
	}
}

async function resolveAd(ad: Element, context: VastContext): Promise<MediaAdCreative | null> {
	const { options } = context
	const inline = ad.querySelector(':scope > InLine')
	if (inline) return parseInline(ad, inline, context)
	const wrapper = ad.querySelector(':scope > Wrapper')
	const next = text(wrapper?.querySelector('VASTAdTagURI'))
	const tracking = mergeTracking(context.inherited, wrapper ? collectTracking(wrapper) : {})
	if (!next || context.depth >= (options.maxDepth ?? DEFAULT_MAX_DEPTH)) {
		options.onError(tracking.error ?? [], WRAPPER_ERROR)
		return null
	}
	const ads = await resolveDocument(next, { depth: context.depth + 1, inherited: tracking, options })
	return ads[0] ?? null
}

async function resolveDocument(url: string, context: VastContext): Promise<MediaAdCreative[]> {
	const { options, inherited } = context
	let xml: string
	try {
		xml = await options.fetchXml(url)
	} catch {
		options.onError(inherited.error ?? [], WRAPPER_ERROR)
		return []
	}
	const document = new DOMParser().parseFromString(xml, 'application/xml')
	const ads = [...document.querySelectorAll('VAST > Ad')]
	const pod = ads
		.filter(ad => ad.hasAttribute('sequence'))
		.sort((a, b) => Number(a.getAttribute('sequence')) - Number(b.getAttribute('sequence')))
	const chosen = pod.length > 0 ? pod : ads.slice(0, 1)
	if (chosen.length === 0)
		options.onError([...(inherited.error ?? []), ...texts(document.documentElement, ':scope > Error')], NO_ADS_ERROR)
	const resolved = await Promise.all(chosen.map(ad => resolveAd(ad, context)))
	return resolved.filter((ad): ad is MediaAdCreative => ad !== null)
}

export function resolveVast(url: string, options: MediaVastOptions): Promise<MediaAdCreative[]> {
	return resolveDocument(url, { depth: 0, inherited: {}, options })
}

function playhead(seconds: number): string {
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const rest = (seconds % 60).toFixed(3).padStart(6, '0')
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${rest}`
}

export function trackingUrl(url: string, macros: { errorCode?: number; adTime?: number }): string {
	const values: Record<string, string> = {
		CACHEBUSTING: String(Math.floor(Math.random() * 1e8)).padStart(8, '0'),
		TIMESTAMP: encodeURIComponent(new Date().toISOString()),
		ERRORCODE: String(macros.errorCode ?? 900),
		ADPLAYHEAD: encodeURIComponent(playhead(macros.adTime ?? 0)),
	}
	return url.replace(/\[(CACHEBUSTING|TIMESTAMP|ERRORCODE|ADPLAYHEAD)\]/g, (_, name: string) => values[name])
}

export function sendPixels(urls: string[] | undefined, macros: { errorCode?: number; adTime?: number } = {}): void {
	for (const url of urls ?? []) {
		const image = new Image()
		image.src = trackingUrl(url, macros)
	}
}
