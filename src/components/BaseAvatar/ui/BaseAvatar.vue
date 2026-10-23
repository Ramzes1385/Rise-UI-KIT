<template>
	<div
		:class="[
			ui('root'),
			`base-avatar--${shape}`,
			ringClass,
			variantClass,
			{ 'base-avatar--clickable': isClickable, 'base-avatar--disabled': isDisabled },
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		v-bind="clickableAttributes"
		:aria-label="buttonLabel"
		@click="handleClick"
		@keydown="handleKeydown">
		<div :class="[ui('content'), classes.content]">
			<slot>
				<AvatarMascot
					v-if="mascot !== 'none'"
					:mascot="mascot"
					:label="alt"
					:mood="currentMood"
					:is-eyes-closed="isEyesClosed"
					:is-blinking="isBlinking"
					:class="[ui('mascot'), classes.mascot]" />
				<img
					v-else-if="src && !hasImageError"
					ref="imgRef"
					:src="src"
					:alt="alt"
					:class="[ui('img'), { 'base-avatar__img--loaded': isImageLoaded }, classes.img]"
					loading="lazy"
					decoding="async"
					@load="handleImageLoad"
					@error="handleImageError" />
				<span v-else :class="[ui('initials'), classes.initials]">{{ initials }}</span>
			</slot>
		</div>
		<Transition name="base-avatar-online">
			<span v-if="isOnline" :class="[ui('online'), classes.online]" role="img" :aria-label="UI_CHAT_TEXT.ONLINE"></span>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseAvatar.style.scss'
import AvatarMascot from './AvatarMascot.vue'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { useBaseAvatar } from '../model/useBaseAvatar'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseAvatarEmits, BaseAvatarExpose, BaseAvatarProps, BaseAvatarSlots } from '../types/BaseAvatar.types'

const props = withDefaults(
	defineProps<BaseAvatarProps>(),
	kitDefaults('BaseAvatar', {
		variant: DEFAULT_VARIANT,
		alt: '',
		shape: 'square',
		isOnline: false,
		ring: 'none',
		mascot: 'none',
		isEyesClosed: false,
		isBlinking: true,
		mood: 'idle',
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseAvatarEmits>()
defineSlots<BaseAvatarSlots>()

const {
	ui,
	sizeScaleStyle,
	ringClass,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	imgRef,
	hasImageError,
	isImageLoaded,
	initials,
	handleImageError,
	handleImageLoad,
	isClickable,
	clickableAttributes,
	buttonLabel,
	handleClick,
	handleKeydown,
	currentMood,
	react,
} = useBaseAvatar(props, emit)

defineExpose<BaseAvatarExpose>({ react })
</script>
