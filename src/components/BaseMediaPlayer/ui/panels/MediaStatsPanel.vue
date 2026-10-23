<template>
	<section class="base-media-player__stats" :aria-label="UI_PLAYER.STATS">
		<div class="base-media-player__stats-header">
			<span class="base-media-player__stats-title">{{ UI_PLAYER.STATS }}</span>
			<MediaControlButton icon="copy" :label="UI_PLAYER.STATS_COPY" @click="emit('copy')" />
			<MediaControlButton icon="close" :label="UI_ARIA.CLOSE" @click="emit('close')" />
		</div>
		<div class="base-media-player__stats-tabs">
			<BaseButton
				v-for="item in tabs"
				:key="item.id"
				variant="ghost"
				class="base-media-player__stats-tab"
				:aria-pressed="tab === item.id"
				@click="selectTab(item.id)">
				{{ item.label }}
				<BaseBadge v-if="item.id === 'events'" class="base-media-player__stats-count" :label="String(events.length)" />
			</BaseButton>
		</div>
		<dl v-if="tab === 'metrics'" class="base-media-player__stats-list">
			<div v-for="row in rows" :key="row.label" class="base-media-player__stats-row">
				<dt>{{ row.label }}</dt>
				<dd>{{ row.value }}</dd>
			</div>
		</dl>
		<ol v-else class="base-media-player__stats-events" :aria-label="UI_PLAYER.DEBUG_EVENTS">
			<li v-for="entry in events" :key="entry.id" class="base-media-player__stats-event">
				<span class="base-media-player__stats-clock">{{ entry.clock }}</span>
				<span class="base-media-player__stats-position">{{ entry.position }}</span>
				<span class="base-media-player__stats-type">{{ entry.type }}</span>
				<span v-if="entry.detail" class="base-media-player__stats-detail">{{ entry.detail }}</span>
			</li>
			<li v-if="events.length === 0" class="base-media-player__stats-empty">
				<BaseEmpty is-compact variant="ghost" :description="UI_PLAYER.DEBUG_EMPTY" />
			</li>
		</ol>
	</section>
</template>

<script setup lang="ts">
import { BaseBadge } from '@components/BaseBadge'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseButton } from '@components/BaseButton'
import { UI_ARIA, UI_PLAYER } from '../../model/messages'
import MediaControlButton from '../controls/MediaControlButton.vue'
import { useMediaStatsPanel } from '../../model/panels/useMediaStatsPanel'
import type { MediaStatsPanelEmits, MediaStatsPanelProps } from '../../types/panels/MediaStatsPanel.types'

defineProps<MediaStatsPanelProps>()
const emit = defineEmits<MediaStatsPanelEmits>()

const { tab, tabs, selectTab } = useMediaStatsPanel()
</script>
