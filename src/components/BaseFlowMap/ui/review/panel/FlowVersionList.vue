<template>
	<div class="base-flow-map__review-list">
		<BaseEmpty v-if="isEmpty" is-compact icon="layers" :title="UI_FLOW_REVIEW.EMPTY_VERSIONS" />
		<ul v-else class="base-flow-map__review-items">
			<li
				v-for="item in items"
				:key="item.id"
				class="base-flow-map__review-card"
				:class="item.isCompared && 'base-flow-map__review-card--hot'">
				<div class="base-flow-map__review-card-head">
					<BaseAvatar v-if="item.name" :name="item.name" :src="item.avatar" :size-scale="0.75" />
					<span class="base-flow-map__review-card-author">{{ item.label }}</span>
					<span class="base-flow-map__review-card-time">{{ item.time }}</span>
					<BaseBadge v-if="item.isCurrent" :label="UI_FLOW_REVIEW.CURRENT" status="primary" variant="soft" />
				</div>
				<p v-if="item.summary" class="base-flow-map__review-card-summary">{{ item.summary }}</p>
				<div v-if="!item.isCurrent" class="base-flow-map__review-card-actions">
					<BaseButton variant="ghost" :aria-pressed="item.isCompared" @click="toggle(item.id, item.isCompared)">
						{{ buttonLabel(item.isCompared) }}
					</BaseButton>
				</div>
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
import { useFlowVersionList } from '../../../model/review/panel/useFlowVersionList'

const { items, isEmpty, buttonLabel, toggle } = useFlowVersionList()
</script>
