<template>
	<section :class="className" :aria-label="UI_ROADMAP_3D.EDIT_LABEL">
		<h3 class="base-roadmap-3d__panel-heading">{{ UI_ROADMAP_3D.EDIT_LABEL }}</h3>
		<BaseInput
			:model-value="draft"
			:aria-label="UI_ROADMAP_3D.EDIT_TITLE"
			:is-disabled="isDisabled"
			@update:model-value="setDraft"
			@change="commitTitle" />
		<div class="base-roadmap-3d__panel-row" role="group" :aria-label="UI_ROADMAP_3D.EDIT_ORDER">
			<BaseButton variant="outline" :is-disabled="isDisabled || !hasPrev" @click="$emit('shift', -1)">
				<template #left><BaseIcon name="arrow-left" /></template>
				{{ UI_ROADMAP_3D.EDIT_EARLIER }}
			</BaseButton>
			<BaseButton variant="outline" :is-disabled="isDisabled || !hasNext" @click="$emit('shift', 1)">
				{{ UI_ROADMAP_3D.EDIT_LATER }}
				<template #right><BaseIcon name="arrow-right" /></template>
			</BaseButton>
		</div>
		<BaseSelect
			:model-value="currentModel"
			:options="models"
			:label="UI_ROADMAP_3D.EDIT_MODEL"
			:is-disabled="isDisabled"
			@update:model-value="$emit('model', String($event))" />
		<BaseInput
			v-if="isCustomModel"
			:model-value="customUrl"
			:label="UI_ROADMAP_3D.EDIT_MODEL_URL"
			:is-disabled="isDisabled"
			@update:model-value="onUrl" />
		<div class="base-roadmap-3d__panel-row">
			<BaseButton variant="outline" :is-disabled="isDisabled" @click="$emit('add')">{{ UI_ROADMAP_3D.EDIT_ADD }}</BaseButton>
			<BaseButton variant="ghost" :is-disabled="isDisabled" @click="$emit('remove')">
				<template #left><BaseIcon name="trash" /></template>
				{{ UI_ROADMAP_3D.EDIT_REMOVE }}
			</BaseButton>
		</div>
	</section>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { UI_ROADMAP_3D } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { useRoadmapStageEdit } from '../../model/view/useRoadmapStageEdit'
import type { RoadmapStageEditProps } from '../../types/internal/roadmap3dUi.types'

const props = defineProps<RoadmapStageEditProps>()

const emit = defineEmits<{
	(event: 'rename', title: string): void
	(event: 'shift', delta: -1 | 1): void
	(event: 'model' | 'url', value: string): void
	(event: 'add' | 'remove'): void
}>()

const { draft, setDraft, commitTitle, onUrl } = useRoadmapStageEdit(props, emit)
</script>
