<template>
	<div v-if="pinnedMessages && pinnedMessages.length > 0" class="base-chat-pinned-panel">
		<button type="button" class="base-chat-pinned-panel__content" @click="handlePanelClick">
			<BaseIcon name="pin" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-pinned-panel__pin-icon" />
			<span class="base-chat-pinned-panel__text-wrapper">
				<span class="base-chat-pinned-panel__title">
					{{ UI_CHAT_TEXT.PINNED_MESSAGE }}
					{{ pinnedMessages.length > 1 ? `(${currentIndex + 1} ${UI_CHAT_TEXT.PINNED_COUNTER} ${pinnedMessages.length})` : '' }}
				</span>
				<span class="base-chat-pinned-panel__preview">{{ currentMessageText }}</span>
			</span>
		</button>

		<div class="base-chat-pinned-panel__actions">
			<template v-if="pinnedMessages.length > 1">
				<BaseButton
					variant="ghost"
					:size-scale="sizeScale"
					class="base-chat-pinned-panel__nav-btn"
					:aria-label="UI_CHAT_TEXT.PREV_PINNED_ARIA"
					@click="handlePrev">
					<BaseIcon name="chevron-up" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
				</BaseButton>
				<BaseButton
					variant="ghost"
					:size-scale="sizeScale"
					class="base-chat-pinned-panel__nav-btn"
					:aria-label="UI_CHAT_TEXT.NEXT_PINNED_ARIA"
					@click="handleNext">
					<BaseIcon name="chevron-down" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
				</BaseButton>
			</template>

			<BaseButton
				v-if="currentUserRole === 'admin'"
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-pinned-panel__unpin-btn"
				:aria-label="UI_CHAT_TEXT.UNPIN_ARIA"
				@click="handleUnpin">
				<BaseIcon name="close" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import './ChatPinnedPanel.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { CHAT_SCALE } from '../../model/chatScale'
import { BaseButton } from '@components/BaseButton'
import { useChatPinnedPanel } from '../../model/useChatPinnedPanel'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { ChatPinnedPanelEmits, ChatPinnedPanelProps } from '../../types/ChatPinnedPanel.types'

const props = withDefaults(defineProps<ChatPinnedPanelProps>(), {
	currentUserRole: 'member',
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<ChatPinnedPanelEmits>()

const { currentMessageText, handlePrev, handleNext, handlePanelClick, handleUnpin } = useChatPinnedPanel(props, emit)
</script>
