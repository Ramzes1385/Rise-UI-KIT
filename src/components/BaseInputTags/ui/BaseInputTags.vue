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
							<span :class="ui('text')">{{ tag }}</span>
							<button
								v-if="canEdit"
								:ref="element => setRemoveButton(element, index)"
								type="button"
								:class="[ui('remove'), classes.remove]"
								tabindex="-1"
								:aria-label="formatMessage(UI_ARIA.TAG_REMOVE, { name: tag })"
								@mousedown.prevent
								@click="removeAt(index, true)"
								@keydown="handleTagKeydown($event, index)">
								<BaseIcon name="x-mark" :size-scale="calcIconScale('xs', sizeScale)" />
							</button>
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
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { calcIconScale } from '@utils/media/iconUtils'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseInputTags } from '../model/useBaseInputTags'
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
		separators: () => [','],
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
