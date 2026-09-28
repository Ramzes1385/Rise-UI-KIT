<template>
	<div class="base-input-tags" :class="[{ 'base-input-tags--has-tags': modelValue.length > 0 }, classes.root]">
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
				<ul
					class="base-input-tags__list"
					:class="classes.list"
					:aria-label="UI_ARIA.TAGS"
					:aria-disabled="isControlDisabled ? 'true' : undefined">
					<li v-for="(tag, index) in modelValue" :key="`${tag}-${index}`" class="base-input-tags__tag" :class="classes.tag">
						<span class="base-input-tags__text">{{ tag }}</span>
						<button
							v-if="canEdit"
							:ref="element => setRemoveButton(element, index)"
							type="button"
							class="base-input-tags__remove"
							:class="classes.remove"
							tabindex="-1"
							:aria-label="formatMessage(UI_ARIA.TAG_REMOVE, { name: tag })"
							@mousedown.prevent
							@click="removeAt(index, true)"
							@keydown="handleTagKeydown($event, index)">
							<BaseIcon name="x-mark" :size-scale="calcIconScale('xs', sizeScale)" />
						</button>
					</li>
				</ul>
			</template>
		</BaseInput>
		<span class="base-input-tags__status" role="status">{{ announcement }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseInputTags.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { BaseInput } from '@components/BaseInput'
import { kitDefaults } from '@composables/useDefaults'
import { useBaseInputTags } from '../model/useBaseInputTags'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
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
