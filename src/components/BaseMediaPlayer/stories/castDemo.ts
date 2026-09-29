type Listener = () => void

type DemoPlayer = { isConnected: boolean; isPaused: boolean; currentTime: number; duration: number }

type DemoRequest = { media: { contentId: string }; currentTime?: number; autoplay?: boolean }

const DEMO_DEVICE = 'Демо-телевизор'

const TICK = 250

function listenerMap() {
	const listeners = new Map<string, Set<Listener>>()
	return {
		add: (type: string, listener: Listener): void => {
			listeners.set(type, (listeners.get(type) ?? new Set()).add(listener))
		},
		remove: (type: string, listener: Listener): void => {
			listeners.get(type)?.delete(listener)
		},
		emit: (type: string): void => listeners.get(type)?.forEach(listener => listener()),
	}
}

function probeDuration(src: string, onDuration: (duration: number) => void): void {
	const probe = document.createElement('video')
	probe.preload = 'metadata'
	probe.muted = true
	probe.addEventListener('loadedmetadata', () => onDuration(probe.duration), { once: true })
	probe.src = src
}

function createReceiver() {
	const context = listenerMap()
	const controller = listenerMap()
	const player: DemoPlayer = { isConnected: false, isPaused: true, currentTime: 0, duration: 0 }
	const receiver = { state: 'NOT_CONNECTED', isSession: false, timer: 0 }
	const changed = (): void => controller.emit('anyChanged')
	const setState = (state: string): void => {
		receiver.state = state
		context.emit('caststatechanged')
	}
	const tick = (): void => {
		if (!player.isConnected || player.isPaused) return
		player.currentTime = Math.min(player.currentTime + TICK / 1000, player.duration || Number.POSITIVE_INFINITY)
		if (player.duration && player.currentTime >= player.duration) player.isPaused = true
		changed()
	}
	return { context, controller, player, receiver, changed, setState, tick }
}

function sessionFor(demo: ReturnType<typeof createReceiver>) {
	const { player, receiver, changed } = demo
	return {
		getCastDevice: () => ({ friendlyName: DEMO_DEVICE }),
		loadMedia: async (request: DemoRequest): Promise<void> => {
			Object.assign(player, { isConnected: true, isPaused: !request.autoplay, currentTime: request.currentTime ?? 0 })
			probeDuration(request.media.contentId, duration => {
				player.duration = duration
				changed()
			})
			window.clearInterval(receiver.timer)
			receiver.timer = window.setInterval(demo.tick, TICK)
			changed()
		},
	}
}

function contextFor(demo: ReturnType<typeof createReceiver>) {
	const session = sessionFor(demo)
	const { player, receiver } = demo
	return {
		setOptions: (): void => undefined,
		getCastState: () => receiver.state,
		addEventListener: demo.context.add,
		removeEventListener: demo.context.remove,
		getCurrentSession: () => (receiver.isSession ? session : null),
		requestSession: async (): Promise<void> => {
			demo.setState('CONNECTING')
			await new Promise(resolve => window.setTimeout(resolve, 400))
			receiver.isSession = true
			demo.setState('CONNECTED')
		},
		endCurrentSession: (): void => {
			window.clearInterval(receiver.timer)
			receiver.isSession = false
			Object.assign(player, { isConnected: false, isPaused: true })
			demo.changed()
			demo.setState('NOT_CONNECTED')
		},
	}
}

function chromeCast() {
	return {
		AutoJoinPolicy: { ORIGIN_SCOPED: 'origin_scoped' },
		Image: class {
			url: string
			constructor(url: string) {
				this.url = url
			}
		},
		media: {
			DEFAULT_MEDIA_RECEIVER_APP_ID: 'CC1AD845',
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
				currentTime = 0
				autoplay = true
				constructor(media: unknown) {
					this.media = media
				}
			},
		},
	}
}

export function installDemoCast(): () => void {
	const win = window as unknown as { cast?: unknown; chrome?: Record<string, unknown> }
	if (win.cast) return () => undefined
	const demo = createReceiver()
	const context = contextFor(demo)
	win.cast = {
		framework: {
			CastContext: { getInstance: () => context },
			CastContextEventType: { CAST_STATE_CHANGED: 'caststatechanged' },
			CastState: { NO_DEVICES_AVAILABLE: 'NO_DEVICES_AVAILABLE', CONNECTING: 'CONNECTING', CONNECTED: 'CONNECTED' },
			RemotePlayer: function RemotePlayer() {
				return demo.player
			},
			RemotePlayerController: function RemotePlayerController() {
				return {
					addEventListener: demo.controller.add,
					removeEventListener: demo.controller.remove,
					playOrPause: () => {
						demo.player.isPaused = !demo.player.isPaused
						demo.changed()
					},
					seek: demo.changed,
				}
			},
			RemotePlayerEventType: { ANY_CHANGE: 'anyChanged' },
		},
	}
	win.chrome = Object.assign(win.chrome ?? {}, { cast: chromeCast() })
	return () => {
		window.clearInterval(demo.receiver.timer)
		Reflect.deleteProperty(win, 'cast')
		Reflect.deleteProperty(win.chrome ?? {}, 'cast')
	}
}
