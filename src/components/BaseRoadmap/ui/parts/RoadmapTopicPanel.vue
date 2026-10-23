<template>
	<div :class="[ui('details'), { 'base-roadmap__details--sheet': isSheet }]" :aria-busy="isBusy || undefined">
		<header v-if="!isSheet" class="base-roadmap__details-head">
			<h2 class="base-roadmap__details-title">{{ view.topic.title }}</h2>
			<BaseBadge variant="soft" :status="badgeStatus" :label="statusText" />
		</header>
		<div class="base-roadmap__details-badges">
			<BaseBadge variant="soft" status="neutral" :label="stageText" />
			<BaseBadge v-if="hoursText" variant="soft" status="neutral" :label="hoursText" />
			<BaseBadge variant="soft" status="neutral" :label="kindText" />
		</div>
		<div v-if="view.state.total" class="base-roadmap__details-progress">
			<div class="base-roadmap__details-progress-row">
				<span>{{ subtopicsText }}</span>
				<span>{{ percentText }}</span>
			</div>
			<BaseProgress :value="percent" :max="100" :aria-label="UI_ROADMAP.SUBTOPICS" />
		</div>
		<p v-if="view.topic.description" class="base-roadmap__details-text">{{ view.topic.description }}</p>
		<section v-if="view.topic.subtopics?.length" class="base-roadmap__details-section">
			<h3 class="base-roadmap__details-heading">{{ UI_ROADMAP.SUBTOPICS }}</h3>
			<ul class="base-roadmap__subtopics" :aria-label="UI_ROADMAP.SUBTOPICS_LABEL">
				<li v-for="subtopic in view.topic.subtopics" :key="subtopic.id" class="base-roadmap__subtopic">
					<BaseCheckbox
						:model-value="isChecked(subtopic.id)"
						:label="subtopic.title"
						:is-disabled="isDisabled || isLocked || isBusy"
						@update:model-value="onToggleSubtopic(subtopic.id, $event)" />
				</li>
			</ul>
		</section>
		<section v-if="view.topic.materials?.length" class="base-roadmap__details-section">
			<h3 class="base-roadmap__details-heading">{{ UI_ROADMAP.MATERIALS }}</h3>
			<RoadmapMaterials :materials="view.topic.materials" :ui="ui">
				<template v-if="$slots.material" #material="slotProps"><slot name="material" v-bind="slotProps" /></template>
			</RoadmapMaterials>
		</section>
		<section v-if="requirements.length" class="base-roadmap__details-section">
			<h3 class="base-roadmap__details-heading">{{ UI_ROADMAP.REQUIRES }}</h3>
			<div class="base-roadmap__requirements">
				<button
					v-for="requirement in requirements"
					:key="requirement.id"
					type="button"
					:class="['base-roadmap__requirement', `base-roadmap__requirement--${requirement.status}`]"
					@click="emit('select', requirement.id)">
					<span class="base-roadmap__requirement-dot" aria-hidden="true" />
					{{ requirement.title }}
					<span class="base-roadmap__sr">, {{ topicStatusText(requirement.status).toLowerCase() }}</span>
				</button>
			</div>
		</section>
		<slot name="topic-details" :topic="view.topic" :state="view.state" />
		<footer class="base-roadmap__details-foot">
			<BaseButton
				:variant="isDone ? 'outline' : 'default'"
				class="base-roadmap__details-mark"
				:is-disabled="isMarkDisabled"
				@click="onMark">
				{{ markText }}
			</BaseButton>
			<BaseButton v-if="hasNext" variant="outline" class="base-roadmap__details-next" @click="emit('next')">
				{{ UI_ROADMAP.NEXT_TOPIC }}
				<template #right><BaseIcon name="arrow-right" /></template>
			</BaseButton>
			<BaseDropdownMenu :items="menuItems" :aria-label="UI_ROADMAP.MORE">
				<BaseButton
					variant="ghost"
					class="base-roadmap__details-more"
					:aria-label="UI_ROADMAP.MORE"
					:is-disabled="isDisabled || isBusy">
					<BaseIcon name="dots-horizontal" />
				</BaseButton>
			</BaseDropdownMenu>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { UI_ROADMAP } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import RoadmapMaterials from './RoadmapMaterials.vue'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseProgress } from '@components/BaseProgress'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'
import { topicStatusText } from '../../model/view/format/roadmapText'
import { useRoadmapTopicPanel } from '../../model/view/parts/useRoadmapTopicPanel'
import type { RoadmapTopicPanelEmits, RoadmapTopicPanelProps, RoadmapTopicPanelSlots } from '../../types/internal/roadmapView.types'

const props = defineProps<RoadmapTopicPanelProps>()
const emit = defineEmits<RoadmapTopicPanelEmits>()
defineSlots<RoadmapTopicPanelSlots>()

const {
	isLocked,
	isDone,
	percent,
	percentText,
	statusText,
	badgeStatus,
	isMarkDisabled,
	markText,
	subtopicsText,
	stageText,
	hoursText,
	kindText,
	isChecked,
	menuItems,
	onToggleSubtopic,
	onMark,
} = useRoadmapTopicPanel(props, emit)
</script>
