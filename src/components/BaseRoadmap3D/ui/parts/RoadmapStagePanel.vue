<template>
	<aside :class="[className, { 'base-roadmap-3d__panel--sheet': isCompact }]" role="region" :aria-label="UI_ROADMAP.PANEL_LABEL">
		<BaseButton
			variant="ghost"
			class="base-roadmap-3d__panel-close"
			:aria-label="topic ? UI_ROADMAP_3D.BACK_TO_STAGE : UI_ROADMAP_3D.CLOSE_PANEL"
			@click="$emit('close')">
			<template #left><BaseIcon :name="topic ? 'arrow-left' : 'close'" /></template>
		</BaseButton>
		<RoadmapTopicPanel
			v-if="topic"
			:view="topic.view"
			:stage="topic.stage"
			:done-subtopics="topic.doneSubtopics"
			:requirements="topic.requirements"
			:ui="panelUi"
			:is-disabled="isDisabled"
			:is-busy="topic.isBusy"
			:has-next="topic.hasNext"
			@toggle-subtopic="(topicId, subtopicId, isDone) => $emit('toggle-subtopic', topicId, subtopicId, isDone)"
			@set-status="(topicId, status) => $emit('set-status', topicId, status)"
			@select="$emit('select', $event)"
			@next="$emit('next-topic')">
			<template v-if="$slots['topic-details']" #topic-details="slotProps"><slot name="topic-details" v-bind="slotProps" /></template>
			<template v-if="$slots.material" #material="slotProps"><slot name="material" v-bind="slotProps" /></template>
		</RoadmapTopicPanel>
		<template v-else>
			<span class="base-roadmap-3d__eyebrow">{{ eyebrow }}</span>
			<slot name="stage-header" :stage="stage.view.stage" :status="stage.item.status">
				<div class="base-roadmap-3d__panel-head">
					<h2 class="base-roadmap-3d__panel-title">{{ stage.item.title }}</h2>
					<BaseBadge v-if="badge" variant="soft" :status="badge.status" :label="badge.text" />
				</div>
			</slot>
			<div class="base-roadmap-3d__ring-row">
				<div class="base-roadmap-3d__ring">
					<svg viewBox="0 0 64 64" aria-hidden="true">
						<circle class="base-roadmap-3d__ring-track" cx="32" cy="32" :r="radius" />
						<circle
							class="base-roadmap-3d__ring-fill"
							cx="32"
							cy="32"
							:r="radius"
							:stroke-dasharray="dash"
							transform="rotate(-90 32 32)" />
					</svg>
					<span class="base-roadmap-3d__ring-text">{{ percentText }}</span>
				</div>
				<div class="base-roadmap-3d__ring-info">
					<b>{{ doneText }}</b>
					<span v-if="stage.hours">{{ stage.hours }}</span>
				</div>
			</div>
			<p v-if="unlockText" class="base-roadmap-3d__lock-note">
				<BaseIcon name="file-lock" />
				{{ unlockText }}
			</p>
			<h3 class="base-roadmap-3d__panel-heading">{{ UI_ROADMAP_3D.TOPICS }}</h3>
			<ul class="base-roadmap-3d__topics">
				<li v-for="row in rows" :key="row.id">
					<span v-if="row.isAlternative" class="base-roadmap-3d__topic-or">{{ UI_ROADMAP.OR }}</span>
					<button
						type="button"
						:class="['base-roadmap-3d__topic', `base-roadmap-3d__topic--${row.status}`]"
						@click="$emit('select', row.id)">
						<span class="base-roadmap-3d__topic-dot" aria-hidden="true" />
						<span class="base-roadmap-3d__topic-title">{{ row.title }}</span>
						<span class="base-roadmap-3d__topic-meta">{{ row.hours }}</span>
						<span class="base-roadmap-3d__sr">, {{ row.statusText.toLowerCase() }}</span>
					</button>
				</li>
			</ul>
			<RoadmapStageEdit
				v-if="isEditing"
				:class-name="editClass"
				:title="stage.item.title"
				:has-prev="stage.hasPrev"
				:has-next="stage.hasNext"
				:models="models"
				:current-model="currentModel"
				:is-custom-model="isCustomModel"
				:custom-url="customUrl"
				:is-disabled="isDisabled"
				@rename="$emit('rename', $event)"
				@shift="$emit('shift', $event)"
				@model="$emit('model', $event)"
				@url="$emit('url', $event)"
				@add="$emit('add')"
				@remove="$emit('remove')" />
			<footer class="base-roadmap-3d__panel-foot">
				<BaseButton variant="outline" @click="$emit('open-2d')">{{ UI_ROADMAP_3D.OPEN_2D }}</BaseButton>
				<BaseButton v-if="stage.hasNext" variant="ghost" @click="$emit('go', 1)">
					{{ UI_ROADMAP_3D.NEXT_STAGE }}
					<template #right><BaseIcon name="arrow-right" /></template>
				</BaseButton>
			</footer>
		</template>
	</aside>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import RoadmapStageEdit from './RoadmapStageEdit.vue'
import { UI_ROADMAP, UI_ROADMAP_3D } from '@/locales/messages'
import { useRoadmapStagePanel } from '../../model/view/useRoadmapStagePanel'
import type { RoadmapStagePanelProps } from '../../types/internal/roadmap3dUi.types'
import RoadmapTopicPanel from '@components/BaseRoadmap/ui/parts/RoadmapTopicPanel.vue'
import type { BaseRoadmapSlots } from '@components/BaseRoadmap/types/BaseRoadmap.types'
import type { RoadmapProgressStatus } from '@components/BaseRoadmap/types/roadmapData.types'

const props = defineProps<RoadmapStagePanelProps>()

defineEmits<{
	(event: 'close' | 'open-2d' | 'next-topic' | 'add' | 'remove'): void
	(event: 'select' | 'rename' | 'model' | 'url', value: string): void
	(event: 'go' | 'shift', delta: 1 | -1): void
	(event: 'toggle-subtopic', topicId: string, subtopicId: string, isDone: boolean): void
	(event: 'set-status', topicId: string, status: RoadmapProgressStatus | null): void
}>()

defineSlots<Pick<BaseRoadmapSlots, 'topic-details' | 'material' | 'stage-header'>>()

const { eyebrow, badge, percentText, doneText, unlockText, dash, radius, rows, models, currentModel, isCustomModel, customUrl, editClass } =
	useRoadmapStagePanel(props)
</script>
