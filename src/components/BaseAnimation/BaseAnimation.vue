<template>
	<!-- Одиночная анимация -->
	<Transition
		v-if="!isGroup"
		:name="name"
		:mode="mode"
		appear
		@after-enter="handleAfterEnter"
		@after-leave="handleAfterLeave">
		<div v-if="show" class="base-animation" :class="classes.root">
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
		<div v-if="show" :class="classes.root">
			<slot />
		</div>
	</TransitionGroup>
</template>

<script setup lang="ts">
import { useCustomClass } from '@composables/useCustomClass'
import { computed, getCurrentInstance } from 'vue'
import './BaseAnimation.style.scss'
import type { BaseAnimationEmits, BaseAnimationProps } from './BaseAnimation.types'

const props = defineProps<BaseAnimationProps>()
const rawProps = getCurrentInstance()?.vnode.props

const emit = defineEmits<BaseAnimationEmits>()

const show = computed(() => (rawProps && 'show' in rawProps ? (props.show ?? true) : true))
const name = computed(() => props.name ?? 'fade')
const mode = computed(() => props.mode ?? 'out-in')
const isGroup = computed(() => props.isGroup ?? false)
const tag = computed(() => props.tag ?? 'div')

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root'],
})

function handleAfterEnter(): void {
	emit('after-enter')
}

function handleAfterLeave(): void {
	emit('after-leave')
}
</script>
