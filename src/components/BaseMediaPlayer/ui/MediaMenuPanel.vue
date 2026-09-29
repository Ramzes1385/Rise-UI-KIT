<template>
	<div class="base-media-player__menu" :style="frameStyle">
		<Transition :name="`base-media-player__menu-${direction}`">
			<div
				:key="viewKey"
				ref="viewRef"
				class="base-media-player__menu-view"
				role="menu"
				:aria-label="current.title"
				@keydown="onKeydown">
				<button
					v-if="isNested"
					type="button"
					class="base-media-player__menu-back"
					role="menuitem"
					tabindex="-1"
					:aria-label="backLabel"
					@click="back">
					<MediaIcon name="chevron-left" />
					<span class="base-media-player__menu-label">{{ current.title }}</span>
				</button>
				<div v-else class="base-media-player__menu-title" aria-hidden="true">{{ current.title }}</div>
				<button
					v-for="(item, index) in current.items"
					:key="item.id"
					type="button"
					class="base-media-player__menu-item"
					:class="{ 'base-media-player__menu-item--checked': item.isChecked }"
					:role="item.isChecked === undefined ? 'menuitem' : 'menuitemradio'"
					:aria-checked="item.isChecked === undefined ? undefined : item.isChecked"
					:data-index="index"
					tabindex="-1"
					@click="choose(item)">
					<span class="base-media-player__menu-check" aria-hidden="true">
						<MediaIcon v-if="item.isChecked" name="check" />
					</span>
					<span class="base-media-player__menu-label">{{ item.label }}</span>
					<template v-if="item.hint">
						{{ ' ' }}<span class="base-media-player__menu-hint">{{ item.hint }}</span>
					</template>
					<MediaIcon v-if="item.children" class="base-media-player__menu-arrow" name="chevron-right" />
				</button>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import MediaIcon from './MediaIcon.vue'
import { useMediaMenuPanel } from '../model/useMediaMenuPanel'
import type { MediaMenuPanelEmits, MediaMenuPanelProps } from '../types/MediaMenu.types'

const props = defineProps<MediaMenuPanelProps>()
const emit = defineEmits<MediaMenuPanelEmits>()

const { viewRef, current, direction, frameStyle, isNested, viewKey, backLabel, back, choose, onKeydown } = useMediaMenuPanel(props, emit)
</script>
