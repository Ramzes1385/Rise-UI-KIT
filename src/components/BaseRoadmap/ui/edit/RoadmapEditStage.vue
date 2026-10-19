<template>
	<li
		class="base-roadmap__edit-stage"
		:class="{
			'base-roadmap__edit-stage--selected': isSelected,
			'base-roadmap__edit-stage--grabbed': isGrabbed,
			'base-roadmap__edit-stage--placeholder': isPlaceholder,
			'base-roadmap__edit-stage--optional': stage.kind === 'optional',
		}"
		:data-roadmap-stage="stage.id">
		<div class="base-roadmap__edit-stage-head">
			<button
				type="button"
				class="base-roadmap__edit-handle"
				:data-roadmap-handle="stage.id"
				:aria-label="handleLabel"
				:aria-pressed="isGrabbed"
				aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
				:disabled="isDisabled()"
				@pointerdown="onPointerDown"
				@keydown="onKeydown">
				<BaseIcon name="grip-vertical" />
			</button>
			<h3 class="base-roadmap__edit-stage-heading">
				<button type="button" class="base-roadmap__edit-pick" :aria-pressed="isSelected" :disabled="isDisabled()" @click="onClick">
					<span class="base-roadmap__edit-number" aria-hidden="true">{{ index + 1 }}</span>
					<span class="base-roadmap__edit-stage-text">
						<span class="base-roadmap__sr">{{ numberText }}, </span>
						<span class="base-roadmap__edit-pick-title">{{ stage.title }}</span>
						<span class="base-roadmap__edit-stage-meta">{{ metaText }}</span>
					</span>
				</button>
			</h3>
			<BaseDropdownMenu :items="menu" :aria-label="actionsLabel" position="bottom-end">
				<template #default="{ triggerProps }">
					<button
						type="button"
						class="base-roadmap__edit-icon"
						v-bind="triggerProps"
						:aria-label="actionsLabel"
						:disabled="isDisabled()">
						<BaseIcon name="dots-horizontal" />
					</button>
				</template>
			</BaseDropdownMenu>
			<button
				type="button"
				class="base-roadmap__edit-icon base-roadmap__edit-chevron"
				:class="{ 'base-roadmap__edit-chevron--open': isOpen }"
				:aria-label="toggleLabel"
				:aria-expanded="isOpen"
				:aria-controls="isOpen ? panelId : undefined"
				@click="toggle">
				<BaseIcon name="chevron-down" />
			</button>
		</div>
		<ul v-if="isOpen" :id="panelId" class="base-roadmap__edit-topics" :aria-label="stage.title">
			<RoadmapEditTopic v-for="topic in stage.topics" :key="topic.id" :topic="topic" :stage="stage" />
			<li class="base-roadmap__edit-add">
				<button type="button" class="base-roadmap__edit-add-button" :disabled="isDisabled()" @click="addTopic">
					<BaseIcon name="plus" />{{ UI_ROADMAP_EDIT.ADD_TOPIC }}
				</button>
			</li>
		</ul>
	</li>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import RoadmapEditTopic from './RoadmapEditTopic.vue'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'
import { useRoadmapEditStage } from '../../model/edit/view/useRoadmapEditStage'
import type { RoadmapEditStageProps } from '../../types/internal/roadmapEditView.types'

const props = defineProps<RoadmapEditStageProps>()
const {
	isDisabled,
	menu,
	isSelected,
	isOpen,
	isGrabbed,
	isPlaceholder,
	panelId,
	numberText,
	metaText,
	handleLabel,
	actionsLabel,
	toggleLabel,
	toggle,
	addTopic,
	onKeydown,
	onPointerDown,
	onClick,
} = useRoadmapEditStage(props)
</script>
