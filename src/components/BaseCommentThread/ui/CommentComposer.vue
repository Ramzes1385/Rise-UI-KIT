<template>
	<form :class="[ui('composer'), { 'base-comment-thread__composer--reply': isReply }]" @submit.prevent="submit">
		<span v-if="author" :class="ui('avatar')" aria-hidden="true">
			<BaseAvatar :src="author.avatar" :name="author.name" :size-scale="sizeScale" />
		</span>
		<div class="base-comment-thread__composer-body">
			<BaseTextarea
				ref="textareaRef"
				v-model="draft"
				:aria-label="label"
				:placeholder="placeholder"
				:rows="2"
				is-autosize
				:size-scale="sizeScale"
				@keydown="handleKeydown" />
			<div class="base-comment-thread__composer-actions">
				<BaseButton v-if="isReply" variant="ghost" :size-scale="buttonScale" @click="cancel">
					{{ UI_COMMENT_THREAD.CANCEL }}
				</BaseButton>
				<BaseButton type="submit" :size-scale="buttonScale" :is-disabled="!canSend">{{ UI_COMMENT_THREAD.SEND }}</BaseButton>
			</div>
		</div>
	</form>
</template>

<script setup lang="ts">
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { UI_COMMENT_THREAD } from '@/locales/messages'
import { BaseTextarea } from '@components/BaseTextarea'
import { useCommentComposer } from '../model/useCommentComposer'
import type { CommentComposerEmits, CommentComposerProps } from '../types/CommentComposer.types'

const props = defineProps<CommentComposerProps>()

const emit = defineEmits<CommentComposerEmits>()

const { ui, draft, buttonScale, textareaRef, canSend, submit, cancel, handleKeydown } = useCommentComposer(props, emit)
</script>
