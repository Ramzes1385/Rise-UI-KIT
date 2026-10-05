<template>
	<svg
		ref="mascotRef"
		class="base-avatar__mascot"
		:class="[
			`base-avatar__mascot--${mascot}`,
			`base-avatar__mascot--mood-${mood ?? 'idle'}`,
			{ 'base-avatar__mascot--closed': isEyesClosed },
		]"
		viewBox="0 0 64 64"
		focusable="false"
		v-bind="ariaAttrs">
		<g :transform="tiltTransform">
			<g class="base-avatar__mascot-breath">
				<template v-if="mascot === 'sprout'">
					<path class="base-avatar__mascot-stem" d="M32 22 V13" />
					<path class="base-avatar__mascot-leaf" d="M32 15 C27 8 20 9 18 12 C22 17 28 17 32 15Z" />
					<path class="base-avatar__mascot-leaf" d="M32 13 C36 5 44 5 46 9 C42 14 36 15 32 13Z" />
					<ellipse class="base-avatar__mascot-body" cx="32" cy="40" rx="21" ry="19" />
				</template>
				<path
					v-else-if="mascot === 'cloud'"
					class="base-avatar__mascot-body"
					d="M14 54 C4 54 3 38 13 37 C12 25 25 19 31 27 C35 15 53 17 52 32 C61 32 62 54 51 54 Z" />
				<path
					v-else-if="mascot === 'droplet'"
					class="base-avatar__mascot-body"
					d="M32 6 C32 6 12 29 12 42 C12 53 21 61 32 61 C43 61 52 53 52 42 C52 29 32 6 32 6 Z" />
				<path
					v-else-if="mascot === 'pebble'"
					class="base-avatar__mascot-body"
					d="M9 45 C9 31 19 22 33 22 C47 22 56 31 56 44 C56 54 47 59 32 59 C17 59 9 54 9 45 Z" />
				<template v-else>
					<path
						class="base-avatar__mascot-ray"
						d="M32 3 L36 15 L28 15 Z M32 61 L28 50 L36 50 Z M3 36 L14 32 L14 40 Z M61 36 L50 40 L50 32 Z" />
					<circle class="base-avatar__mascot-body" cx="32" cy="36" r="20" />
				</template>
				<g :transform="faceTransform">
					<ellipse class="base-avatar__mascot-cheek" cx="-13.5" cy="8" rx="3.5" ry="2.2" />
					<ellipse class="base-avatar__mascot-cheek" cx="13.5" cy="8" rx="3.5" ry="2.2" />
					<g v-for="eye in eyes" :key="eye" :transform="`translate(${eye} 0)`">
						<g class="base-avatar__mascot-eyes" :transform="eyeTransform" :opacity="eyeOpacity">
							<circle class="base-avatar__mascot-eye" r="5.5" />
							<circle class="base-avatar__mascot-pupil" r="2.6" :transform="pupilTransform" />
						</g>
						<path class="base-avatar__mascot-lid" d="M-4.5 1 Q0 4.5 4.5 1" :opacity="lidOpacity" />
					</g>
					<g class="base-avatar__mascot-brows" :opacity="browOpacity">
						<path :d="browLeftPath" />
						<path :d="browRightPath" />
					</g>
					<path class="base-avatar__mascot-mouth" :d="mouthPath" />
				</g>
			</g>
		</g>
	</svg>
</template>

<script setup lang="ts">
import { useAvatarMascot } from '../model/useAvatarMascot'
import type { AvatarMascotProps } from '../types/BaseAvatar.types'

const props = defineProps<AvatarMascotProps>()

const {
	mascotRef,
	tiltTransform,
	faceTransform,
	eyes,
	eyeTransform,
	eyeOpacity,
	pupilTransform,
	lidOpacity,
	browOpacity,
	browLeftPath,
	browRightPath,
	mouthPath,
	ariaAttrs,
} = useAvatarMascot(props)
</script>
