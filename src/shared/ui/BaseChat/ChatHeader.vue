<template>
	<div class="base-chat__header">
		<slot>
			<div class="base-chat__header-info">
				<div v-if="companionAvatar" class="base-chat__header-avatar">
					<BaseAvatar :src="companionAvatar" size="sm" :size-scale="sizeScale" />
				</div>
				<div class="base-chat__header-text">
					<BaseText tag="span" class="base-chat__header-title" :weight="600" :size-scale="sizeScale">{{
						title
					}}</BaseText>
					<BaseText
						tag="span"
						v-if="subtitle"
						class="base-chat__header-subtitle"
						:color="{ text: { base: 'var(--color-text-muted)' } }"
						:size-scale="sizeScale"
						>{{ subtitle }}</BaseText
					>
					<BaseText
						tag="span"
						v-if="isGroup && onlineCount > 0"
						class="base-chat__header-online"
						:color="{ text: { base: 'var(--color-accent)' } }"
						:size-scale="sizeScale"
						>{{ onlineCount }} онлайн</BaseText
					>
					<BaseText
						tag="span"
						v-if="variant === 'support'"
						class="base-chat__header-operator"
						:color="{ text: { base: 'var(--color-text-muted)' } }"
						:size-scale="sizeScale">
						<span class="base-chat__operator-dot" :class="{ 'base-chat__operator-dot--online': isOperatorOnline }" />
						{{ isOperatorOnline ? 'Оператор онлайн' : 'Оператор офлайн' }}
					</BaseText>
				</div>
			</div>
			<BaseText
				tag="span"
				v-if="isGroup"
				class="base-chat__header-members"
				:color="{ text: { base: 'var(--color-text-muted)' } }"
				:size-scale="sizeScale"
				>{{ participantsCount }} участников</BaseText
			>
		</slot>
	</div>
</template>

<script setup lang="ts">
import { BaseAvatar } from '@/shared/ui/BaseAvatar'
import { BaseText } from '@/shared/ui/BaseText'
import type { ChatVariant } from './BaseChat.types'

interface ChatHeaderProps {
	title: string
	subtitle?: string
	companionAvatar?: string
	isGroup?: boolean
	onlineCount?: number
	participantsCount?: number
	variant?: ChatVariant
	isOperatorOnline?: boolean
	sizeScale?: number
}

withDefaults(defineProps<ChatHeaderProps>(), {
	sizeScale: 100,
	onlineCount: 0,
	participantsCount: 0,
})
</script>
