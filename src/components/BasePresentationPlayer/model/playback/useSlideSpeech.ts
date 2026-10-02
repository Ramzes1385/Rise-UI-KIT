import type { SlideSpeechOptions } from '../../types/PresentationModel.types'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

function synth(): SpeechSynthesis | null {
	return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
}

const VOICES_WAIT_MS = 1500

function useVoices() {
	const voices = shallowRef<SpeechSynthesisVoice[]>([])
	const hasGivenUp = ref(false)
	let timer: ReturnType<typeof setTimeout> | undefined
	const update = (): void => {
		voices.value = synth()?.getVoices() ?? []
	}
	onMounted(() => {
		update()
		synth()?.addEventListener?.('voiceschanged', update)
		timer = setTimeout(() => (hasGivenUp.value = true), VOICES_WAIT_MS)
	})
	onBeforeUnmount(() => {
		clearTimeout(timer)
		synth()?.removeEventListener?.('voiceschanged', update)
	})
	return {
		voices,
		isReady: computed(() => voices.value.length > 0),
		isMissing: computed(() => !synth() || (hasGivenUp.value && voices.value.length === 0)),
	}
}

function pickVoice(voices: SpeechSynthesisVoice[], options: SlideSpeechOptions): SpeechSynthesisVoice | undefined {
	const wanted = options.voice()
	const lang = options.lang().toLowerCase()
	return (
		voices.find(voice => wanted && (voice.name === wanted || voice.voiceURI === wanted)) ??
		voices.find(voice => voice.lang.toLowerCase().startsWith(lang))
	)
}

export function useSlideSpeech(options: SlideSpeechOptions) {
	const { voices, isReady, isMissing } = useVoices()
	const utterance = shallowRef<SpeechSynthesisUtterance | null>(null)
	const hasText = computed(() => Boolean(options.text()?.trim()))
	const isAvailable = computed(() => hasText.value && isReady.value)
	const stop = (): void => {
		utterance.value = null
		synth()?.cancel()
	}
	const speak = (): void => {
		const next = new SpeechSynthesisUtterance(options.text() ?? '')
		const voice = pickVoice(voices.value, options)
		next.lang = voice?.lang ?? options.lang()
		if (voice) next.voice = voice
		next.rate = options.rate()
		next.volume = options.isMuted() ? 0 : options.volume()
		next.onend = () => {
			if (utterance.value !== next) return
			utterance.value = null
			options.onEnd()
		}
		utterance.value = next
		synth()?.speak(next)
	}
	const sync = (): void => {
		const engine = synth()
		if (!engine || !isAvailable.value) return
		if (!options.isRunning()) return engine.pause()
		if (utterance.value) return engine.resume()
		speak()
	}
	watch(options.key, stop)
	watch([options.key, options.isRunning, isAvailable], sync, { flush: 'post' })
	onBeforeUnmount(stop)

	return { isSpeech: computed(() => hasText.value && !isMissing.value) }
}
