<template>
	<div
		class="base-avatar"
		:class="[`base-avatar--${shape}`, variantClass]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		@click="handleClick">
		<div class="base-avatar__content">
			<BaseImage v-if="src" :src="src" :alt="alt" class="base-avatar__img" />
			<BaseText v-else tag="span" :weight="600" :size-scale="sizeScale" class="base-avatar__initials">
				{{ initials }}
			</BaseText>
		</div>
		<span v-if="isOnline" class="base-avatar__online"></span>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import BaseImage from '@/shared/ui/BaseImage/BaseImage.vue'
import { BaseText } from '@/shared/ui/BaseText'
import { computed } from 'vue'

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

function handleClick(): void {
	emit('click')
}
</script>
