<template>
	<div
		:class="[ui('root'), variantClass, classes.root, `base-tool-call--${status}`, { 'base-tool-call--open': isOpenLocal }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<button
			type="button"
			:class="[ui('trigger'), classes.trigger]"
			:aria-expanded="isOpenLocal ? 'true' : 'false'"
			:aria-controls="contentId"
			@click="toggle">
			<span :class="ui('status')" aria-hidden="true">
				<BaseLoader
					v-if="status === 'running'"
					class="base-tool-call__spinner"
					variant="spinner"
					:size-scale="(sizeScale * 44) / 100" />
				<BaseIcon v-else :name="statusIcon" />
			</span>
			<span class="base-tool-call__heading">
				<span :class="ui('title')">{{ title || name }}</span>
				<code v-if="title" :class="ui('name')">{{ name }}</code>
			</span>
			<span :class="ui('state')">{{ statusText }}</span>
			<BaseIcon :class="ui('arrow')" name="chevron-down" />
		</button>
		<div
			:id="contentId"
			:class="ui('collapse')"
			:aria-hidden="isOpenLocal ? undefined : 'true'"
			:inert="isOpenLocal ? undefined : true">
			<div class="base-tool-call__collapse-body">
				<div :class="[ui('content'), classes.content]">
					<div v-if="argsText !== null" class="base-tool-call__section">
						<span class="base-tool-call__label">{{ UI_AI.TOOL_ARGS }}</span>
						<pre :class="ui('code')" tabindex="0">{{ argsText }}</pre>
					</div>
					<p v-if="error" :class="ui('error')">
						<BaseIcon name="alert-triangle" />
						{{ error }}
					</p>
					<div v-if="resultText !== null || $slots.output" class="base-tool-call__section">
						<span class="base-tool-call__label">{{ UI_AI.TOOL_RESULT }}</span>
						<slot name="output" :result="result">
							<pre :class="ui('code')" tabindex="0">{{ resultText }}</pre>
						</slot>
					</div>
					<slot />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseToolCall.style.scss'
import { UI_AI } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLoader } from '@components/BaseLoader'
import { useBaseToolCall } from '../model/useBaseToolCall'
import { kitDefaults } from '@composables/base/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseToolCallEmits, BaseToolCallProps, BaseToolCallSlots } from '../types/BaseToolCall.types'

const props = withDefaults(
	defineProps<BaseToolCallProps>(),
	kitDefaults('BaseToolCall', {
		status: 'pending',
		isOpen: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseToolCallEmits>()

defineSlots<BaseToolCallSlots>()

const {
	ui,
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
