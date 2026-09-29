<template>
	<Transition name="base-media-player__achievement">
		<div
			v-if="achievementToast"
			:key="achievementToast.id"
			class="base-media-player__achievement"
			role="status"
			@click="dismissAchievement">
			<span class="base-media-player__achievement-art" aria-hidden="true">
				<img v-if="achievementIcon" class="base-media-player__achievement-icon" :src="achievementIcon" alt="" />
				<MediaIcon v-else name="trophy" />
			</span>
			<span class="base-media-player__achievement-text">
				<span class="base-media-player__achievement-label">{{ UI_PLAYER.ACHIEVEMENT }}</span>
				<span class="base-media-player__achievement-title">{{ achievementToast.title }}</span>
				<span v-if="achievementToast.description" class="base-media-player__achievement-description">
					{{ achievementToast.description }}
				</span>
			</span>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import MediaIcon from './MediaIcon.vue'
import { UI_PLAYER } from '../model/messages'
import { usePlayerContext } from '../model/usePlayerContext'

const { achievementToast, achievementIcon, dismissAchievement } = usePlayerContext()
</script>
