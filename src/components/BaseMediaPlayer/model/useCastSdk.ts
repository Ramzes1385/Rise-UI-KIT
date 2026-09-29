import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue'
import type { MediaCastApi, MediaCastWindow, MediaChromeCast, MediaCastOptions, MediaCastRemotePlayer } from '../types/MediaCast.types'

const CONTENT_TYPES: Array<[RegExp, string]> = [
	[/\.m3u8(?:[?#]|$)/i, 'application/x-mpegURL'],
	[/\.mpd(?:[?#]|$)/i, 'application/dash+xml'],
	[/\.webm(?:[?#]|$)/i, 'video/webm'],
]

function castApi(): MediaCastApi | null {
	const win = window as unknown as MediaCastWindow
	const framework = win.cast?.framework
	const chromeCast = win.chrome?.cast
	return framework && chromeCast ? { framework, chromeCast } : null
}

function contentType(src: string): string {
	return CONTENT_TYPES.find(([pattern]) => pattern.test(src))?.[1] ?? 'video/mp4'
}

function absolute(url: string): string {
	return new URL(url, window.location.href).href
}

function whenCastReady(callback: () => void): () => void {
	if (castApi()) {
		callback()
		return () => undefined
	}
	const win = window as unknown as MediaCastWindow
	const previous = win.__onGCastApiAvailable
	let isActive = true
	win.__onGCastApiAvailable = isAvailable => {
		previous?.(isAvailable)
		if (isAvailable && isActive) callback()
	}
	return () => {
		isActive = false
	}
}

function useRemoteState(options: MediaCastOptions) {
	const remote = reactive({ isConnected: false, isPaused: true, currentTime: 0, duration: 0 })
	const last = { time: 0, isPlaying: false }
	return {
		remote,
		sync(player: MediaCastRemotePlayer): void {
			const wasConnected = remote.isConnected
			Object.assign(remote, {
				isConnected: player.isConnected,
				isPaused: player.isPaused,
				currentTime: player.currentTime,
				duration: player.duration,
			})
			if (player.isConnected) Object.assign(last, { time: player.currentTime, isPlaying: !player.isPaused })
			else if (wasConnected) options.resumeLocal(last.time, last.isPlaying)
		},
	}
}

function loadRequest(api: { chromeCast: MediaChromeCast }, options: MediaCastOptions, startAt: number): unknown | null {
	const { source, title, poster } = options.content()
	if (!source) return null
	const cast = api.chromeCast
	const info = new cast.media.MediaInfo(absolute(source.src), source.type ?? contentType(source.src))
	const metadata = new cast.media.GenericMediaMetadata()
	metadata.title = title
	if (poster) metadata.images = [new cast.Image(absolute(poster))]
	info.metadata = metadata
	const request = new cast.media.LoadRequest(info)
	request.currentTime = startAt
	request.autoplay = true
	return request
}

async function loadMedia(api: MediaCastApi, options: MediaCastOptions, startAt: number): Promise<void> {
	const session = api.framework.CastContext.getInstance().getCurrentSession()
	const request = loadRequest(api, options, startAt)
	if (!session || !request) return
	options.pauseLocal()
	await session.loadMedia(request).catch(() => undefined)
}

function connectCast(
	found: MediaCastApi,
	options: MediaCastOptions,
	handlers: { onState: (state: string) => void; onRemote: (player: MediaCastRemotePlayer, device: string) => void },
) {
	const { framework, chromeCast } = found
	const context = framework.CastContext.getInstance()
	context.setOptions({
		receiverApplicationId: options.receiverId() ?? chromeCast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
		autoJoinPolicy: chromeCast.AutoJoinPolicy.ORIGIN_SCOPED,
	})
	const player = new framework.RemotePlayer()
	const controller = new framework.RemotePlayerController(player)
	const syncState = (): void => handlers.onState(context.getCastState())
	const syncRemote = (): void => handlers.onRemote(player, context.getCurrentSession()?.getCastDevice().friendlyName ?? '')
	syncState()
	context.addEventListener(framework.CastContextEventType.CAST_STATE_CHANGED, syncState)
	controller.addEventListener(framework.RemotePlayerEventType.ANY_CHANGE, syncRemote)
	return {
		player,
		controller,
		disconnect(): void {
			context.removeEventListener(framework.CastContextEventType.CAST_STATE_CHANGED, syncState)
			controller.removeEventListener(framework.RemotePlayerEventType.ANY_CHANGE, syncRemote)
		},
	}
}

function useCastControls(
	options: MediaCastOptions,
	api: Readonly<{ value: MediaCastApi | null }>,
	connection: () => ReturnType<typeof connectCast> | null,
) {
	return {
		async startCast(): Promise<void> {
			const found = api.value
			if (!found) return
			const isConnected = await found.framework.CastContext.getInstance()
				.requestSession()
				.then(
					() => true,
					() => false,
				)
			if (isConnected) await loadMedia(found, options, options.state.currentTime)
		},
		loadCast(startAt: number): void {
			const current = connection()
			if (api.value && current?.player.isConnected) void loadMedia(api.value, options, startAt)
		},
		stopCast(): void {
			api.value?.framework.CastContext.getInstance().endCurrentSession(true)
		},
		castPlayOrPause(): void {
			connection()?.controller.playOrPause()
		},
		castSeek(time: number): void {
			const current = connection()
			if (!current) return
			const { duration } = current.player
			current.player.currentTime = Math.max(0, duration > 0 ? Math.min(time, duration) : time)
			current.controller.seek()
		},
	}
}

export function useCastSdk(options: MediaCastOptions) {
	const api = shallowRef<MediaCastApi | null>(null)
	const castState = ref('')
	const deviceName = ref('')
	const remoteState = useRemoteState(options)
	let connection: ReturnType<typeof connectCast> | null = null
	let stopWaiting: (() => void) | undefined
	onMounted(() => {
		stopWaiting = whenCastReady(() => {
			const found = castApi() as MediaCastApi
			connection = connectCast(found, options, {
				onState: state => {
					castState.value = state
				},
				onRemote: (player, device) => {
					remoteState.sync(player)
					deviceName.value = device
				},
			})
			api.value = found
		})
	})
	onBeforeUnmount(() => {
		stopWaiting?.()
		connection?.disconnect()
	})

	return {
		...useCastControls(options, api, () => connection),
		isCastAvailable: computed(() => api.value !== null && castState.value !== api.value.framework.CastState.NO_DEVICES_AVAILABLE),
		isCastConnected: computed(() => remoteState.remote.isConnected),
		castRemote: remoteState.remote,
		castDevice: deviceName,
	}
}
