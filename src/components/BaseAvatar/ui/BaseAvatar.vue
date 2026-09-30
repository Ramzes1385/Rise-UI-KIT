<template>
	<div
		class="base-avatar"
		:class="[`base-avatar--${shape}`, ringClass, variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		@click="handleClick">
		<div class="base-avatar__content" :class="classes.content">
			<slot>
				<AvatarMascot v-if="mascot !== 'none'" :label="alt" :is-eyes-closed="isEyesClosed" :class="classes.mascot" />
				<img
					v-else-if="src && !hasImageError"
					:src="src"
					:alt="alt"
					class="base-avatar__img"
					:class="classes.img"
					loading="lazy"
					decoding="async"
					@error="handleImageError" />
				<span v-else class="base-avatar__initials" :class="classes.initials">{{ initials }}</span>
			</slot>
		</div>
		<span v-if="isOnline" class="base-avatar__online" :class="classes.online" role="img" :aria-label="UI_CHAT_TEXT.ONLINE"></span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseAvatar.style.scss'
import AvatarMascot from './AvatarMascot.vue'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { useBaseAvatar } from '../model/useBaseAvatar'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseAvatarEmits, BaseAvatarProps, BaseAvatarSlots } from '../types/BaseAvatar.types'

const props = withDefaults(
	defineProps<BaseAvatarProps>(),
	kitDefaults('BaseAvatar', {
		variant: DEFAULT_VARIANT,
		alt: '',
		shape: 'circle',
		isOnline: false,
		ring: 'none',
		mascot: 'none',
		isEyesClosed: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseAvatarEmits>()
defineSlots<BaseAvatarSlots>()

const {
	sizeScaleStyle,
	ringClass,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	hasImageError,
	initials,
	handleImageError,
	handleClick,
} = useBaseAvatar(props, emit)
</script>
