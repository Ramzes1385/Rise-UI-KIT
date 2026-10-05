<template>
	<span
		v-if="coverStyle"
		:class="[ui('cover'), { 'base-kanban__cover--image': Boolean(card.coverImage) }]"
		:style="coverStyle"
		aria-hidden="true"></span>
	<span v-if="meta.labels.length" :class="ui('labels')">
		<span v-for="label in meta.labels" :key="label.text" class="base-kanban__label" :class="`base-kanban__label--${label.color}`">
			{{ label.text }}
		</span>
	</span>
	<span :class="ui('card-title')">{{ card.title }}</span>
	<span v-if="card.description" :class="ui('card-description')">{{ card.description }}</span>
	<span v-if="meta.hasFooter" :class="ui('meta')" aria-hidden="true">
		<span class="base-kanban__meta-info">
			<span v-if="card.key" class="base-kanban__key">{{ card.key }}</span>
			<BaseTooltip v-if="meta.priority" class="base-kanban__priority-tooltip" :text="meta.priority.label">
				<span class="base-kanban__priority" :class="`base-kanban__priority--${meta.priority.level}`">
					<BaseIcon v-for="index in meta.priority.count" :key="index" :name="meta.priority.icon" />
				</span>
			</BaseTooltip>
			<span v-if="meta.due" class="base-kanban__due" :class="`base-kanban__due--${meta.due.status}`">
				<BaseIcon name="calendar" />
				{{ meta.due.text }}
			</span>
			<span
				v-if="card.subtasks"
				class="base-kanban__stat"
				:class="{ 'base-kanban__stat--complete': card.subtasks.done >= card.subtasks.total }">
				<BaseIcon name="check-circle" />
				{{ card.subtasks.done }}/{{ card.subtasks.total }}
			</span>
			<span v-if="card.comments" class="base-kanban__stat">
				<BaseIcon name="comment" />
				{{ card.comments }}
			</span>
			<span v-if="card.attachments" class="base-kanban__stat">
				<BaseIcon name="attach" />
				{{ card.attachments }}
			</span>
			<span v-if="card.estimate !== undefined" class="base-kanban__estimate">{{ card.estimate }}</span>
		</span>
		<BaseAvatarGroup v-if="assignees.length" class="base-kanban__assignees" :items="assignees" :max="2" :size-scale="75" />
	</span>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseTooltip } from '@components/BaseTooltip'
import { BaseAvatarGroup } from '@components/BaseAvatarGroup'
import type { KanbanCardContentProps } from '../types/KanbanParts.types'
import { useKanbanCardContent } from '../model/card/useKanbanCardContent'

const props = defineProps<KanbanCardContentProps>()

const { meta, assignees, coverStyle } = useKanbanCardContent(props)
</script>
