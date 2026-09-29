import type { Ref } from 'vue'
import { computed, nextTick, ref } from 'vue'
import type { ChatInputEmits, ChatInputProps } from '../types/ChatInput.types'
import type { BaseVoiceRecorderExpose, VoiceRecorderState, VoiceRecording } from '@components/BaseVoiceRecorder'

export function useChatVoice(props: ChatInputProps, emit: ChatInputEmits, draft: { text: Ref<string>; attachments: Ref<unknown[]> }) {
	const isVoiceMode = ref(false)
	const voiceState = ref<VoiceRecorderState>('idle')
	const recorderRef = ref<BaseVoiceRecorderExpose | null>(null)
	const closeVoice = (): void => {
		isVoiceMode.value = false
		voiceState.value = 'idle'
	}
	return {
		isVoiceMode,
		voiceState,
		recorderRef,
		closeVoice,
		canRecordVoice: computed(() => Boolean(props.hasVoice) && !draft.text.value.trim() && draft.attachments.value.length === 0),
		async startVoice(): Promise<void> {
			isVoiceMode.value = true
			await nextTick()
			await recorderRef.value?.start()
		},
		handleVoiceState(state: VoiceRecorderState): void {
			if (state === 'idle') closeVoice()
			else voiceState.value = state
		},
		handleVoiceRecord: (recording: VoiceRecording): void => emit('send-voice', recording),
	}
}
