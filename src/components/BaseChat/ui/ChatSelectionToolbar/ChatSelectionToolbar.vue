<template>
	<div class="base-chat-selection-toolbar">
		<div class="base-chat-selection-toolbar__surface" role="group" :aria-label="UI_CHAT_TEXT.SELECTION_TOOLBAR">
			<span class="base-chat-selection-toolbar__info" aria-live="polite">{{ UI_CHAT_TEXT.SELECTED_PREFIX }} {{ selectedCount }}</span>
			<div class="base-chat-selection-toolbar__actions">
				<BaseButton variant="ghost" :size-scale="sizeScale" @click="emit('forward')">
					<template #left>
						<BaseIcon name="reply" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
					</template>
					{{ UI_CHAT_TEXT.FORWARD }}
				</BaseButton>
				<BaseButton
					variant="ghost"
					:size-scale="sizeScale"
					class="base-chat-selection-toolbar__btn--danger"
					@click="emit('delete')">
					<template #left>
						<BaseIcon name="trash" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
					</template>
					{{ UI_CHAT_TEXT.DELETE }}
				</BaseButton>
				<BaseButton variant="ghost" :size-scale="sizeScale" @click="emit('cancel')">
					<template #left>
						<BaseIcon name="close" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
					</template>
					{{ UI_CHAT_TEXT.CANCEL }}
				</BaseButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import './ChatSelectionToolbar.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { CHAT_SCALE } from '../../model/chatScale'
import { BaseButton } from '@components/BaseButton'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { ChatSelectionToolbarEmits, ChatSelectionToolbarProps } from '../../types/ChatSelectionToolbar.types'

withDefaults(defineProps<ChatSelectionToolbarProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<ChatSelectionToolbarEmits>()
</script>
