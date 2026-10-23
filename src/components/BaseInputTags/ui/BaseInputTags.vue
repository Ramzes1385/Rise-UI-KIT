<template>
	<div ref="rootRef" :class="[ui('root'), { 'base-input-tags--has-tags': modelValue.length > 0 }, classes.root]">
		<BaseInput
			ref="inputRef"
			:model-value="draft"
			:variant="variant"
			:label="label"
			:placeholder="placeholder"
			:error="error"
			:is-disabled="isControlDisabled"
			:is-readonly="isReadonly"
			:is-required="isRequired"
			:aria-label="ariaLabel"
			:input-attrs="{ autocomplete: 'off', ...inputAttrs }"
			:size-scale="sizeScale"
			:color="color"
			:custom-class="{ field: classes.field }"
			@update:model-value="handleInput"
			@keydown="handleKeydown"
			@blur="handleBlur"
			@focus="emit('focus', $event)"
			@paste="handlePaste">
			<template v-if="modelValue.length > 0" #prefix>
				<ul :class="[ui('list'), classes.list]" :aria-label="UI_ARIA.TAGS" :aria-disabled="isControlDisabled ? 'true' : undefined">
					<TransitionGroup name="base-input-tags-tag" :css="!isMotionReduced" @before-leave="holdLeavingTag">
						<li v-for="(tag, index) in modelValue" :key="tagKeys[index]" :class="[ui('tag'), classes.tag]">
							<BaseBadge
								variant="outline"
								:label="tag"
								:ui="{ text: ui('text'), remove: ui('remove') }"
								:custom-class="{ remove: classes.remove }"
								:is-removable="canEdit"
								:is-remove-focusable="false"
								:remove-label="formatMessage(UI_ARIA.TAG_REMOVE, { name: tag })"
								:size-scale="sizeScale"
								:ref="element => setRemoveButton(element, index)"
								@remove="removeAt(index, true)"
								@keydown="handleTagKeydown($event, index)" />
						</li>
					</TransitionGroup>
				</ul>
			</template>
		</BaseInput>
		<span :class="ui('status')" role="status">{{ announcement }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseInputTags.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { BaseBadge } from '@components/BaseBadge'
import { BaseInput } from '@components/BaseInput'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseInputTags } from '../model/useBaseInputTags'
import { INPUT_TAGS_SEPARATORS } from '../types/BaseInputTags.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseInputTagsEmits, BaseInputTagsProps } from '../types/BaseInputTags.types'

const props = withDefaults(
	defineProps<BaseInputTagsProps>(),
	kitDefaults('BaseInputTags', {
		variant: DEFAULT_VARIANT,
		modelValue: () => [],
		isDisabled: false,
		isReadonly: false,
		isRequired: false,
		isUnique: true,
		separators: () => [...INPUT_TAGS_SEPARATORS],
		isAddOnBlur: true,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseInputTagsEmits>()

const {
	classes,
	ui,
	rootRef,
	isMotionReduced,
	tagKeys,
	holdLeavingTag,
	inputRef,
	draft,
	announcement,
	isControlDisabled,
	canEdit,
	setRemoveButton,
	removeAt,
	handleInput,
	handlePaste,
	handleKeydown,
	handleTagKeydown,
	handleBlur,
	exposed,
} = useBaseInputTags(props, emit)

defineExpose(exposed)
</script>
