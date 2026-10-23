<template>
	<div class="base-media-player__captions">
		<div
			class="base-media-player__caption-box base-media-player__caption-box--color-white base-media-player__caption-box--background-semi base-media-player__caption-box--raised base-presentation-player__caption-box"
			:style="boxStyle">
			<span v-for="(line, lineIndex) in lines" :key="lineIndex" class="base-media-player__caption-line">
				<span
					v-for="(segment, segmentIndex) in line"
					:key="segmentIndex"
					:class="{
						'base-media-player__caption--italic': segment.isItalic,
						'base-media-player__caption--bold': segment.isBold,
						'base-media-player__caption--underline': segment.isUnderline,
					}">
					{{ segment.text }}
				</span>
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { PresentationCaptionsProps } from '../types/PresentationModel.types'

defineProps<PresentationCaptionsProps>()
</script>
