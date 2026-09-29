<template>
	<div
		class="base-reasoning"
		:class="[variantClass, classes.root, { 'base-reasoning--open': isOpenLocal, 'base-reasoning--streaming': isStreaming }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<button
			type="button"
			class="base-reasoning__trigger"
			:class="classes.trigger"
			:aria-expanded="isOpenLocal ? 'true' : 'false'"
			:aria-controls="contentId"
			@click="toggle">
			<span class="base-reasoning__title">
				<slot name="title" :title="title" :seconds="seconds" :is-streaming="isStreaming">{{ title }}</slot>
			</span>
			<BaseIcon class="base-reasoning__arrow" name="chevron-down" />
		</button>
		<div
			:id="contentId"
			class="base-reasoning__collapse"
			:aria-hidden="isOpenLocal ? undefined : 'true'"
			:inert="isOpenLocal ? undefined : true"
			:aria-busy="isStreaming ? 'true' : undefined">
			<div class="base-reasoning__content" :class="classes.content">
				<slot>
					<BaseMarkdown v-if="content" :source="content" :is-streaming="isStreaming" variant="ghost" />
				</slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseReasoning.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseMarkdown } from '@components/BaseMarkdown'
import { useBaseReasoning } from '../model/useBaseReasoning'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseReasoningEmits, BaseReasoningProps, BaseReasoningSlots } from '../types/BaseReasoning.types'

const props = withDefaults(defineProps<BaseReasoningProps>(), {
	content: '',
	isStreaming: false,
	isOpen: false,
	hasAutoToggle: true,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseReasoningEmits>()

defineSlots<BaseReasoningSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, isOpenLocal, toggle, contentId, seconds, title } =
	useBaseReasoning(props, emit)
</script>
