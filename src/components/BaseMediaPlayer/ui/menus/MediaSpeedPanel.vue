<template>
	<div class="base-media-player__speed" role="group" :aria-label="UI_PLAYER.SPEED_MENU">
		<div class="base-media-player__speed-title">{{ UI_PLAYER.SPEED_MENU }}</div>
		<div class="base-media-player__speed-value" aria-hidden="true">{{ rateText }}</div>
		<div class="base-media-player__speed-row">
			<BaseButton
				variant="ghost"
				class="base-media-player__speed-step"
				is-focusable-when-disabled
				:is-disabled="rate <= min"
				:aria-label="UI_PLAYER.SPEED_DOWN"
				@click="decrease">
				<MediaIcon name="minus" />
			</BaseButton>
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
			<BaseButton
				variant="ghost"
				class="base-media-player__speed-step"
				is-focusable-when-disabled
				:is-disabled="rate >= max"
				:aria-label="UI_PLAYER.SPEED_UP"
				@click="increase">
				<MediaIcon name="plus" />
			</BaseButton>
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
import MediaIcon from '../controls/MediaIcon.vue'
import { BaseButton } from '@components/BaseButton'
import { useMediaSpeedPanel } from '../../model/menus/useMediaSpeedPanel'

const { inputRef, UI_PLAYER, min, max, step, rate, rateText, fill, presets, select, decrease, increase, onInput } = useMediaSpeedPanel()
</script>
