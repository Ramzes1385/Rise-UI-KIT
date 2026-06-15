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
import BaseImage from '@components/BaseImage/ui/BaseImage.vue'
import BaseText from '@components/BaseText/ui/BaseText.vue'

import '../styles/BaseAvatar.style.scss'
import type { BaseAvatarEmits, BaseAvatarProps } from '../model/BaseAvatar.types'

const props = defineProps<BaseAvatarProps>()

const emit = defineEmits<BaseAvatarEmits>()

const alt = computed(() => props.alt ?? '')
const shape = computed(() => props.shape ?? 'circle')
const variant = computed(() => props.variant ?? 'default')
const isOnline = computed(() => props.isOnline ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({ block: 'base-avatar', getVariant: () => variant.value })
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
