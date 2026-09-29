<template>
	<div ref="panelRef" class="base-media-player__watch" role="group" :aria-label="UI_PLAYER.WATCH">
		<p class="base-media-player__watch-title">{{ UI_PLAYER.WATCH }}</p>
		<p class="base-media-player__watch-hint">{{ UI_PLAYER.WATCH_HINT }}</p>
		<div class="base-media-player__watch-row">
			<input
				class="base-media-player__watch-input"
				:value="watchLink"
				readonly
				:aria-label="UI_PLAYER.WATCH_LINK"
				@focus="selectLink" />
			<button type="button" class="base-media-player__watch-button" @click="copyWatchLink">
				<MediaIcon name="copy" />
				{{ UI_PLAYER.WATCH_COPY }}
			</button>
		</div>
		<form class="base-media-player__watch-row" novalidate @submit.prevent="invite">
			<input
				v-model="email"
				type="email"
				class="base-media-player__watch-input"
				autocomplete="email"
				:placeholder="UI_PLAYER.WATCH_EMAIL"
				:aria-label="UI_PLAYER.WATCH_EMAIL"
				:aria-invalid="isInvalid" />
			<button type="submit" class="base-media-player__watch-button base-media-player__watch-button--primary">
				{{ UI_PLAYER.WATCH_INVITE }}
			</button>
		</form>
		<p v-if="isInvalid" class="base-media-player__watch-error" role="alert">{{ UI_PLAYER.WATCH_EMAIL_INVALID }}</p>
		<p class="base-media-player__watch-subtitle">{{ UI_PLAYER.WATCH_MEMBERS }}</p>
		<ul class="base-media-player__watch-members">
			<li v-for="member in watchMembers" :key="member.id" class="base-media-player__watch-member">
				<span class="base-media-player__watch-avatar" aria-hidden="true">
					<img v-if="member.avatar" class="base-media-player__watch-image" :src="member.avatar" alt="" />
					<template v-else>{{ member.initials }}</template>
				</span>
				{{ ' ' }}
				<span class="base-media-player__watch-person">
					<span class="base-media-player__watch-name">{{ member.name }}</span>
					{{ ' ' }}
					<span v-if="member.email" class="base-media-player__watch-email">{{ member.email }}</span>
				</span>
				{{ ' ' }}
				<span class="base-media-player__watch-status" :class="`base-media-player__watch-status--${member.status}`">
					{{ member.statusText }}
				</span>
			</li>
			<li v-if="watchMembers.length === 0" class="base-media-player__watch-empty">{{ UI_PLAYER.WATCH_EMPTY }}</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import MediaIcon from './MediaIcon.vue'
import { UI_PLAYER } from '../model/messages'
import { useMediaWatchPanel } from '../model/useMediaWatchPanel'

const { panelRef, watchLink, watchMembers, copyWatchLink, email, isInvalid, invite, selectLink } = useMediaWatchPanel()
</script>
