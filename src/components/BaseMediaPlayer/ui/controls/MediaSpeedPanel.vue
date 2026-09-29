<template>
	<div class="base-media-player__speed" role="group" :aria-label="UI_PLAYER.SPEED_MENU">
		<div class="base-media-player__speed-title">{{ UI_PLAYER.SPEED_MENU }}</div>
		<div class="base-media-player__speed-value" aria-hidden="true">{{ rateText }}</div>
		<div class="base-media-player__speed-row">
			<button
				type="button"
				class="base-media-player__speed-step"
				:aria-label="UI_PLAYER.SPEED_DOWN"
				:disabled="rate <= min"
				@click="decrease">
				<MediaIcon name="minus" />
			</button>
			<input
				ref="inputRef"
				class="base-media-player__speed-range"
				type="range"
				:min="min"
				:max="max"
				:step="step"
				:value="rate"
				:aria-label="UI_PLAYER.SPEED_MENU"
				:aria-valuetext="rateText"
				:style="{ '--speed-fill': fill }"
				@input="onInput" />
			<button
				type="button"
				class="base-media-player__speed-step"
				:aria-label="UI_PLAYER.SPEED_UP"
				:disabled="rate >= max"
				@click="increase">
				<MediaIcon name="plus" />
			</button>
		</div>
		<div class="base-media-player__speed-presets">
			<button
				v-for="preset in presets"
				:key="preset.value"
				type="button"
				class="base-media-player__speed-preset"
				:class="{ 'base-media-player__speed-preset--active': preset.isActive }"
				:aria-pressed="preset.isActive"
				@click="select(preset.value)">
				{{ preset.label }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import MediaIcon from './MediaIcon.vue'
import { useMediaSpeedPanel } from '../../model/controls/useMediaSpeedPanel'

const { inputRef, UI_PLAYER, min, max, step, rate, rateText, fill, presets, select, decrease, increase, onInput } = useMediaSpeedPanel()
</script>
