import type { MediaState, MediaElementRef, MediaSourceItem } from './MediaCore.types'

/** Состояние подключения к телевизору */
export type MediaCastState = 'disconnected' | 'connecting' | 'connected'

/** Удалённый плеер Google Cast: состояние на телевизоре */
export interface MediaCastRemotePlayer {
	isConnected: boolean
	isPaused: boolean
	currentTime: number
	duration: number
}

interface MediaCastRemoteController {
	addEventListener: (type: string, listener: () => void) => void
	removeEventListener: (type: string, listener: () => void) => void
	playOrPause: () => void
	seek: () => void
}

interface MediaCastSession {
	loadMedia: (request: unknown) => Promise<unknown>
	getCastDevice: () => { friendlyName: string }
}

interface MediaCastContext {
	setOptions: (options: Record<string, unknown>) => void
	getCastState: () => string
	addEventListener: (type: string, listener: () => void) => void
	removeEventListener: (type: string, listener: () => void) => void
	requestSession: () => Promise<unknown>
	getCurrentSession: () => MediaCastSession | null
	endCurrentSession: (stopCasting: boolean) => void
}

/** Нужная плееру часть `cast.framework` из скрипта Google Cast */
interface MediaCastFramework {
	CastContext: { getInstance: () => MediaCastContext }
	CastContextEventType: { CAST_STATE_CHANGED: string }
	CastState: { NO_DEVICES_AVAILABLE: string; CONNECTING: string; CONNECTED: string }
	RemotePlayer: new () => MediaCastRemotePlayer
	RemotePlayerController: new (player: MediaCastRemotePlayer) => MediaCastRemoteController
	RemotePlayerEventType: { ANY_CHANGE: string }
}

/** Нужная плееру часть `chrome.cast` */
export interface MediaChromeCast {
	AutoJoinPolicy: { ORIGIN_SCOPED: string }
	Image: new (url: string) => unknown
	media: {
		DEFAULT_MEDIA_RECEIVER_APP_ID: string
		MediaInfo: new (contentId: string, contentType: string) => { metadata?: unknown }
		GenericMediaMetadata: new () => { title?: string; images?: unknown[] }
		LoadRequest: new (mediaInfo: unknown) => { currentTime?: number; autoplay?: boolean }
	}
}

/** Загруженный скрипт Google Cast */
export interface MediaCastApi {
	framework: MediaCastFramework
	chromeCast: MediaChromeCast
}

/** Окно с загруженным скриптом Google Cast */
export interface MediaCastWindow {
	cast?: { framework?: MediaCastFramework }
	chrome?: { cast?: MediaChromeCast }
	__onGCastApiAvailable?: (isAvailable: boolean) => void
}

/** Что показать на телевизоре */
export interface MediaCastContent {
	source: MediaSourceItem | null | undefined
	title: string
	poster?: string
}

export interface MediaCastOptions {
	media: MediaElementRef
	state: Readonly<MediaState>
	/** Приложение-приёмник Google Cast; по умолчанию стандартный Default Media Receiver */
	receiverId: () => string | undefined
	content: () => MediaCastContent
	/** Продолжить на этом устройстве с позиции телевизора */
	resumeLocal: (time: number, isPlaying: boolean) => void
	pauseLocal: () => void
}
