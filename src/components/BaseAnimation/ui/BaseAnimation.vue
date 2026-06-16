<template>
	<!-- Одиночная анимация -->
	<Transition
		v-if="!props.isGroup"
		:name="props.name"
		:mode="props.mode"
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
		:name="props.name"
		:tag="props.tag"
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
import { computed } from 'vue'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import '../styles/BaseAnimation.style.scss'
import type { BaseAnimationEmits, BaseAnimationProps } from '../model/BaseAnimation.types'

const props = withDefaults(defineProps<BaseAnimationProps>(), {
	name: 'fade',
	mode: 'out-in',
	isGroup: false,
	tag: 'div',
})
const { wasPropPassed } = useExplicitPropDetection()

const emit = defineEmits<BaseAnimationEmits>()

const show = computed(() => (wasPropPassed('show') ? (props.show ?? true) : true))

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
