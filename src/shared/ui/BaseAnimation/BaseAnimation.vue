<template>
	<!-- Одиночная анимация -->
	<Transition
		v-if="!isGroup"
		:name="name"
		:mode="mode"
		appear
		@after-enter="handleAfterEnter"
		@after-leave="handleAfterLeave">
		<div v-if="show" class="base-animation">
			<slot />
		</div>
	</Transition>

	<!-- Групповая анимация -->
	<TransitionGroup
		v-else
		:name="name"
		:tag="tag"
		appear
		@after-enter="handleAfterEnter"
		@after-leave="handleAfterLeave">
		<div v-if="show">
			<slot />
		</div>
	</TransitionGroup>
</template>

<script setup lang="ts">
import './BaseAnimation.style.scss'
import type { BaseAnimationEmits, BaseAnimationProps } from './BaseAnimation.types'

const props = withDefaults(defineProps<BaseAnimationProps>(), {
	show: true,
	name: 'fade',
	mode: 'out-in',
	isGroup: false,
	tag: 'div',
})

const emit = defineEmits<BaseAnimationEmits>()

function handleAfterEnter(): void {
	emit('after-enter')
}

function handleAfterLeave(): void {
	emit('after-leave')
}
</script>
