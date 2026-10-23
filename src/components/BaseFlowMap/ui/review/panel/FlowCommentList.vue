<template>
	<div class="base-flow-map__review-list">
		<form v-if="canComment" class="base-flow-map__review-composer" @submit.prevent="send">
			<BaseInput v-model="draft" :label="composerLabel" :placeholder="UI_FLOW_REVIEW.COMMENT_PLACEHOLDER" />
			<BaseButton type="submit" :is-disabled="draft.trim() === ''">{{ UI_FLOW_REVIEW.COMMENT_SEND }}</BaseButton>
		</form>
		<p v-else class="base-flow-map__review-hint">{{ UI_FLOW_REVIEW.COMMENT_HINT }}</p>
		<BaseSwitch v-model="isResolvedShown" :label="UI_FLOW_REVIEW.SHOW_RESOLVED" />
		<BaseEmpty v-if="isEmpty" is-compact icon="comment" :title="UI_FLOW_REVIEW.EMPTY_COMMENTS" />
		<ul v-else class="base-flow-map__review-items">
			<li
				v-for="item in items"
				:key="item.id"
				class="base-flow-map__review-card"
				:class="item.thread.isUnread && 'base-flow-map__review-card--hot'">
				<div class="base-flow-map__review-card-head">
					<button
						type="button"
						class="base-flow-map__review-card-title"
						:aria-expanded="item.isOpen"
						@click="toggle(item.thread)">
						{{ item.target }}
					</button>
					<BaseBadge :label="item.status" :status="item.thread.isUnread ? 'primary' : 'neutral'" variant="soft" />
				</div>
				<p class="base-flow-map__review-card-summary">{{ item.text }}</p>
				<span class="base-flow-map__review-card-time">{{ item.time }}</span>
				<div v-if="item.isOpen && isCompact" class="base-flow-map__review-thread">
					<BaseCommentThread :comments="item.thread.comments" :current-user="currentUser" @reply="reply(item.thread, $event)" />
				</div>
				<div class="base-flow-map__review-card-actions">
					<BaseButton variant="ghost" @click="show(item.thread)">{{ UI_FLOW_REVIEW.SHOW_ELEMENT }}</BaseButton>
					<BaseButton variant="ghost" @click="resolve(item.thread)">{{ resolveLabel(item.thread) }}</BaseButton>
				</div>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { BaseBadge } from '@components/BaseBadge'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseInput } from '@components/BaseInput'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseSwitch } from '@components/BaseSwitch'
import { BaseCommentThread } from '@components/BaseCommentThread'
import { useFlowCommentList } from '../../../model/review/panel/useFlowCommentList'

const {
	items,
	draft,
	send,
	isEmpty,
	isCompact,
	canComment,
	composerLabel,
	isResolvedShown,
	currentUser,
	toggle,
	show,
	reply,
	resolve,
	resolveLabel,
} = useFlowCommentList()
</script>
