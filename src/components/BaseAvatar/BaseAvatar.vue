<template>
	<div
		class="base-avatar"
		:class="[`base-avatar--${shape}`, variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		@click="handleClick">
		<div class="base-avatar__content" :class="classes.content">
			<slot>
				<BaseImage
					v-if="src && !hasImageError"
					:src="src"
					:alt="alt"
					class="base-avatar__img"
					:custom-class="classes.img"
					@error="handleImageError" />
				<BaseText
					v-else
					tag="span"
					:weight="600"
					:size-scale="sizeScale"
					class="base-avatar__initials"
					:custom-class="classes.initials">
					{{ initials }}
				</BaseText>
			</slot>
		</div>
		<span v-if="isOnline" class="base-avatar__online" :class="classes.online"></span>
	</div>
</template>

<script setup lang="ts">
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { computed, ref, watch } from 'vue'
import BaseImage from '../BaseImage/BaseImage.vue'
import BaseText from '../BaseText/BaseText.vue'

import './BaseAvatar.style.scss'
import type { BaseAvatarEmits, BaseAvatarProps } from './BaseAvatar.types'

const props = withDefaults(defineProps<BaseAvatarProps>(), {
	alt: '',
	shape: 'circle',
	variant: 'default',
	isOnline: false,
	sizeScale: 100,
})

const emit = defineEmits<BaseAvatarEmits>()

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-avatar', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
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

/** Генерация инициалов из имени */
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
