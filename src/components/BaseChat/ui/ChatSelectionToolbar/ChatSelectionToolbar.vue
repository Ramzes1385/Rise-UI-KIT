<template>
	<div class="base-chat-selection-toolbar">
		<div class="base-chat-selection-toolbar__info">
			<BaseText :size-scale="sizeScale" :weight="600"> Выбрано: {{ selectedCount }} </BaseText>
		</div>
		<div class="base-chat-selection-toolbar__actions">
			<BaseButton variant="ghost" :size-scale="sizeScale" @click="emit('forward')">
				<template #left>
					<BaseIcon name="reply" :size-scale="sizeScale" />
				</template>
				Переслать
			</BaseButton>
			<BaseButton
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-selection-toolbar__btn--danger"
				@click="emit('delete')">
				<template #left>
					<BaseIcon name="x-circle" :size-scale="sizeScale" />
				</template>
				Удалить
			</BaseButton>
			<BaseButton variant="ghost" :size-scale="sizeScale" @click="emit('cancel')">
				<template #left>
					<BaseIcon name="close" :size-scale="sizeScale" />
				</template>
				Отмена
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { computed } from 'vue'
import './ChatSelectionToolbar.style.scss'

interface ChatSelectionToolbarProps {
	selectedCount: number
	sizeScale?: number
}

const props = defineProps<ChatSelectionToolbarProps>()

const sizeScale = computed(() => props.sizeScale ?? 100)

const emit = defineEmits<{
	(e: 'forward'): void
	(e: 'delete'): void
	(e: 'cancel'): void
}>()
</script>
