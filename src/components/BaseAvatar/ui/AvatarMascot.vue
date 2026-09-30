<template>
	<svg
		ref="mascotRef"
		class="base-avatar__mascot"
		:class="{ 'base-avatar__mascot--closed': isEyesClosed }"
		viewBox="0 0 64 64"
		focusable="false"
		v-bind="ariaAttrs">
		<path class="base-avatar__mascot-stem" d="M32 22 V13" />
		<path class="base-avatar__mascot-leaf" d="M32 15 C27 8 20 9 18 12 C22 17 28 17 32 15Z" />
		<path class="base-avatar__mascot-leaf" d="M32 13 C36 5 44 5 46 9 C42 14 36 15 32 13Z" />
		<ellipse class="base-avatar__mascot-body" cx="32" cy="40" rx="21" ry="19" />
		<ellipse class="base-avatar__mascot-cheek" cx="18.5" cy="45" rx="3.5" ry="2.2" />
		<ellipse class="base-avatar__mascot-cheek" cx="45.5" cy="45" rx="3.5" ry="2.2" />
		<g v-if="isEyesClosed" class="base-avatar__mascot-lids">
			<path d="M20.5 38 Q25 41.5 29.5 38" />
			<path d="M34.5 38 Q39 41.5 43.5 38" />
		</g>
		<g v-else>
			<circle class="base-avatar__mascot-eye" cx="25" cy="37" r="5.5" />
			<circle class="base-avatar__mascot-eye" cx="39" cy="37" r="5.5" />
			<g class="base-avatar__mascot-pupils" :transform="pupilTransform">
				<circle cx="25" cy="37" r="2.6" />
				<circle cx="39" cy="37" r="2.6" />
			</g>
		</g>
		<path class="base-avatar__mascot-mouth" d="M28.5 47 Q32 50 35.5 47" />
	</svg>
</template>

<script setup lang="ts">
import { useAvatarMascot } from '../model/useAvatarMascot'
import type { AvatarMascotProps } from '../types/BaseAvatar.types'

const props = defineProps<AvatarMascotProps>()

const { mascotRef, pupilTransform, ariaAttrs } = useAvatarMascot(props)
</script>
