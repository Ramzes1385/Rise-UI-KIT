<template>
	<div
		class="base-voice-recorder"
		:class="[variantClass, `base-voice-recorder--${state}`, { 'base-voice-recorder--disabled': isDisabled }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<template v-if="state === 'recording' || state === 'requesting'">
			<span class="base-voice-recorder__dot" aria-hidden="true"></span>
			<span class="base-voice-recorder__time">{{ timeText }}</span>
			<span class="base-voice-recorder__meter" :class="classes.meter" aria-hidden="true">
				<span
					v-for="(level, index) in live"
					:key="index"
					class="base-voice-recorder__level"
					:style="{ height: `${Math.max(level, 0.06) * 100}%` }"></span>
			</span>
			<BaseButton variant="ghost" :size-scale="sizeScale" :aria-label="UI_AUDIO.CANCEL" @click="cancel">
				<template #left><BaseIcon name="close" /></template>
			</BaseButton>
			<BaseButton :size-scale="sizeScale" :aria-label="UI_AUDIO.STOP" :is-disabled="state === 'requesting'" @click="stop">
				<template #left><BaseIcon name="stop" /></template>
			</BaseButton>
		</template>
		<template v-else-if="state === 'preview' && previewUrl && recording">
			<BaseAudioPlayer
				class="base-voice-recorder__preview"
				:class="classes.preview"
				:src="previewUrl"
				:title="UI_AUDIO.PREVIEW"
				:peaks="recording.peaks"
				:duration="recording.duration"
				:playback-rates="[]"
				variant="ghost"
				:size-scale="sizeScale" />
			<BaseButton variant="ghost" :size-scale="sizeScale" :aria-label="UI_AUDIO.DELETE" @click="cancel">
				<template #left><BaseIcon name="trash" /></template>
			</BaseButton>
			<BaseButton :size-scale="sizeScale" :aria-label="UI_AUDIO.SEND" @click="send">
				<template #left><BaseIcon name="send" /></template>
			</BaseButton>
		</template>
		<template v-else>
			<p v-if="state === 'error'" class="base-voice-recorder__error">{{ errorText }}</p>
			<BaseButton variant="soft" :size-scale="sizeScale" :aria-label="UI_AUDIO.RECORD" :is-disabled="isDisabled" @click="start">
				<template #left><BaseIcon name="mic" /></template>
			</BaseButton>
		</template>
		<span class="base-voice-recorder__status" role="status">{{ statusText }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseVoiceRecorder.style.scss'
import { UI_AUDIO } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseAudioPlayer } from '@components/BaseAudioPlayer'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseVoiceRecorder } from '../model/useBaseVoiceRecorder'
import type { BaseVoiceRecorderEmits, BaseVoiceRecorderProps } from '../types/BaseVoiceRecorder.types'

const props = withDefaults(defineProps<BaseVoiceRecorderProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
	maxDuration: 300,
	bars: 48,
	hasPreview: true,
})

const emit = defineEmits<BaseVoiceRecorderEmits>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	state,
	live,
	previewUrl,
	recording,
	timeText,
	errorText,
	statusText,
	start,
	stop,
	cancel,
	send,
	exposed,
} = useBaseVoiceRecorder(props, emit)

defineExpose(exposed)
</script>
