<template>
	<Transition v-if="!isGroup" :name="name" :mode="mode" appear @after-enter="handleAfterEnter" @after-leave="handleAfterLeave">
		<div v-if="show" class="base-animation" :class="classes.root">
			<slot />
		</div>
	</Transition>

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
import '../styles/BaseAnimation.style.scss'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseAnimation } from '../model/useBaseAnimation'
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

const { classes, handleAfterEnter, handleAfterLeave } = useBaseAnimation(props, emit)
</script>
