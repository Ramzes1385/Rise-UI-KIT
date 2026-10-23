<template>
	<Transition v-if="!isGroup" :name="transitionName" :mode="mode" appear @after-enter="handleAfterEnter" @after-leave="handleAfterLeave">
		<div v-if="show" :class="[ui('root'), classes.root, { 'base-animation--collapse': isCollapse }]">
			<div v-if="isCollapse" :class="ui('inner')">
				<slot />
			</div>
			<slot v-else />
		</div>
	</Transition>

	<TransitionGroup
		v-else
		:name="transitionName"
		:tag="tag"
		appear
		:class="[ui('root'), 'base-animation--group', classes.root]"
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

const { ui, classes, isCollapse, transitionName, handleAfterEnter, handleAfterLeave } = useBaseAnimation(props, emit)
</script>
