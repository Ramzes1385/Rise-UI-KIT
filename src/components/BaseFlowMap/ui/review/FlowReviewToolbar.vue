<template>
	<div class="base-flow-map__review-bar" role="toolbar" :aria-label="UI_FLOW_REVIEW.FILTERS">
		<div v-if="authors.length > 0" class="base-flow-map__review-group" role="group" :aria-label="UI_FLOW_REVIEW.AUTHORS">
			<span class="base-flow-map__review-caption">{{ UI_FLOW_REVIEW.AUTHORS }}</span>
			<button
				v-for="author in authors"
				:key="author.name"
				type="button"
				class="base-flow-map__review-author-btn"
				:class="{ 'base-flow-map__review-author-btn--off': !author.isOn }"
				:aria-pressed="author.isOn"
				:aria-label="author.label"
				@click="toggleAuthor(author.name)">
				<BaseAvatar :name="author.name" :src="author.avatar" :size-scale="75" />
			</button>
		</div>
		<div class="base-flow-map__review-group">
			<span class="base-flow-map__review-caption">{{ UI_FLOW_REVIEW.SHOW }}</span>
			<BaseSegmented v-model="show" :options="showOptions" :aria-label="UI_FLOW_REVIEW.SHOW" />
		</div>
		<BaseSwitch v-model="isOnlyChanged" :label="UI_FLOW_REVIEW.ONLY_CHANGED" />
		<span class="base-flow-map__review-spacer" />
		<template v-if="draftCount > 0">
			<BaseButton variant="ghost" @click="discard">{{ UI_FLOW_REVIEW.DISCARD }}</BaseButton>
			<BaseButton @click="submit">{{ submitLabel }}</BaseButton>
		</template>
	</div>
	<ul class="base-flow-map__review-legend" tabindex="0" :aria-label="UI_FLOW_REVIEW.LEGEND">
		<li v-for="item in legend" :key="item.kind" class="base-flow-map__review-legend-item">
			<span class="base-flow-map__review-swatch" :class="`base-flow-map__review-swatch--${item.kind}`" aria-hidden="true" />
			{{ item.label }}
		</li>
	</ul>
</template>

<script setup lang="ts">
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseSwitch } from '@components/BaseSwitch'
import { BaseSegmented } from '@components/BaseSegmented'
import { useFlowReviewToolbar } from '../../model/review/bar/useFlowReviewToolbar'

const { authors, showOptions, legend, show, isOnlyChanged, toggleAuthor, draftCount, submitLabel, submit, discard } = useFlowReviewToolbar()
</script>
