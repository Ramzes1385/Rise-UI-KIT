<template>
	<ul :class="[ui('legend'), customClass]" :aria-label="UI_IMAGE_MAP.LEGEND">
		<li v-for="group in groups" :key="group.id" :class="ui('legend-item')">
			<span :class="ui('swatch')" :style="group.color ? { '--im-swatch': group.color } : undefined" aria-hidden="true">
				<BaseIcon v-if="group.icon" :name="group.icon" />
			</span>
			{{ group.title }}
		</li>
	</ul>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_IMAGE_MAP } from '@/locales/messages'
import type { ImageMapLegendProps } from '../types/internal/ImageMapLegend.types'

withDefaults(defineProps<ImageMapLegendProps>(), {
	ui: (part: string) => (part === 'root' ? 'base-image-map' : `base-image-map__${part}`),
})
</script>
