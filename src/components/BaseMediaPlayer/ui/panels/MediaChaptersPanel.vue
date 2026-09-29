<template>
	<Transition name="base-media-player__chapters" :duration="{ enter: 720, leave: 240 }">
		<section
			v-if="isChaptersOpen"
			ref="panelRef"
			class="base-media-player__chapters"
			:aria-label="UI_PLAYER.CHAPTERS"
			@keydown="onKeydown">
			<div class="base-media-player__chapters-header">
				<span class="base-media-player__chapters-title">{{ UI_PLAYER.CHAPTERS }}</span>
				<MediaControlButton icon="close" :label="UI_ARIA.CLOSE" @click="close" />
			</div>
			<ol class="base-media-player__chapters-list">
				<li v-for="(item, index) in chapterItems" :key="item.id" :style="{ '--media-item-index': index }">
					<button
						type="button"
						class="base-media-player__chapter-item"
						:class="{ 'base-media-player__chapter-item--current': item.isCurrent }"
						:style="{ '--segment-color': item.color, '--chapter-progress': item.progress }"
						:aria-current="item.isCurrent ? 'true' : undefined"
						@click="chooseChapter(item.start)">
						<span class="base-media-player__chapter-mark" aria-hidden="true" />
						<span class="base-media-player__chapter-name">{{ item.title }}</span>
						<span class="base-media-player__chapter-start">{{ item.time }}</span>
						<span class="base-media-player__chapter-progress" aria-hidden="true" />
					</button>
				</li>
			</ol>
		</section>
	</Transition>
</template>

<script setup lang="ts">
import { UI_ARIA, UI_PLAYER } from '../../model/messages'
import MediaControlButton from '../controls/MediaControlButton.vue'
import { useMediaChaptersPanel } from '../../model/panels/useMediaChaptersPanel'

const { panelRef, isChaptersOpen, chapterItems, chooseChapter, close, onKeydown } = useMediaChaptersPanel()
</script>
