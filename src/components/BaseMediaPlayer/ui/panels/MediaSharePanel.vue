<template>
	<BaseModal
		:custom-class="{ root: 'base-media-player__share' }"
		:is-open="isShareOpen"
		:title="UI_PLAYER.SHARE"
		is-contained
		@update:is-open="closeShare">
		<div class="base-media-player__share-body">
			<div
				class="base-media-player__share-networks"
				:class="{
					'base-media-player__share-networks--back': canScrollBack,
					'base-media-player__share-networks--forward': canScrollForward,
				}">
				<button
					v-if="canScrollBack"
					type="button"
					class="base-media-player__share-scroll base-media-player__share-scroll--back"
					:aria-label="UI_PLAYER.SHARE_PREVIOUS"
					@click="scrollNetworks(-1)">
					<MediaIcon name="chevron-left" />
				</button>
				<ul ref="listRef" class="base-media-player__share-list" :aria-label="UI_PLAYER.SHARE_NETWORKS" @scroll="updateScroll">
					<li
						v-for="(item, index) in shareItems"
						:key="item.network"
						class="base-media-player__share-item"
						:style="{ '--media-item-index': index }">
						<a
							class="base-media-player__share-link"
							:href="item.href"
							:target="item.isExternal ? '_blank' : undefined"
							rel="noopener noreferrer"
							@click="onNetwork(item.network)">
							<span class="base-media-player__share-tile" :style="{ '--media-share-color': item.color }">
								<MediaIcon :name="item.icon" />
							</span>
							<span class="base-media-player__share-label">{{ item.label }}</span>
						</a>
					</li>
					<li v-if="canShareSystem" class="base-media-player__share-item" :style="{ '--media-item-index': shareItems.length }">
						<button type="button" class="base-media-player__share-link" @click="shareSystem">
							<span class="base-media-player__share-tile base-media-player__share-tile--more"><MediaIcon name="more" /></span>
							<span class="base-media-player__share-label">{{ UI_PLAYER.SHARE_MORE }}</span>
						</button>
					</li>
				</ul>
				<button
					v-if="canScrollForward"
					type="button"
					class="base-media-player__share-scroll base-media-player__share-scroll--forward"
					:aria-label="UI_PLAYER.SHARE_NEXT"
					@click="scrollNetworks(1)">
					<MediaIcon name="chevron-right" />
				</button>
			</div>
			<div class="base-media-player__share-row">
				<input
					ref="linkRef"
					class="base-media-player__share-input"
					:value="shareLink"
					readonly
					:aria-label="UI_PLAYER.SHARE_LINK"
					@focus="selectLink" />
				<button
					type="button"
					class="base-media-player__share-copy"
					:class="{ 'base-media-player__share-copy--done': isCopied }"
					@click="copyShareLink">
					<MediaIcon :name="isCopied ? 'check' : 'link'" />
					{{ isCopied ? UI_PLAYER.SHARE_COPIED : UI_PLAYER.SHARE_COPY }}
				</button>
			</div>
			<label class="base-media-player__share-time">
				<input v-model="isAtTime" class="base-media-player__share-check" type="checkbox" />
				{{ atTimeLabel }}
			</label>
		</div>
	</BaseModal>
</template>

<script setup lang="ts">
import '../../styles/MediaShare.style.scss'
import { UI_PLAYER } from '../../model/messages'
import MediaIcon from '../controls/MediaIcon.vue'
import { BaseModal } from '@components/BaseModal'
import { useMediaSharePanel } from '../../model/sharing/useMediaSharePanel'

const {
	isShareOpen,
	closeShare,
	listRef,
	canScrollBack,
	canScrollForward,
	updateScroll,
	scrollNetworks,
	shareItems,
	onNetwork,
	canShareSystem,
	shareSystem,
	linkRef,
	shareLink,
	selectLink,
	isCopied,
	copyShareLink,
	isAtTime,
	atTimeLabel,
} = useMediaSharePanel()
</script>
