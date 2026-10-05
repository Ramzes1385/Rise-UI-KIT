export const SPEECH_STUB_MS = 1200

export interface SpeechStubLog {
	spoken: string[]
	paused: number
	cancelled: number
}

interface StubUtterance {
	text: string
	lang: string
	rate: number
	volume: number
	voice: unknown
	onend: (() => void) | null
}

const STUB_VOICE = { name: 'Rise Story', voiceURI: 'rise-story-ru', lang: 'ru-RU', default: true, localService: true }

let activeLog: SpeechStubLog = { spoken: [], paused: 0, cancelled: 0 }

export const speechStubLog = (): SpeechStubLog => activeLog

export function installSpeechStub(): () => void {
	const log: SpeechStubLog = { spoken: [], paused: 0, cancelled: 0 }
	activeLog = log
	const target = window as unknown as Record<string, unknown>
	const saved = {
		synth: Object.getOwnPropertyDescriptor(window, 'speechSynthesis'),
		utterance: Object.getOwnPropertyDescriptor(window, 'SpeechSynthesisUtterance'),
	}
	let timer: ReturnType<typeof setTimeout> | undefined
	let current: StubUtterance | null = null
	let left = 0
	let startedAt = 0
	const finish = (): void => {
		const done = current
		current = null
		done?.onend?.()
	}
	const run = (ms: number): void => {
		startedAt = Date.now()
		left = ms
		timer = setTimeout(finish, ms)
	}
	const synth = {
		getVoices: () => [STUB_VOICE],
		addEventListener: () => undefined,
		removeEventListener: () => undefined,
		speak(utterance: StubUtterance) {
			clearTimeout(timer)
			log.spoken.push(utterance.text)
			current = utterance
			run(SPEECH_STUB_MS)
		},
		pause() {
			log.paused += 1
			clearTimeout(timer)
			left = Math.max(0, left - (Date.now() - startedAt))
		},
		resume() {
			if (current) run(left)
		},
		cancel() {
			log.cancelled += 1
			clearTimeout(timer)
			current = null
		},
	}
	class Utterance implements StubUtterance {
		lang = ''
		rate = 1
		volume = 1
		voice: unknown = null
		onend: (() => void) | null = null
		text: string
		constructor(text: string) {
			this.text = text
		}
	}
	Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true, writable: true })
	Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Utterance, configurable: true, writable: true })
	return () => {
		clearTimeout(timer)
		for (const [key, name] of [
			['synth', 'speechSynthesis'],
			['utterance', 'SpeechSynthesisUtterance'],
		] as const) {
			const descriptor = saved[key]
			if (descriptor) Object.defineProperty(window, name, descriptor)
			else delete target[name]
		}
	}
}
