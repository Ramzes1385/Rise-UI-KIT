import { vi } from 'vitest'

class FakeRecorder extends EventTarget {
	static instances: FakeRecorder[] = []
	static isTypeSupported = vi.fn((type: string) => type.startsWith('audio/webm'))
	state: 'inactive' | 'recording' | 'paused' = 'inactive'
	mimeType: string
	stream: MediaStream

	constructor(stream: MediaStream, options?: { mimeType?: string }) {
		super()
		this.stream = stream
		this.mimeType = options?.mimeType ?? 'audio/webm'
		FakeRecorder.instances.push(this)
	}

	start(): void {
		this.state = 'recording'
	}

	stop(): void {
		this.state = 'inactive'
		this.dispatchEvent(Object.assign(new Event('dataavailable'), { data: new Blob(['voice'], { type: this.mimeType }) }))
		this.dispatchEvent(new Event('stop'))
	}
}

export function installRecorderEnvironment() {
	const track = { stop: vi.fn() }
	const stream = { getTracks: () => [track] } as unknown as MediaStream
	const getUserMedia = vi.fn(async (_constraints: { audio: boolean }) => stream)
	const close = vi.fn(async () => undefined)
	FakeRecorder.instances = []
	Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } })
	vi.stubGlobal('MediaRecorder', FakeRecorder)
	vi.stubGlobal(
		'AudioContext',
		vi.fn(function AudioContext() {
			return {
				createAnalyser: () => ({ fftSize: 0, getByteTimeDomainData: (data: Uint8Array) => data.fill(160) }),
				createMediaStreamSource: () => ({ connect: vi.fn() }),
				close,
			}
		}),
	)
	let frames = 0
	vi.stubGlobal(
		'requestAnimationFrame',
		vi.fn((callback: (time: number) => void) => {
			if (frames++ < 2) callback(frames)
			return frames
		}),
	)
	vi.stubGlobal('cancelAnimationFrame', vi.fn())
	const createObjectURL = vi.fn(() => 'blob:recording')
	const revokeObjectURL = vi.fn()
	Object.assign(URL, { createObjectURL, revokeObjectURL })
	return {
		track,
		stream,
		getUserMedia,
		close,
		createObjectURL,
		revokeObjectURL,
		recorder: () => FakeRecorder.instances.at(-1) as FakeRecorder,
	}
}

export function removeRecorderEnvironment(): void {
	Reflect.deleteProperty(navigator, 'mediaDevices')
	vi.unstubAllGlobals()
}
