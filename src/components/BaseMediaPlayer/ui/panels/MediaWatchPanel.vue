<template>
	<div ref="panelRef" class="base-media-player__watch" role="group" :aria-label="UI_PLAYER.WATCH">
		<p class="base-media-player__watch-title">{{ UI_PLAYER.WATCH }}</p>
		<p class="base-media-player__watch-hint">{{ UI_PLAYER.WATCH_HINT }}</p>
		<div class="base-media-player__watch-row">
			<BaseInput
				class="base-media-player__watch-input"
				:model-value="watchLink"
				is-readonly
				:aria-label="UI_PLAYER.WATCH_LINK"
				@focus="selectLink" />
			<BaseButton variant="soft" class="base-media-player__watch-button" @click="copyWatchLink">
				<template #left><MediaIcon name="copy" /></template>
				{{ UI_PLAYER.WATCH_COPY }}
			</BaseButton>
		</div>
		<form class="base-media-player__watch-row" novalidate @submit.prevent="invite">
			<BaseInput
				v-model="email"
				type="email"
				class="base-media-player__watch-input"
				:input-attrs="{ autocomplete: 'email', 'aria-invalid': isInvalid }"
				:placeholder="UI_PLAYER.WATCH_EMAIL"
				:aria-label="UI_PLAYER.WATCH_EMAIL" />
			<BaseButton type="submit" class="base-media-player__watch-button base-media-player__watch-button--primary">
				{{ UI_PLAYER.WATCH_INVITE }}
			</BaseButton>
		</form>
		<p v-if="isInvalid" class="base-media-player__watch-error" role="alert">{{ UI_PLAYER.WATCH_EMAIL_INVALID }}</p>
		<p class="base-media-player__watch-subtitle">{{ UI_PLAYER.WATCH_MEMBERS }}</p>
		<ul class="base-media-player__watch-members">
			<li v-for="member in watchMembers" :key="member.id" class="base-media-player__watch-member">
				<BaseAvatar
					class="base-media-player__watch-avatar"
					:src="member.avatar"
					:name="member.name"
					shape="square"
					aria-hidden="true" />
				{{ ' ' }}
				<span class="base-media-player__watch-person">
					<span class="base-media-player__watch-name">{{ member.name }}</span>
					{{ ' ' }}
					<span v-if="member.email" class="base-media-player__watch-email">{{ member.email }}</span>
				</span>
				{{ ' ' }}
				<BaseBadge
					variant="soft"
					:status="member.badgeStatus"
					class="base-media-player__watch-status"
					:class="`base-media-player__watch-status--${member.status}`"
					:label="member.statusText" />
			</li>
			<li v-if="watchMembers.length === 0" class="base-media-player__watch-empty">
				<BaseEmpty is-compact variant="ghost" :description="UI_PLAYER.WATCH_EMPTY" />
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { UI_PLAYER } from '../../model/messages'
import MediaIcon from '../controls/MediaIcon.vue'
import { BaseBadge } from '@components/BaseBadge'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseInput } from '@components/BaseInput'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { useMediaWatchPanel } from '../../model/sharing/useMediaWatchPanel'

const { panelRef, watchLink, watchMembers, copyWatchLink, email, isInvalid, invite, selectLink } = useMediaWatchPanel()
</script>
