import { UI_AUDIO } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { formatMediaTime, resampleLevels } from '@utils/mediaUtils'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { computed, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'
import { canRecord, captureError, isInsecurePage, levelOf, openStream, pickMimeType, stopStream } from './voiceCapture'
import type {
	VoiceRecording,
	VoiceRecorderError,
	VoiceRecorderState,
	BaseVoiceRecorderEmits,
	BaseVoiceRecorderProps,
} from '../types/BaseVoiceRecorder.types'

const LIVE_BARS = 32

const TICK = 100

const ERROR_TEXT: Record<VoiceRecorderError['code'], () => string> = {
	denied: () => UI_AUDIO.ERROR_DENIED,
	'no-device': () => UI_AUDIO.ERROR_NO_DEVICE,
	insecure: () => UI_AUDIO.ERROR_INSECURE,
	unsupported: () => UI_AUDIO.ERROR_UNSUPPORTED,
	failed: () => UI_AUDIO.ERROR_RECORD,
}

function useLevelMeter() {
	const levels: number[] = []
	const live = ref<number[]>(Array.from({ length: LIVE_BARS }, () => 0))
	let context: AudioContext | null = null
	let frame = 0
	const loop = (analyser: AnalyserNode, data: Uint8Array<ArrayBuffer>): void => {
		analyser.getByteTimeDomainData(data)
		const level = levelOf(data)
		levels.push(level)
		live.value = [...live.value.slice(1), level]
		frame = requestAnimationFrame(() => loop(analyser, data))
	}
	return {
		levels,
		live,
		attach(stream: MediaStream): void {
			if (typeof AudioContext === 'undefined') return
			context = new AudioContext()
			const analyser = context.createAnalyser()
			analyser.fftSize = 1024
			context.createMediaStreamSource(stream).connect(analyser)
			loop(analyser, new Uint8Array(analyser.fftSize))
		},
		detach(): void {
			cancelAnimationFrame(frame)
			void context?.close().catch(() => undefined)
			context = null
		},
		reset(): void {
			levels.length = 0
			live.value = live.value.map(() => 0)
		},
	}
}

function useTimer(limit: () => number, onLimit: () => void) {
	const elapsed = ref(0)
	let timer: ReturnType<typeof setInterval> | undefined
	let startedAt = 0
	return {
		elapsed,
		start(): void {
			startedAt = Date.now()
			elapsed.value = 0
			timer = setInterval(() => {
				elapsed.value = (Date.now() - startedAt) / 1000
				if (elapsed.value >= limit()) onLimit()
			}, TICK)
		},
		stop(): number {
			clearInterval(timer)
			elapsed.value = (Date.now() - startedAt) / 1000
			return elapsed.value
		},
	}
}

function useCapture(
	props: BaseVoiceRecorderProps,
	handlers: { onStart: (stream: MediaStream) => void; onStop: (blob: Blob, mime: string) => void },
) {
	let recorder: MediaRecorder | null = null
	let stream: MediaStream | null = null
	let isCanceled = false
	return {
		async open(): Promise<void> {
			stream = await openStream(props.requestStream)
			const chunks: Blob[] = []
			recorder = new MediaRecorder(stream, { mimeType: pickMimeType(props.mimeType) || undefined })
			const mime = recorder.mimeType
			recorder.addEventListener('dataavailable', event => chunks.push(event.data))
			recorder.addEventListener('stop', () => !isCanceled && handlers.onStop(new Blob(chunks, { type: mime }), mime))
			isCanceled = false
			recorder.start()
			handlers.onStart(stream)
		},
		close(cancel: boolean): void {
			isCanceled = cancel
			if (recorder?.state !== 'inactive') recorder?.stop()
			stopStream(stream)
			recorder = null
			stream = null
		},
	}
}

function usePreview() {
	const recording = shallowRef<VoiceRecording | null>(null)
	const url = ref<string | null>(null)
	const clear = (): void => {
		if (url.value) URL.revokeObjectURL(url.value)
		url.value = null
		recording.value = null
	}
	return {
		recording,
		url,
		clear,
		show(value: VoiceRecording): void {
			clear()
			recording.value = value
			url.value = URL.createObjectURL(value.blob)
		},
	}
}

function useRecorderFlow(props: BaseVoiceRecorderProps, emit: BaseVoiceRecorderEmits) {
	const state = ref<VoiceRecorderState>('idle')
	const error = shallowRef<VoiceRecorderError | null>(null)
	const meter = useLevelMeter()
	const preview = usePreview()
	const finish = (blob: Blob, mimeType: string): void => {
		const value = { blob, mimeType, duration: timer.stop(), peaks: resampleLevels(meter.levels, props.bars ?? 48) }
		meter.detach()
		if (props.hasPreview === false) {
			state.value = 'idle'
			return emit('record', value)
		}
		preview.show(value)
		state.value = 'preview'
	}
	const capture = useCapture(props, { onStart: stream => meter.attach(stream), onStop: finish })
	const timer = useTimer(
		() => props.maxDuration ?? 300,
		() => capture.close(false),
	)
	const fail = (value: VoiceRecorderError): void => {
		error.value = value
		state.value = 'error'
		emit('error', value)
	}
	watch(state, value => emit('state-change', value))
	return { state, error, meter, preview, capture, timer, fail }
}

function useRecorderActions(props: BaseVoiceRecorderProps, emit: BaseVoiceRecorderEmits, flow: ReturnType<typeof useRecorderFlow>) {
	const { state, meter, preview, capture, timer, fail } = flow
	const reset = (): void => {
		timer.stop()
		meter.detach()
		meter.reset()
		preview.clear()
	}
	onBeforeUnmount(() => {
		capture.close(true)
		reset()
	})
	return {
		async start(): Promise<void> {
			if (props.isDisabled || state.value === 'recording' || state.value === 'requesting') return
			const hasSource = Boolean(props.requestStream)
			if (isInsecurePage(hasSource)) return fail({ code: 'insecure' })
			if (!canRecord(hasSource)) return fail({ code: 'unsupported' })
			reset()
			state.value = 'requesting'
			try {
				await capture.open()
				timer.start()
				state.value = 'recording'
			} catch (cause) {
				fail(captureError(cause))
			}
		},
		stop: (): void => capture.close(false),
		cancel(): void {
			capture.close(true)
			reset()
			state.value = 'idle'
			emit('cancel')
		},
		send(): void {
			const value = preview.recording.value as VoiceRecording
			preview.clear()
			state.value = 'idle'
			emit('record', value)
		},
	}
}

function useRecorderTexts(flow: ReturnType<typeof useRecorderFlow>) {
	const { state, error, preview, timer } = flow
	return {
		timeText: computed(() => formatMediaTime(timer.elapsed.value)),
		errorText: computed(() => (error.value ? ERROR_TEXT[error.value.code]() : '')),
		statusText: computed(() => {
			if (state.value === 'recording') return UI_AUDIO.RECORDING
			const value = preview.recording.value
			return value ? formatMessage(UI_AUDIO.RECORDED, { duration: formatMediaTime(value.duration) }) : ''
		}),
	}
}

export function useBaseVoiceRecorder(props: BaseVoiceRecorderProps, emit: BaseVoiceRecorderEmits) {
	const flow = useRecorderFlow(props, emit)
	const actions = useRecorderActions(props, emit, flow)
	return {
		...useStandardBaseComponent('base-voice-recorder', props, ['root', 'meter', 'preview']),
		...actions,
		...useRecorderTexts(flow),
		state: flow.state,
		live: flow.meter.live,
		previewUrl: flow.preview.url,
		recording: flow.preview.recording,
		exposed: reactive({ start: actions.start, stop: actions.stop, cancel: actions.cancel }),
	}
}
