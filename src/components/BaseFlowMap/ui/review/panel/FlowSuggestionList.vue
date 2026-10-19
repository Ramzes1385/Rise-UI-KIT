<template>
	<div class="base-flow-map__review-list">
		<div v-if="canAcceptAll" class="base-flow-map__review-actions">
			<BaseButton variant="soft" @click="acceptAll">{{ acceptAllLabel }}</BaseButton>
		</div>
		<BaseEmpty
			v-if="isEmpty"
			is-compact
			icon="comment"
			:title="UI_FLOW_REVIEW.EMPTY_SUGGESTIONS"
			:description="UI_FLOW_REVIEW.EMPTY_SUGGESTIONS_HINT" />
		<ul v-else class="base-flow-map__review-items">
			<li
				v-for="item in items"
				:key="item.id"
				class="base-flow-map__review-card"
				:class="[!item.isOpen && 'base-flow-map__review-card--done', item.isFocused && 'base-flow-map__review-card--hot']"
				:aria-label="item.label"
				@pointerenter="setFocus(item.id)"
				@pointerleave="setFocus(null)"
				@focusin="setFocus(item.id)"
				@focusout="setFocus(null)">
				<div class="base-flow-map__review-card-head">
					<BaseAvatar :name="item.name" :src="item.avatar" :size-scale="75" />
					<span class="base-flow-map__review-card-author">{{ item.name }}</span>
					<span class="base-flow-map__review-card-time">{{ item.time }}</span>
					<BaseBadge :label="item.kind" :status="item.kindStatus" variant="soft" />
					<BaseBadge v-if="item.isStale" :label="UI_FLOW_REVIEW.STALE" status="warning" variant="soft" />
				</div>
				<button type="button" class="base-flow-map__review-card-title" @click="show(item.id)">{{ item.title }}</button>
				<p v-if="item.summary" class="base-flow-map__review-card-summary">{{ item.summary }}</p>
				<ul v-if="item.fields.length > 0" class="base-flow-map__review-fields">
					<li v-for="row in item.fields" :key="row.key">
						<span class="base-flow-map__review-field">{{ row.field }}</span>
						<del>{{ row.before }}</del>
						<span aria-hidden="true">&rarr;</span>
						<ins>{{ row.after }}</ins>
					</li>
				</ul>
				<div v-if="item.isOpen" class="base-flow-map__review-card-actions">
					<BaseButton
						:id="`${item.id}-accept`"
						is-focusable-when-disabled
						:is-disabled="item.isStale"
						:aria-describedby="item.isStale ? `${item.id}-stale` : undefined"
						@click="accept(item.id)">
						{{ UI_FLOW_REVIEW.ACCEPT }}
					</BaseButton>
					<BaseButton variant="ghost" @click="decline(item.id)">{{ UI_FLOW_REVIEW.DECLINE }}</BaseButton>
					<span v-if="item.isStale" :id="`${item.id}-stale`" class="base-flow-map__review-reason">{{
						UI_FLOW_REVIEW.STALE_REASON
					}}</span>
				</div>
				<p v-else class="base-flow-map__review-card-status">
					{{ item.status === 'accepted' ? UI_FLOW_REVIEW.STATUS_ACCEPTED : UI_FLOW_REVIEW.STATUS_DECLINED }}
				</p>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { BaseBadge } from '@components/BaseBadge'
import { BaseEmpty } from '@components/BaseEmpty'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { useFlowSuggestionList } from '../../../model/review/panel/useFlowSuggestionList'

const { items, isEmpty, acceptAllLabel, canAcceptAll, accept, acceptAll, decline, setFocus, show } = useFlowSuggestionList()
</script>
