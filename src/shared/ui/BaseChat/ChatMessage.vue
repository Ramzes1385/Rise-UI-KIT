<template>
	<div
		class="base-chat__message"
		:class="[`base-chat__message--${message.sender}`, `base-chat__message--${message.type || 'text'}`]">
		<slot :message="message" :index="index">
			<!-- Аватар -->
			<div v-if="message.sender === 'other' && message.senderAvatar" class="base-chat__avatar">
				<BaseAvatar :src="message.senderAvatar" :name="message.senderName" size="sm" :size-scale="sizeScale" />
			</div>

			<!-- Пузырь сообщения -->
			<div class="base-chat__bubble">
				<!-- Ответ на сообщение (thread) -->
				<div v-if="message.replyToText" class="base-chat__reply">
					<BaseText
						tag="span"
						v-if="message.replyToName"
						class="base-chat__reply-name"
						:weight="600"
						:color="{ text: { base: 'var(--color-accent)' } }"
						:size-scale="sizeScale"
						>{{ message.replyToName }}</BaseText
					>
					<BaseText tag="span" class="base-chat__reply-text" :size-scale="sizeScale">{{
						message.replyToText
					}}</BaseText>
				</div>

				<BaseText
					tag="span"
					v-if="message.senderName && message.sender === 'other' && isGroup"
					class="base-chat__sender"
					:weight="600"
					:color="{ text: { base: 'var(--color-accent)' } }"
					:size-scale="sizeScale">
					{{ message.senderName }}
				</BaseText>

				<!-- Текст -->
				<BaseText v-if="message.text" class="base-chat__text" :size-scale="sizeScale">{{ message.text }}</BaseText>

				<!-- Изображение -->
				<BaseImage
					v-if="message.imageUrl"
					:src="message.imageUrl"
					alt=""
					class="base-chat__image"
					:has-zoom="hasImageZoom"
					border-radius="md"
					:size-scale="sizeScale"
					@zoom="handleImageZoom" />

				<!-- Превью ссылки -->
				<a
					v-if="message.linkPreview"
					:href="message.linkPreview.url"
					target="_blank"
					rel="noopener noreferrer"
					class="base-chat__link"
					@click.prevent="handleLinkClick(message.linkPreview.url)">
					<BaseImage
						v-if="message.linkPreview.image"
						:src="message.linkPreview.image"
						alt=""
						class="base-chat__link-image"
						border-radius="sm"
						:size-scale="sizeScale" />
					<div class="base-chat__link-info">
						<BaseText
							tag="span"
							v-if="message.linkPreview.title"
							class="base-chat__link-title"
							:weight="600"
							:size-scale="sizeScale"
							>{{ message.linkPreview.title }}</BaseText
						>
						<BaseText
							tag="span"
							v-if="message.linkPreview.description"
							class="base-chat__link-desc"
							:size-scale="sizeScale"
							>{{ message.linkPreview.description }}</BaseText
						>
						<BaseText tag="span" class="base-chat__link-url" :size-scale="sizeScale">{{
							formatUrl(message.linkPreview.url)
						}}</BaseText>
					</div>
				</a>

				<!-- Индикатор набора -->
				<div v-if="message.type === 'typing'" class="base-chat__typing"><span></span><span></span><span></span></div>

				<!-- Мета: время + статус -->
				<div class="base-chat__meta">
					<BaseText tag="span" v-if="message.time" class="base-chat__time" :size-scale="sizeScale">{{
						message.time
					}}</BaseText>
					<BaseText
						tag="span"
						v-if="message.status && message.sender === 'me'"
						class="base-chat__status"
						:size-scale="sizeScale">
						{{ statusIcon(message.status) }}
					</BaseText>
				</div>

				<!-- Реакции (feed) -->
				<div v-if="message.reactions && message.reactions.length > 0" class="base-chat__reactions">
					<BaseButton
						v-for="reaction in message.reactions"
						:key="reaction.emoji"
						variant="ghost"
						class="base-chat__reaction"
						:class="{ 'base-chat__reaction--mine': reaction.isMine }"
						:size-scale="sizeScale"
						@click="handleReaction(message.id, reaction.emoji)">
						{{ reaction.emoji }}
						<BaseText
							tag="span"
							v-if="reaction.count > 1"
							class="base-chat__reaction-count"
							:color="{ text: { base: 'var(--color-text-muted)' } }"
							:size-scale="sizeScale"
							>{{ reaction.count }}</BaseText
						>
					</BaseButton>
				</div>
			</div>

			<!-- Кнопка ответа (thread) -->
			<BaseButton
				v-if="variant === 'thread'"
				variant="ghost"
				class="base-chat__reply-btn"
				:size-scale="sizeScale"
				@click="handleReply(message.id)">
				<BaseIcon name="reply" size="sm" :size-scale="sizeScale" />
			</BaseButton>
		</slot>
	</div>
</template>

<script setup lang="ts">
import { BaseAvatar } from '@/shared/ui/BaseAvatar'
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseImage } from '@/shared/ui/BaseImage'
import { BaseText } from '@/shared/ui/BaseText'
import { formatMessageStatus, formatUrl } from '@/shared/utils/formatUtils'
import type { ChatMessage, ChatMessageStatus, ChatVariant } from './BaseChat.types'

interface ChatMessageProps {
	message: ChatMessage
	index: number
	isGroup?: boolean
	hasImageZoom?: boolean
	variant?: ChatVariant
	sizeScale?: number
}

const props = withDefaults(defineProps<ChatMessageProps>(), {
	sizeScale: 100,
})

const emit = defineEmits<{
	(event: 'image-zoom', scale: number): void
	(event: 'link-click', url: string): void
	(event: 'reaction', payload: { messageId: string | number; emoji: string }): void
	(event: 'reply', messageId: string | number): void
}>()

function statusIcon(status: ChatMessageStatus): string {
	return formatMessageStatus(status)
}

function handleImageZoom(scale: number): void {
	emit('image-zoom', scale)
}

function handleLinkClick(url: string): void {
	emit('link-click', url)
}

function handleReaction(messageId: string | number, emoji: string): void {
	emit('reaction', { messageId, emoji })
}

function handleReply(messageId: string | number): void {
	emit('reply', messageId)
}
</script>
