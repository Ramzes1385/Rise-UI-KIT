<template>
	<BaseCard
		class="base-chat"
		:class="[`base-chat--${variant}`, { 'base-chat--group': isGroup }]"
		:size-scale="sizeScale"
		:scroll="true"
		:style="{ height: height }">
		<!-- Заголовок -->
		<ChatHeader
			v-if="hasHeader"
			:title="title"
			:subtitle="subtitle"
			:companion-avatar="companionAvatar"
			:is-group="isGroup"
			:online-count="onlineCount"
			:participants-count="safeParticipants.length"
			:variant="variant"
			:is-operator-online="isOperatorOnline"
			:size-scale="sizeScale">
			<template #default>
				<slot name="header" />
			</template>
		</ChatHeader>

		<!-- Область сообщений -->
		<div ref="messagesRef" class="base-chat__messages" @scroll="handleScroll">
			<slot name="empty">
				<BaseText
					v-if="safeMessages.length === 0"
					class="base-chat__empty"
					:color="{ text: { base: 'var(--color-text-muted)' } }"
					:size-scale="sizeScale"
					>Нет сообщений</BaseText
				>
			</slot>

			<ChatMessageComponent
				v-for="(msg, index) in safeMessages"
				:key="msg.id"
				:message="msg"
				:index="index"
				:is-group="isGroup"
				:has-image-zoom="hasImageZoom"
				:variant="variant"
				:size-scale="sizeScale"
				@image-zoom="handleImageZoom"
				@link-click="handleLinkClick"
				@reaction="handleReaction"
				@reply="handleReply">
				<template #default="slotProps">
					<slot name="message" v-bind="slotProps" />
				</template>
			</ChatMessageComponent>
		</div>

		<!-- Быстрые ответы (support) -->
		<ChatSupportInput
			v-if="variant === 'support' && safeQuickReplies.length > 0"
			:quick-replies="safeQuickReplies"
			:size-scale="sizeScale"
			@quick-reply="handleQuickReply" />

		<!-- Поле ввода -->
		<ChatInput
			v-if="hasInput"
			v-model="inputText"
			:placeholder="inputPlaceholder"
			:has-voice-input="hasVoiceInput"
			:has-attach-input="hasAttachInput"
			:size-scale="sizeScale"
			@send="handleSend"
			@send-voice="handleVoiceInput"
			@send-file="handleAttach">
			<template #default>
				<slot name="input" />
			</template>
		</ChatInput>
	</BaseCard>
</template>

<script setup lang="ts">
import { useAutoScroll } from '@/shared/composables/useAutoScroll'
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseCard } from '@/shared/ui/BaseCard'
import { BaseText } from '@/shared/ui/BaseText'
import { openExternalUrl } from '@/shared/utils/navigationUtils'
import { computed, ref } from 'vue'
import './BaseChat.style.scss'
import type { BaseChatEmits, BaseChatProps } from './BaseChat.types'
import ChatHeader from './ChatHeader.vue'
import ChatInput from './ChatInput.vue'
import ChatMessageComponent from './ChatMessage.vue'
import ChatSupportInput from './ChatSupportInput.vue'

const props = withDefaults(defineProps<BaseChatProps>(), {
	messages: () => [],
	variant: 'bubble',
	styleVariant: 'default',
	hasInput: true,
	hasHeader: true,
	title: 'Чат',
	subtitle: '',
	companionAvatar: '',
	inputPlaceholder: 'Введите сообщение...',
	height: '500px',
	isAutoScroll: true,
	participants: () => [],
	isGroup: false,
	hasVoiceInput: false,
	hasAttachInput: false,
	hasImageZoom: true,
	quickReplies: () => [],
	isOperatorOnline: false,
	sizeScale: 100,
})

const { variantStyle } = useVariant({ block: 'base-chat', getVariant: () => props.styleVariant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseChatEmits>()

const messagesRef = ref<HTMLDivElement | null>(null)
const inputText = ref('')

/** Безопасный доступ к сообщениям */
const safeMessages = computed(() => props.messages ?? [])

/** Безопасный доступ к участникам */
const safeParticipants = computed(() => props.participants ?? [])

/** Безопасный доступ к быстрым ответам */
const safeQuickReplies = computed(() => props.quickReplies ?? [])

/** Количество онлайн участников */
const onlineCount = computed((): number => safeParticipants.value.filter(p => p.isOnline).length)

/** Обработка зума изображения */
function handleImageZoom(scale: number): void {
	emit('image-zoom', scale)
}

/** Отправить сообщение */
function handleSend(): void {
	const text = inputText.value.trim()
	if (!text) return
	emit('send', text)
	inputText.value = ''
}

/** Клик по ссылке */
function handleLinkClick(url: string): void {
	emit('link-click', url)
	openExternalUrl(url)
}

/** Кнопка вложений */
function handleAttach(): void {
	emit('send-file')
}

/** Кнопка голосового ввода */
function handleVoiceInput(): void {
	emit('send-voice')
}

/** Быстрый ответ (support) */
function handleQuickReply(value: string): void {
	emit('quick-reply', value)
}

/** Реакция на сообщение (feed) */
function handleReaction(payload: { messageId: string | number; emoji: string }): void {
	emit('reaction', payload)
}

/** Ответ на сообщение (thread) */
function handleReply(messageId: string | number): void {
	emit('reply', messageId)
}

/** Автопрокрутка к низу при новых сообщениях */
useAutoScroll({
	container: messagesRef,
	enabled: () => props.isAutoScroll,
	watchSource: () => safeMessages.value.length,
})

/** Обработка скролла */
function handleScroll(): void {
	if (!messagesRef.value) return
	if (messagesRef.value.scrollTop === 0) {
		emit('scroll-top')
	}
}
</script>
