<template>
	<div class="base-chat-selection-toolbar">
		<div class="base-chat-selection-toolbar__info">
			<BaseText :size-scale="sizeScale" :weight="UI_FONT_WEIGHT.SEMIBOLD"> {{ UI_CHAT_SELECTED_PREFIX }} {{ selectedCount }} </BaseText>
		</div>
		<div class="base-chat-selection-toolbar__actions">
			<BaseButton variant="ghost" :size-scale="sizeScale" @click="emit('forward')">
				<template #left>
					<BaseIcon name="reply" :size-scale="sizeScale" />
				</template>
				{{ UI_CHAT_FORWARD }}
			</BaseButton>
			<BaseButton
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-selection-toolbar__btn--danger"
				@click="emit('delete')">
				<template #left>
					<BaseIcon name="x-circle" :size-scale="sizeScale" />
				</template>
				{{ UI_CHAT_DELETE }}
			</BaseButton>
			<BaseButton variant="ghost" :size-scale="sizeScale" @click="emit('cancel')">
				<template #left>
					<BaseIcon name="close" :size-scale="sizeScale" />
				</template>
				{{ UI_CHAT_CANCEL }}
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import {
	UI_CHAT_CANCEL,
	UI_CHAT_DELETE,
	UI_CHAT_FORWARD,
	UI_CHAT_SELECTED_PREFIX,
	UI_FONT_WEIGHT,
	SIZE_SCALE_DEFAULT,
} from '@constants'
import './ChatSelectionToolbar.style.scss'

import type { ChatSelectionToolbarEmits, ChatSelectionToolbarProps } from '../../model/ChatSelectionToolbar.types'

withDefaults(defineProps<ChatSelectionToolbarProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<ChatSelectionToolbarEmits>()
</script>
