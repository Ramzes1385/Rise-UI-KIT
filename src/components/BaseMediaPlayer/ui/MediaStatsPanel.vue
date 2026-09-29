<template>
	<section class="base-media-player__stats" :aria-label="UI_PLAYER.STATS">
		<div class="base-media-player__stats-header">
			<span class="base-media-player__stats-title">{{ UI_PLAYER.STATS }}</span>
			<BaseButton variant="ghost" class="base-media-player__button" :aria-label="UI_PLAYER.STATS_COPY" @click="emit('copy')">
				<template #left><BaseIcon name="copy" /></template>
			</BaseButton>
			<BaseButton variant="ghost" class="base-media-player__button" :aria-label="UI_ARIA.CLOSE" @click="emit('close')">
				<template #left><BaseIcon name="close" /></template>
			</BaseButton>
		</div>
		<dl class="base-media-player__stats-list">
			<div v-for="row in rows" :key="row.label" class="base-media-player__stats-row">
				<dt>{{ row.label }}</dt>
				<dd>{{ row.value }}</dd>
			</div>
		</dl>
	</section>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { UI_ARIA, UI_PLAYER } from '@/locales/messages'
import type { MediaStatsPanelEmits, MediaStatsPanelProps } from '../types/MediaStatsPanel.types'

defineProps<MediaStatsPanelProps>()
const emit = defineEmits<MediaStatsPanelEmits>()
</script>
