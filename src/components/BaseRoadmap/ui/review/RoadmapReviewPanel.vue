<template>
	<section class="base-roadmap__review" :class="isCompact && 'base-roadmap__review--compact'" :aria-label="UI_ROADMAP_REVIEW.PANEL">
		<RoadmapRejectNotice v-if="rejection" :rejection="rejection" :can-undo="canUndo" @dismiss="emit('dismiss')" />
		<BaseTabs v-model="tab" :items="tabs" is-full-width>
			<template #panel-proposals>
				<div class="base-roadmap__review-list">
					<div class="base-roadmap__review-actions">
						<BaseSegmented v-model="show" :options="showOptions" :aria-label="UI_ROADMAP_REVIEW.SHOW" />
						<BaseButton v-if="review.readyCount.value > 0" variant="soft" @click="review.acceptAll()">{{
							acceptAllLabel
						}}</BaseButton>
					</div>
					<BaseEmpty
						v-if="isProposalsEmpty"
						is-compact
						icon="comment"
						:title="UI_ROADMAP_REVIEW.EMPTY_PROPOSALS"
						:description="UI_ROADMAP_REVIEW.EMPTY_PROPOSALS_HINT" />
					<ul v-else class="base-roadmap__review-items">
						<li
							v-for="item in proposalItems"
							:key="item.id"
							class="base-roadmap__review-card"
							:class="!item.isOpen && 'base-roadmap__review-card--done'"
							:aria-label="item.label">
							<div class="base-roadmap__review-card-head">
								<BaseAvatar :name="item.name" :src="item.avatar" :size-scale="0.75" />
								<span class="base-roadmap__review-card-author">{{ item.name }}</span>
								<span class="base-roadmap__review-card-time">{{ item.time }}</span>
								<BaseBadge :label="item.kind" :status="item.kindStatus" variant="soft" />
								<BaseBadge v-if="item.isStale" :label="UI_ROADMAP_REVIEW.STALE" status="warning" variant="soft" />
							</div>
							<p class="base-roadmap__review-card-title">{{ item.title }}</p>
							<p v-if="item.summary" class="base-roadmap__review-card-summary">{{ item.summary }}</p>
							<ul v-if="item.fields.length > 0" class="base-roadmap__review-fields">
								<li v-for="row in item.fields" :key="row.key">
									<span class="base-roadmap__review-field">{{ row.field }}</span>
									<del
										><span class="base-roadmap__sr">{{ UI_ROADMAP_REVIEW.VALUE_WAS }}: </span>{{ row.before }}</del
									>
									<span class="base-roadmap__review-arrow" aria-hidden="true">&rarr;</span>
									<ins
										><span class="base-roadmap__sr">{{ UI_ROADMAP_REVIEW.VALUE_NOW }}: </span>{{ row.after }}</ins
									>
								</li>
							</ul>
							<div v-if="item.isOpen" class="base-roadmap__review-card-actions">
								<BaseButton
									is-focusable-when-disabled
									:is-disabled="item.isStale"
									:aria-describedby="item.isStale ? `${item.id}-stale` : undefined"
									@click="review.accept(item.id)">
									{{ UI_ROADMAP_REVIEW.ACCEPT }}
								</BaseButton>
								<BaseButton variant="ghost" @click="review.decline(item.id)">{{ UI_ROADMAP_REVIEW.DECLINE }}</BaseButton>
								<span v-if="item.isStale" :id="`${item.id}-stale`" class="base-roadmap__review-reason">{{
									UI_ROADMAP_REVIEW.STALE_REASON
								}}</span>
							</div>
							<p v-else class="base-roadmap__review-card-status">
								{{ item.status === 'accepted' ? UI_ROADMAP_REVIEW.STATUS_ACCEPTED : UI_ROADMAP_REVIEW.STATUS_REJECTED }}
							</p>
						</li>
					</ul>
				</div>
			</template>
			<template #panel-comments>
				<div class="base-roadmap__review-list">
					<form v-if="canComment" class="base-roadmap__review-composer" @submit.prevent="send">
						<BaseInput v-model="draft" :label="composerLabel" :placeholder="UI_ROADMAP_REVIEW.COMMENT_PLACEHOLDER" />
						<BaseButton type="submit" :is-disabled="draft.trim() === ''">{{ UI_ROADMAP_REVIEW.COMMENT_SEND }}</BaseButton>
					</form>
					<p v-else class="base-roadmap__review-hint">{{ UI_ROADMAP_REVIEW.COMMENT_HINT }}</p>
					<BaseSwitch v-model="isResolvedShown" :label="UI_ROADMAP_REVIEW.SHOW_RESOLVED" />
					<BaseEmpty v-if="isThreadsEmpty" is-compact icon="comment" :title="UI_ROADMAP_REVIEW.EMPTY_COMMENTS" />
					<ul v-else class="base-roadmap__review-items">
						<li
							v-for="item in threadItems"
							:key="item.id"
							class="base-roadmap__review-card"
							:class="item.thread.isUnread && 'base-roadmap__review-card--hot'">
							<div class="base-roadmap__review-card-head">
								<button
									type="button"
									class="base-roadmap__review-card-title"
									:aria-expanded="item.isOpen"
									@click="toggleThread(item.id)">
									{{ item.target }}
								</button>
								<BaseBadge :label="item.status" :status="item.thread.isUnread ? 'primary' : 'neutral'" variant="soft" />
							</div>
							<p class="base-roadmap__review-card-summary">{{ item.text }}</p>
							<span class="base-roadmap__review-card-time">{{ item.time }}</span>
							<div v-if="item.isOpen" class="base-roadmap__review-thread">
								<BaseCommentThread
									:comments="item.thread.comments"
									:current-user="review.currentUser.value"
									@reply="review.reply(item.id, $event.text, $event.parentId)" />
							</div>
							<div class="base-roadmap__review-card-actions">
								<BaseButton variant="ghost" @click="emit('show', item.thread.target)">{{
									UI_ROADMAP_REVIEW.SHOW_ELEMENT
								}}</BaseButton>
								<BaseButton variant="ghost" @click="review.setResolved(item.id, !item.thread.isResolved)">{{
									resolveLabel(item.thread)
								}}</BaseButton>
							</div>
						</li>
					</ul>
				</div>
			</template>
		</BaseTabs>
	</section>
</template>

<script setup lang="ts">
import './RoadmapReviewPanel.style.scss'
import { BaseTabs } from '@components/BaseTabs'
import { BaseBadge } from '@components/BaseBadge'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseInput } from '@components/BaseInput'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseSwitch } from '@components/BaseSwitch'
import { UI_ROADMAP_REVIEW } from '@/locales/messages'
import { BaseSegmented } from '@components/BaseSegmented'
import type { RoadmapData } from '../../types/roadmapData.types'
import { BaseCommentThread } from '@components/BaseCommentThread'
import RoadmapRejectNotice from '../parts/notices/RoadmapRejectNotice.vue'
import { useRoadmapReviewPanel } from '../../model/review/useRoadmapReviewPanel'
import type { RoadmapRejection } from '../../types/internal/roadmapEdit.internal.types'
import type { RoadmapReviewState, RoadmapReviewTarget } from '../../types/internal/roadmapReview.types'

const props = defineProps<{
	review: RoadmapReviewState
	data: RoadmapData
	target?: RoadmapReviewTarget | null
	isCompact?: boolean
	rejection?: RoadmapRejection | null
	canUndo?: boolean
}>()

const emit = defineEmits<{
	show: [target: RoadmapReviewTarget]
	dismiss: []
}>()

const {
	tab,
	tabs,
	showOptions,
	show,
	isResolvedShown,
	draft,
	proposalItems,
	threadItems,
	canComment,
	isProposalsEmpty,
	isThreadsEmpty,
	acceptAllLabel,
	composerLabel,
	send,
	toggleThread,
	resolveLabel,
} = useRoadmapReviewPanel(
	props.review,
	() => props.data,
	() => props.target,
)
</script>
