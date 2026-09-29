<template>
	<div
		class="base-tool-call"
		:class="[variantClass, classes.root, `base-tool-call--${status}`, { 'base-tool-call--open': isOpenLocal }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<button
			type="button"
			class="base-tool-call__trigger"
			:class="classes.trigger"
			:aria-expanded="isOpenLocal ? 'true' : 'false'"
			:aria-controls="contentId"
			@click="toggle">
			<span class="base-tool-call__status" aria-hidden="true">
				<span v-if="status === 'running'" class="base-tool-call__spinner"></span>
				<BaseIcon v-else :name="statusIcon" />
			</span>
			<span class="base-tool-call__heading">
				<span class="base-tool-call__title">{{ title || name }}</span>
				<code v-if="title" class="base-tool-call__name">{{ name }}</code>
			</span>
			<span class="base-tool-call__state">{{ statusText }}</span>
			<BaseIcon class="base-tool-call__arrow" name="chevron-down" />
		</button>
		<div
			:id="contentId"
			class="base-tool-call__collapse"
			:aria-hidden="isOpenLocal ? undefined : 'true'"
			:inert="isOpenLocal ? undefined : true">
			<div class="base-tool-call__content" :class="classes.content">
				<div v-if="argsText !== null" class="base-tool-call__section">
					<span class="base-tool-call__label">{{ UI_AI.TOOL_ARGS }}</span>
					<pre class="base-tool-call__code" tabindex="0">{{ argsText }}</pre>
				</div>
				<p v-if="error" class="base-tool-call__error">
					<BaseIcon name="alert-triangle" />
					{{ error }}
				</p>
				<div v-if="resultText !== null || $slots.output" class="base-tool-call__section">
					<span class="base-tool-call__label">{{ UI_AI.TOOL_RESULT }}</span>
					<slot name="output" :result="result">
						<pre class="base-tool-call__code" tabindex="0">{{ resultText }}</pre>
					</slot>
				</div>
				<slot />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseToolCall.style.scss'
import { UI_AI } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseToolCall } from '../model/useBaseToolCall'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseToolCallEmits, BaseToolCallProps, BaseToolCallSlots } from '../types/BaseToolCall.types'

const props = withDefaults(defineProps<BaseToolCallProps>(), {
	status: 'pending',
	isOpen: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseToolCallEmits>()

defineSlots<BaseToolCallSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isOpenLocal,
	toggle,
	contentId,
	statusIcon,
	statusText,
	argsText,
	resultText,
} = useBaseToolCall(props, emit)
</script>
