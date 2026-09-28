<template>
	<Transition v-if="!isGroup" :name="name" :mode="mode" appear @after-enter="handleAfterEnter" @after-leave="handleAfterLeave">
		<div v-if="show" class="base-animation" :class="classes.root">
			<slot />
		</div>
	</Transition>

	<!-- Список: дочерние элементы (с key) — прямые потомки тега tag, каждый анимируется отдельно -->
	<TransitionGroup
		v-else
		:name="name"
		:tag="tag"
		appear
		class="base-animation base-animation--group"
		:class="classes.root"
		@after-enter="handleAfterEnter"
		@after-leave="handleAfterLeave">
		<slot v-if="show" />
	</TransitionGroup>
</template>

<script setup lang="ts">
import { kitDefaults } from '@composables/useDefaults'
import { useCustomClass } from '@composables/useCustomClass'
import '../styles/BaseAnimation.style.scss'
import type { BaseAnimationEmits, BaseAnimationProps, BaseAnimationSlots } from '../types/BaseAnimation.types'

const props = withDefaults(
	defineProps<BaseAnimationProps>(),
	kitDefaults('BaseAnimation', {
		show: true,
		name: 'fade',
		mode: 'out-in',
		isGroup: false,
		tag: 'div',
	}),
)

const emit = defineEmits<BaseAnimationEmits>()
defineSlots<BaseAnimationSlots>()

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
