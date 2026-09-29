<template>
	<Transition name="base-media-player__episodes" :duration="{ enter: 720, leave: 240 }">
		<section
			v-if="isEpisodesOpen"
			ref="panelRef"
			class="base-media-player__episodes"
			:aria-label="UI_PLAYER.EPISODES"
			@keydown="onKeydown">
			<div class="base-media-player__episodes-header">
				<span class="base-media-player__episodes-title">{{ UI_PLAYER.EPISODES }}</span>
				<MediaControlButton icon="close" :label="UI_ARIA.CLOSE" @click="close" />
			</div>
			<div v-if="seasonTabs.length > 1" class="base-media-player__episodes-tabs">
				<button
					v-for="tab in seasonTabs"
					:key="tab.id"
					type="button"
					class="base-media-player__episodes-tab"
					:aria-pressed="tab.id === seasonId"
					@click="selectSeason(tab.id)">
					{{ tab.title }}
				</button>
			</div>
			<ol class="base-media-player__episodes-list">
				<li v-for="(card, index) in episodeCards" :key="card.id" :style="{ '--media-item-index': index }">
					<button
						type="button"
						class="base-media-player__episode-card"
						:class="{ 'base-media-player__episode-card--current': card.isCurrent }"
						:aria-current="card.isCurrent ? 'true' : undefined"
						@click="chooseEpisode(card.id)">
						<span class="base-media-player__episode-number" aria-hidden="true">{{ card.number }}</span>
						<span class="base-media-player__episode-cover" aria-hidden="true">
							<img v-if="card.poster" class="base-media-player__episode-image" :src="card.poster" alt="" loading="lazy" />
							<span v-if="card.duration" class="base-media-player__episode-duration">{{ card.duration }}</span>
						</span>
						<span class="base-media-player__episode-info">
							<span class="base-media-player__episode-name">{{ card.title }}</span>
							<span v-if="card.description" class="base-media-player__episode-description">{{ card.description }}</span>
						</span>
					</button>
				</li>
			</ol>
		</section>
	</Transition>
</template>

<script setup lang="ts">
import { UI_ARIA, UI_PLAYER } from '../../model/messages'
import MediaControlButton from '../controls/MediaControlButton.vue'
import { useMediaEpisodesPanel } from '../../model/panels/useMediaEpisodesPanel'

const { panelRef, isEpisodesOpen, seasonId, seasonTabs, episodeCards, selectSeason, chooseEpisode, close, onKeydown } =
	useMediaEpisodesPanel()
</script>
