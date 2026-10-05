<template>
	<li :class="ui('comment')">
		<article :class="ui('card')" :aria-labelledby="authorId">
			<span :class="ui('avatar')" aria-hidden="true">
				<BaseAvatar :src="comment.author.avatar" :name="comment.author.name" :size-scale="sizeScale" />
			</span>
			<div class="base-comment-thread__content">
				<div :class="ui('meta')">
					<span :id="authorId" :class="ui('author')">{{ comment.author.name }}</span>
					<span v-if="parentAuthor" class="base-comment-thread__reply-to">
						<BaseIcon name="reply" :size-scale="sizeScale * 0.75" aria-hidden="true" />
						<span class="base-comment-thread__sr-only">{{ UI_COMMENT_THREAD.IN_REPLY_TO }}</span>
						{{ parentAuthor }}
					</span>
					<time :class="ui('time')" :datetime="iso">{{ time }}</time>
				</div>
				<p :class="ui('text')">{{ comment.text }}</p>
				<div :class="ui('actions')">
					<BaseButton
						class="base-comment-thread__like"
						variant="ghost"
						:size-scale="sizeScale * 0.75"
						:aria-pressed="Boolean(comment.isLiked)"
						@click="toggleLike">
						{{ likeText }}
					</BaseButton>
					<BaseButton
						v-if="!isReadonly"
						ref="replyButtonRef"
						variant="ghost"
						:size-scale="sizeScale * 0.75"
						:aria-expanded="isReplying"
						@click="openReply">
						{{ UI_COMMENT_THREAD.REPLY }}
					</BaseButton>
					<BaseButton
						v-if="replies.length"
						variant="ghost"
						:size-scale="sizeScale * 0.75"
						:aria-expanded="!isCollapsed"
						:aria-controls="repliesId"
						@click="toggleReplies">
						{{ repliesText }}
					</BaseButton>
				</div>
				<CommentComposer
					v-if="isReplying"
					:label="replyLabel"
					:placeholder="UI_COMMENT_THREAD.PLACEHOLDER"
					is-reply
					:size-scale="sizeScale"
					@submit="submitReply"
					@cancel="cancelReply" />
			</div>
		</article>
		<Transition name="base-comment-thread-expand" :css="!isMotionReduced">
			<div v-if="replies.length" v-show="!isCollapsed" class="base-comment-thread__replies-expand">
				<div class="base-comment-thread__replies-body">
					<TransitionGroup
						:id="repliesId"
						tag="ul"
						name="base-comment-thread-item"
						:css="!isMotionReduced"
						:class="[ui('replies'), { 'base-comment-thread__replies--flat': isFlat }]"
						@leave="leaveAtOnce">
						<CommentNode
							v-for="reply in replies"
							:key="reply.id"
							:comment="reply"
							:depth="depth + 1"
							:parent-author="isFlat ? comment.author.name : undefined" />
					</TransitionGroup>
				</div>
			</div>
		</Transition>
	</li>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import CommentComposer from './CommentComposer.vue'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { UI_COMMENT_THREAD } from '@/locales/messages'
import { useCommentNode } from '../model/useCommentNode'
import type { CommentNodeProps } from '../types/CommentNode.types'

const props = defineProps<CommentNodeProps>()

const {
	ui,
	isMotionReduced,
	leaveAtOnce,
	authorId,
	repliesId,
	replyButtonRef,
	replies,
	isCollapsed,
	isReplying,
	isReadonly,
	isFlat,
	sizeScale,
	time,
	iso,
	likeText,
	repliesText,
	replyLabel,
	openReply,
	toggleLike,
	toggleReplies,
	cancelReply,
	submitReply,
} = useCommentNode(props)
</script>
