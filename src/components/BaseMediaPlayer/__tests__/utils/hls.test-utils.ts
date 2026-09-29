import { vi } from 'vitest'
import type { MediaHlsLevel, MediaHlsTrack, MediaHlsErrorData } from '../../types/playback/MediaHls.types'

type Listener = (event: string, data: MediaHlsErrorData) => void

export class FakeHls {
	static isSupported = vi.fn(() => true)
	static instances: FakeHls[] = []
	levels: MediaHlsLevel[] = [{ height: 360, bitrate: 800_000 }, { height: 1080, bitrate: 5_000_000 }, { bitrate: 128_000 }]
	audioTracks: MediaHlsTrack[] = [{ name: 'Японский', lang: 'ja' }, { lang: 'ru' }, {}]
	audioTrack = 0
	subtitleDisplay = true
	manualLevel = -1
	playingLevel = 0
	listeners = new Map<string, Listener[]>()
	loadSource = vi.fn()
	attachMedia = vi.fn()
	startLoad = vi.fn()
	recoverMediaError = vi.fn()
	destroy = vi.fn()

	config: Record<string, unknown>

	constructor(config: Record<string, unknown>) {
		this.config = config
		FakeHls.instances.push(this)
	}

	get currentLevel(): number {
		return this.manualLevel === -1 ? this.playingLevel : this.manualLevel
	}

	set currentLevel(level: number) {
		this.manualLevel = level
	}

	get autoLevelEnabled(): boolean {
		return this.manualLevel === -1
	}

	on(event: string, listener: Listener): void {
		this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener])
	}

	emit(event: string, data: MediaHlsErrorData = { fatal: false, type: '' }): void {
		this.listeners.get(event)?.forEach(listener => listener(event, data))
	}

	static reset(): void {
		FakeHls.instances = []
		FakeHls.isSupported.mockReturnValue(true)
	}

	static last(): FakeHls {
		return FakeHls.instances[FakeHls.instances.length - 1]
	}
}
