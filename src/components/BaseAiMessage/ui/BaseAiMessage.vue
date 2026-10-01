<template>
	<article
		class="base-ai-message"
		:class="[variantClass, classes.root, { 'base-ai-message--error': error }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="name || UI_AI.ASSISTANT"
		:aria-busy="isStreaming ? 'true' : undefined">
		<span class="base-ai-message__avatar" aria-hidden="true">
			<img v-if="avatar" class="base-ai-message__avatar-image" :src="avatar" alt="" />
			<BaseIcon v-else name="star-filled" />
		</span>
		<div class="base-ai-message__body" :class="classes.body">
			<div class="base-ai-message__header">
				<span class="base-ai-message__name">{{ name || UI_AI.ASSISTANT }}</span>
				<time v-if="time" class="base-ai-message__time">{{ time }}</time>
			</div>
			<slot />
			<BaseMarkdown v-if="content" class="base-ai-message__content" :source="content" :is-streaming="isStreaming" variant="ghost" />
			<BaseLoader
				v-else-if="isStreaming"
				class="base-ai-message__typing"
				variant="dots"
				:size-scale="(sizeScale * 75) / 100"
				aria-hidden="true" />
			<p v-if="error" class="base-ai-message__error" role="alert">
				<BaseIcon name="alert-triangle" />
				{{ error }}
				<BaseButton
					variant="ghost"
					class="base-ai-message__action base-ai-message__action--retry"
					:size-scale="sizeScale"
					@click="retry">
					<template #left><BaseIcon name="rotate-ccw" /></template>
					{{ UI_AI.RETRY }}
				</BaseButton>
			</p>
			<div v-if="!isStreaming && (hasCopy || $slots.actions)" class="base-ai-message__actions">
				<BaseButton v-if="hasCopy && content" variant="ghost" class="base-ai-message__action" :size-scale="sizeScale" @click="copy">
					<template #left><BaseIcon :name="isCopied ? 'check' : 'copy'" /></template>
					{{ isCopied ? UI_AI.COPIED : UI_AI.COPY }}
				</BaseButton>
				<slot name="actions" />
			</div>
			<span class="base-ai-message__status" role="status">{{ isStreaming ? UI_AI.GENERATING : '' }}</span>
		</div>
	</article>
</template>

<script setup lang="ts">
import '../styles/BaseAiMessage.style.scss'
import { UI_AI } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { BaseMarkdown } from '@components/BaseMarkdown'
import { useBaseAiMessage } from '../model/useBaseAiMessage'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseAiMessageEmits, BaseAiMessageProps, BaseAiMessageSlots } from '../types/BaseAiMessage.types'

const props = withDefaults(defineProps<BaseAiMessageProps>(), {
	content: '',
	isStreaming: false,
	hasCopy: true,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseAiMessageEmits>()

defineSlots<BaseAiMessageSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, isCopied, copy, retry } = useBaseAiMessage(props, emit)
</script>
