import { vi } from 'vitest'

type Listener = () => void

type RemoteRecord = Record<string, unknown>

const REMOTE_EVENTS: Record<string, string> = { connected: 'connect', connecting: 'connecting', disconnected: 'disconnect' }

function listenerMap() {
	const listeners = new Map<string, Listener[]>()
	return {
		add: (type: string, listener: Listener): void => {
			listeners.set(type, [...(listeners.get(type) ?? []), listener])
		},
		emit: (type: string): void => listeners.get(type)?.forEach(listener => listener()),
	}
}

function createContext(initialState: string) {
	const listeners = listenerMap()
	const session = { loadMedia: vi.fn(async (_request: unknown) => undefined), getCastDevice: () => ({ friendlyName: 'Гостиная' }) }
	const state = { cast: initialState, session: null as typeof session | null }
	const context = {
		setOptions: vi.fn(),
		getCastState: vi.fn(() => state.cast),
		addEventListener: listeners.add,
		removeEventListener: vi.fn(),
		requestSession: vi.fn(async () => {
			state.session = session
		}),
		getCurrentSession: () => state.session,
		endCurrentSession: vi.fn(),
	}
	return { context, session, state, emit: listeners.emit }
}

function mediaClasses() {
	return {
		Image: class {
			url: string
			constructor(url: string) {
				this.url = url
			}
		},
		MediaInfo: class {
			contentId: string
			contentType: string
			metadata?: unknown
			constructor(contentId: string, contentType: string) {
				this.contentId = contentId
				this.contentType = contentType
			}
		},
		GenericMediaMetadata: class {
			title?: string
			images?: unknown[]
		},
		LoadRequest: class {
			media: unknown
			currentTime?: number
			autoplay?: boolean
			constructor(media: unknown) {
				this.media = media
			}
		},
	}
}

function createRemote() {
	const listeners = listenerMap()
	const players: RemoteRecord[] = []
	const controller = { addEventListener: listeners.add, removeEventListener: vi.fn(), playOrPause: vi.fn(), seek: vi.fn() }
	class RemotePlayer {
		isConnected = false
		isPaused = true
		currentTime = 0
		duration = 0
		constructor() {
			players.push(this as unknown as RemoteRecord)
		}
	}
	return { players, controller, RemotePlayer, emit: listeners.emit }
}

export function installCastSdk(initialState = 'NOT_CONNECTED') {
	const { context, session, state, emit } = createContext(initialState)
	const remote = createRemote()
	const { Image, ...media } = mediaClasses()
	Object.assign(window, {
		cast: {
			framework: {
				CastContext: { getInstance: () => context },
				CastContextEventType: { CAST_STATE_CHANGED: 'caststatechanged' },
				CastState: { NO_DEVICES_AVAILABLE: 'NO_DEVICES_AVAILABLE', CONNECTING: 'CONNECTING', CONNECTED: 'CONNECTED' },
				RemotePlayer: remote.RemotePlayer,
				RemotePlayerController: function RemotePlayerController() {
					return remote.controller
				},
				RemotePlayerEventType: { ANY_CHANGE: 'anyChanged' },
			},
		},
		chrome: {
			cast: {
				AutoJoinPolicy: { ORIGIN_SCOPED: 'origin_scoped' },
				Image,
				media: { DEFAULT_MEDIA_RECEIVER_APP_ID: 'CC1AD845', ...media },
			},
		},
	})
	return {
		context,
		session,
		state,
		controller: remote.controller,
		players: remote.players,
		setCastState(value: string): void {
			state.cast = value
			emit('caststatechanged')
		},
		updateRemote(patch: RemoteRecord): void {
			Object.assign(remote.players[remote.players.length - 1], patch)
			remote.emit('anyChanged')
		},
	}
}

export function removeCastSdk(): void {
	Reflect.deleteProperty(window, 'cast')
	Reflect.deleteProperty(window, 'chrome')
	Reflect.deleteProperty(window, '__onGCastApiAvailable')
}

export function fakeRemote(element: HTMLMediaElement, options: { isAvailable?: boolean; isSupported?: boolean } = {}) {
	const remote = new EventTarget() as EventTarget & RemoteRecord
	let availability: ((available: boolean) => void) | undefined
	Object.assign(remote, {
		state: 'disconnected',
		watchAvailability: vi.fn(async (callback: (available: boolean) => void) => {
			if (options.isSupported === false) throw new DOMException('not supported', 'NotSupportedError')
			availability = callback
			callback(options.isAvailable ?? true)
			return 7
		}),
		cancelWatchAvailability: vi.fn(async () => undefined),
		prompt: vi.fn(async () => undefined),
	})
	Object.defineProperty(element, 'remote', { configurable: true, value: remote })
	return {
		remote,
		setAvailable: (value: boolean) => availability?.(value),
		setState(value: string): void {
			remote.state = value
			remote.dispatchEvent(new Event(REMOTE_EVENTS[value]))
		},
	}
}
