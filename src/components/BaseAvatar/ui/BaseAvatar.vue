<template>
	<div
		class="base-avatar"
		:class="[`base-avatar--${shape}`, variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		@click="handleClick">
		<div class="base-avatar__content" :class="classes.content">
			<slot>
				<img
					v-if="src && !hasImageError"
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
		<!-- Статус передаётся не только цветом: у точки есть доступное имя -->
		<span v-if="isOnline" class="base-avatar__online" :class="classes.online" role="img" :aria-label="UI_CHAT_TEXT.ONLINE"></span>
	</div>
</template>

<script setup lang="ts">
import { UI_CHAT_TEXT } from '@/locales/messages'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseAvatar } from '../model/useBaseAvatar'
import '../styles/BaseAvatar.style.scss'
import type { BaseAvatarEmits, BaseAvatarProps, BaseAvatarSlots } from '../types/BaseAvatar.types'

const props = withDefaults(
	defineProps<BaseAvatarProps>(),
	kitDefaults('BaseAvatar', {
		variant: DEFAULT_VARIANT,
		alt: '',
		shape: 'circle',
		isOnline: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseAvatarEmits>()
defineSlots<BaseAvatarSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, hasImageError, initials, handleImageError, handleClick } =
	useBaseAvatar(props, emit)
</script>
