<template>
	<div
		class="base-avatar"
		:class="[`base-avatar--${props.shape}`, variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		@click="handleClick">
		<div class="base-avatar__content" :class="classes.content">
			<slot>
				<BaseImage
					v-if="src && !hasImageError"
					:src="src"
					:alt="props.alt"
					class="base-avatar__img"
					:custom-class="classes.img"
					@error="handleImageError" />
				<BaseText
					v-else
					tag="span"
					:weight="UI_FONT_WEIGHT_SEMIBOLD"
					:size-scale="props.sizeScale"
					class="base-avatar__initials"
					:custom-class="classes.initials">
					{{ initials }}
				</BaseText>
			</slot>
		</div>
		<span v-if="props.isOnline" class="base-avatar__online" :class="classes.online"></span>
	</div>
</template>

<script setup lang="ts">
import { useBaseComponent } from '@composables/useBaseComponent'
import { UI_FONT_WEIGHT_SEMIBOLD } from '@constants'
import { computed, ref, watch } from 'vue'
import BaseImage from '@components/BaseImage/ui/BaseImage.vue'
import BaseText from '@components/BaseText/ui/BaseText.vue'

import '../styles/BaseAvatar.style.scss'
import type { BaseAvatarEmits, BaseAvatarProps } from '../model/BaseAvatar.types'

const props = withDefaults(defineProps<BaseAvatarProps>(), {
	alt: '',
	shape: 'circle',
	isOnline: false,
	sizeScale: 100,
})

const emit = defineEmits<BaseAvatarEmits>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-avatar',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'content', 'img', 'initials', 'online'],
})

const hasImageError = ref(false)

// Сбрасываем ошибку при изменении src
watch(
	() => props.src,
	() => {
		hasImageError.value = false
	},
)

const initials = computed(() => {
	if (!props.name) return '?'
	return props.name
		.split(' ')
		.map(n => n[0])
		.slice(0, 2)
		.join('')
		.toUpperCase()
})

function handleImageError(): void {
	hasImageError.value = true
}

function handleClick(event: MouseEvent): void {
	emit('click', event)
}
</script>
