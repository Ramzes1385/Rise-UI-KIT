<template>
	<Transition name="base-media-player__episodes" :duration="transitionDuration">
		<section
			v-if="isEpisodesOpen"
			ref="panelRef"
			class="base-media-player__episodes"
			:aria-label="UI_PLAYER.EPISODES"
			@keydown="onKeydown">
			<div class="base-media-player__episodes-header">
				<div v-if="hasActors" class="base-media-player__episodes-views">
					<button
						type="button"
						class="base-media-player__episodes-view"
						:aria-pressed="view === 'episodes'"
						@click="showView('episodes')">
						{{ UI_PLAYER.EPISODES }}
					</button>
					<button
						type="button"
						class="base-media-player__episodes-view"
						:aria-pressed="view === 'actors'"
						@click="showView('actors')">
						{{ UI_PLAYER.ACTORS }}
					</button>
				</div>
				<span v-else class="base-media-player__episodes-title">{{ UI_PLAYER.EPISODES }}</span>
				<MediaControlButton icon="close" :label="UI_ARIA.CLOSE" @click="close" />
			</div>
			<div v-if="view === 'actors'" class="base-media-player__actors">
				<div
					v-for="group in actorGroups"
					:key="group.id"
					class="base-media-player__actors-group"
					role="group"
					:aria-label="group.title">
					<p v-if="actorGroups.length > 1" class="base-media-player__actors-title">{{ group.title }}</p>
					<ul class="base-media-player__actors-list">
						<li
							v-for="(actor, index) in group.actors"
							:key="actor.id"
							class="base-media-player__actor"
							:style="{ '--media-item-index': index }">
							<BaseAvatar class="base-media-player__actor-photo" :src="actor.photo" :name="actor.name" shape="square" />
							<span class="base-media-player__actor-info">
								<span class="base-media-player__actor-name">{{ actor.name }}</span>
								<span v-if="actor.role" class="base-media-player__actor-role">{{ actor.role }}</span>
							</span>
							<span v-if="actor.links.length" class="base-media-player__actor-links">
								<BaseLink
									v-for="link in actor.links"
									:key="link.url"
									variant="ghost"
									class="base-media-player__actor-link"
									:href="link.url"
									target="_blank"
									:has-external-icon="false"
									:aria-label="link.ariaLabel"
									:data-tooltip="link.label"
									:style="{ '--media-share-color': link.color }">
									<MediaIcon :name="link.icon" />
								</BaseLink>
							</span>
						</li>
					</ul>
				</div>
			</div>
			<div v-else-if="seasonTabs.length > 1" class="base-media-player__episodes-tabs">
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
			<ol v-if="view === 'episodes'" class="base-media-player__episodes-list">
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
import { BaseLink } from '@components/BaseLink'
import MediaIcon from '../controls/MediaIcon.vue'
import { BaseAvatar } from '@components/BaseAvatar'
import { UI_ARIA, UI_PLAYER } from '../../model/messages'
import MediaControlButton from '../controls/MediaControlButton.vue'
import { useMediaEpisodesPanel } from '../../model/panels/useMediaEpisodesPanel'

const {
	panelRef,
	transitionDuration,
	isEpisodesOpen,
	seasonId,
	seasonTabs,
	episodeCards,
	selectSeason,
	chooseEpisode,
	close,
	onKeydown,
	view,
	showView,
	hasActors,
	actorGroups,
} = useMediaEpisodesPanel()
</script>
