<template>
	<BaseTooltip is-wrapperless :text="label">
		<button
			type="button"
			role="switch"
			class="base-media-player__control base-media-player__switch"
			:aria-checked="isChecked"
			:aria-label="label"
			@click="emit('update:isChecked', !isChecked)">
			<span class="base-media-player__switch-track" aria-hidden="true">
				<span class="base-media-player__switch-thumb"><MediaIcon :name="isChecked ? 'play' : 'pause'" /></span>
			</span>
		</button>
	</BaseTooltip>
</template>

<script setup lang="ts">
import MediaIcon from './MediaIcon.vue'
import { BaseTooltip } from '@components/BaseTooltip'
import type { MediaSwitchEmits, MediaSwitchProps } from '../../types/controls/MediaControls.types'

defineProps<MediaSwitchProps>()
const emit = defineEmits<MediaSwitchEmits>()
</script>
