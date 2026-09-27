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
import { computed, ref, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { SIZE_SCALE_DEFAULT, UI_CHAT_TEXT } from '@constants'
import '../styles/BaseAvatar.style.scss'
import type { BaseAvatarEmits, BaseAvatarProps, BaseAvatarSlots } from '../model/BaseAvatar.types'

const props = withDefaults(defineProps<BaseAvatarProps>(), {
	alt: '',
	shape: 'circle',
	isOnline: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseAvatarEmits>()
defineSlots<BaseAvatarSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-avatar', props, ['root', 'content', 'img', 'initials', 'online'])

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
		.map(n => n[0] ?? '')
		.filter(Boolean)
		.slice(0, 2)
		.join('')
		.toUpperCase() || '?'
})

function handleImageError(): void {
	hasImageError.value = true
}

function handleClick(event: MouseEvent): void {
	emit('click', event)
}
</script>
