<template>
	<div class="base-chat-selection-toolbar">
		<div class="base-chat-selection-toolbar__surface" role="group" :aria-label="UI_CHAT_TEXT.SELECTION_TOOLBAR">
			<span class="base-chat-selection-toolbar__info" aria-live="polite">{{
				formatMessage(UI_CHAT_TEXT.SELECTED_COUNT, { count: selectedCount })
			}}</span>
			<div class="base-chat-selection-toolbar__actions">
				<BaseButton
					variant="ghost"
					:size-scale="sizeScale"
					is-focusable-when-disabled
					:is-disabled="(visibleSelectedCount ?? selectedCount) >= totalCount"
					@click="emit('select-all')">
					<template #left>
						<BaseIcon name="check" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
					</template>
					{{ UI_CHAT_TEXT.SELECT_ALL }}
				</BaseButton>
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
import { formatMessage } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { CHAT_SCALE } from '../../model/chatScale'
import { BaseButton } from '@components/BaseButton'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { ChatSelectionToolbarEmits, ChatSelectionToolbarProps } from '../../types/ChatSelectionToolbar.types'

withDefaults(defineProps<ChatSelectionToolbarProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
	totalCount: Infinity,
})

const emit = defineEmits<ChatSelectionToolbarEmits>()
</script>
