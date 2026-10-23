<template>
	<div class="base-roadmap__edit-reject">
		<BaseIcon name="alert-triangle" />
		<span class="base-roadmap__edit-reject-text">
			<strong>{{ rejection.code === 'cycle' ? UI_ROADMAP_EDIT.CYCLE_TITLE : UI_ROADMAP_EDIT.REJECT_TITLE }}</strong>
			<span>{{ rejection.text }}</span>
			<span v-if="canUndo">{{ UI_ROADMAP_EDIT.REJECT_UNDO }} <BaseKbd value="Ctrl+Z" /></span>
		</span>
		<BaseButton variant="ghost" :aria-label="UI_ROADMAP_EDIT.REJECT_CLOSE" @click="emit('dismiss')">
			<BaseIcon name="x-mark" />
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import '../../../styles/_roadmap-reject.scss'
import { BaseKbd } from '@components/BaseKbd'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import type { RoadmapRejection } from '../../../types/internal/roadmapEdit.internal.types'

defineProps<{
	rejection: RoadmapRejection
	canUndo?: boolean
}>()
const emit = defineEmits<{ dismiss: [] }>()
</script>
