<template>
	<div class="base-image-map-editor__rows">
		<BaseText v-if="!rows.length" tag="p" class="base-image-map-editor__hint">{{ emptyText }}</BaseText>
		<fieldset v-for="(row, index) in rows" :key="index" class="base-image-map-editor__fieldset">
			<legend class="base-image-map-editor__legend">{{ row.title }}</legend>
			<ImageMapEditorField
				v-for="field in row.fields"
				:key="field.key"
				:field="field"
				:is-disabled="isDisabled"
				@update="emit('update', index, field.key, $event)" />
			<BaseText v-if="row.hint" tag="p" class="base-image-map-editor__hint">{{ row.hint }}</BaseText>
			<div v-if="row.children" role="group" class="base-image-map-editor__subrows" :aria-label="row.childrenTitle">
				<fieldset v-for="(child, childIndex) in row.children" :key="childIndex" class="base-image-map-editor__fieldset">
					<legend class="base-image-map-editor__legend">{{ child.title }}</legend>
					<ImageMapEditorField
						v-for="field in child.fields"
						:key="field.key"
						:field="field"
						:is-disabled="isDisabled"
						@update="emit('update-child', { index, child: childIndex }, field.key, $event)" />
					<BaseButton
						:ref="trackRemoveChild(index, childIndex)"
						variant="ghost"
						:is-disabled="isDisabled"
						@click="removeChild(index, childIndex)">
						<template #left><BaseIcon name="trash" /></template>
						{{ child.deleteLabel }}
					</BaseButton>
				</fieldset>
				<BaseButton :ref="trackAddChild(index)" variant="outline" :is-disabled="isDisabled" @click="emit('add-child', index)">
					<template #left><BaseIcon name="plus" /></template>
					{{ row.addChildLabel }}
				</BaseButton>
			</div>
			<BaseButton :ref="trackRemove(index)" variant="ghost" :is-disabled="isDisabled" @click="remove(index)">
				<template #left><BaseIcon name="trash" /></template>
				{{ row.deleteLabel }}
			</BaseButton>
		</fieldset>
		<BaseButton ref="addRef" variant="outline" :is-disabled="isDisabled" @click="emit('add')">
			<template #left><BaseIcon name="plus" /></template>
			{{ addLabel }}
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import ImageMapEditorField from './ImageMapEditorField.vue'
import { useImageMapEditorRows } from '../model/panel/useImageMapEditorRows'
import type { ImageMapEditorRowsEmits, ImageMapEditorRowsProps } from '../types/ImageMapEditorRows.types'

const props = defineProps<ImageMapEditorRowsProps>()

const emit = defineEmits<ImageMapEditorRowsEmits>()

const { addRef, trackRemove, trackAddChild, trackRemoveChild, remove, removeChild } = useImageMapEditorRows(props, emit)
</script>
