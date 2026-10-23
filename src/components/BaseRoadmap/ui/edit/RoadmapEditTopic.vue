<template>
	<li
		class="base-roadmap__edit-topic"
		:class="{
			'base-roadmap__edit-topic--selected': isSelected,
			'base-roadmap__edit-topic--grabbed': isGrabbed,
			'base-roadmap__edit-topic--placeholder': isPlaceholder,
			'base-roadmap__edit-topic--optional': topic.kind === 'optional',
			'base-roadmap__edit-topic--source': isLinkSource,
		}"
		:data-roadmap-topic="topic.id">
		<button
			type="button"
			class="base-roadmap__edit-handle"
			:data-roadmap-handle="topic.id"
			:aria-label="handleLabel"
			:aria-pressed="isGrabbed"
			aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
			:disabled="isDisabled()"
			@pointerdown="onPointerDown"
			@keydown="onKeydown">
			<BaseIcon name="grip-vertical" />
		</button>
		<button type="button" class="base-roadmap__edit-pick" :aria-pressed="isSelected" :disabled="isDisabled()" @click="onClick">
			<span class="base-roadmap__edit-pick-title">{{ topic.title }}</span>
			<span v-if="isAlternative" class="base-roadmap__edit-pick-alt">{{ UI_ROADMAP.OR }}</span>
			<span v-if="hoursText" class="base-roadmap__edit-pick-hours">{{ hoursText }}</span>
		</button>
	</li>
</template>

<script setup lang="ts">
import { UI_ROADMAP } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { useRoadmapEditTopic } from '../../model/edit/view/useRoadmapEditTopic'
import type { RoadmapEditTopicProps } from '../../types/internal/roadmapEditView.types'

const props = defineProps<RoadmapEditTopicProps>()
const {
	isDisabled,
	isSelected,
	isGrabbed,
	isPlaceholder,
	isLinkSource,
	isAlternative,
	hoursText,
	handleLabel,
	onKeydown,
	onPointerDown,
	onClick,
} = useRoadmapEditTopic(props)
</script>
