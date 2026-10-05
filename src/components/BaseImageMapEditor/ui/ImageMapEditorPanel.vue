<template>
	<aside class="base-image-map-editor__panel" :class="panelClass">
		<section v-if="currentLayer" class="base-image-map-editor__section">
			<h3 class="base-image-map-editor__heading">{{ UI_IMAGE_MAP_EDITOR.OBJECTS }}</h3>
			<ul v-if="objects.length" class="base-image-map-editor__list">
				<li v-for="object in objects" :key="object.id">
					<button
						type="button"
						class="base-image-map-editor__item"
						:class="{ 'base-image-map-editor__item--selected': object.id === selected?.id }"
						:aria-current="object.id === selected?.id ? 'true' : undefined"
						@click="$emit('select', object.id)">
						<span class="base-image-map-editor__item-title">{{ object.title }}</span>
						<span class="base-image-map-editor__item-type">{{ typeLabel(object.type) }}</span>
					</button>
				</li>
			</ul>
			<BaseText v-else tag="p" class="base-image-map-editor__hint">{{ UI_IMAGE_MAP_EDITOR.NO_OBJECTS }}</BaseText>
		</section>

		<section v-if="currentLayer" class="base-image-map-editor__section">
			<h3 class="base-image-map-editor__heading">{{ UI_IMAGE_MAP_EDITOR.PROPERTIES }}</h3>
			<BaseText v-if="!selected" tag="p" class="base-image-map-editor__hint">{{ UI_IMAGE_MAP_EDITOR.NOTHING_SELECTED }}</BaseText>
			<fieldset v-for="section in panel.sections.value" :key="section.id" class="base-image-map-editor__fieldset">
				<legend class="base-image-map-editor__legend">{{ section.title }}</legend>
				<ImageMapEditorField
					v-for="field in section.fields"
					:key="field.key"
					:field="field"
					:is-disabled="isDisabled"
					@update="panel.setField(field.key, $event)" />
			</fieldset>
		</section>

		<section class="base-image-map-editor__section">
			<h3 class="base-image-map-editor__heading">{{ UI_IMAGE_MAP_EDITOR.LAYERS }}</h3>
			<ul v-if="data.layers.length" class="base-image-map-editor__list">
				<li v-for="(layer, index) in data.layers" :key="layer.id" class="base-image-map-editor__row">
					<button
						:ref="trackRow('layer', layer.id)"
						type="button"
						class="base-image-map-editor__item"
						:class="{ 'base-image-map-editor__item--selected': layer.id === currentLayer?.id }"
						:aria-current="layer.id === currentLayer?.id ? 'true' : undefined"
						@click="$emit('set-layer', layer.id)">
						<span class="base-image-map-editor__item-title">{{ layer.title }}</span>
					</button>
					<BaseButton
						:ref="trackRow('up', layer.id)"
						variant="ghost"
						:aria-label="formatMessage(UI_IMAGE_MAP_EDITOR.MOVE_UP, { title: layer.title })"
						:is-disabled="isDisabled || index === 0"
						:is-focusable-when-disabled="!isDisabled"
						@click="moveLayer(layer.id, -1)">
						<template #left><BaseIcon name="chevron-up" /></template>
					</BaseButton>
					<BaseButton
						:ref="trackRow('down', layer.id)"
						variant="ghost"
						:aria-label="formatMessage(UI_IMAGE_MAP_EDITOR.MOVE_DOWN, { title: layer.title })"
						:is-disabled="isDisabled || index === data.layers.length - 1"
						:is-focusable-when-disabled="!isDisabled"
						@click="moveLayer(layer.id, 1)">
						<template #left><BaseIcon name="chevron-down" /></template>
					</BaseButton>
					<BaseButton
						variant="ghost"
						:aria-label="formatMessage(UI_IMAGE_MAP_EDITOR.DELETE_LAYER, { title: layer.title })"
						:is-disabled="isDisabled"
						@click="removeLayer(layer.id)">
						<template #left><BaseIcon name="trash" /></template>
					</BaseButton>
				</li>
			</ul>
			<div v-if="currentLayer" class="base-image-map-editor__fields">
				<ImageMapEditorField
					v-for="field in panel.layerFields.value"
					:key="field.key"
					:field="field"
					:is-disabled="isDisabled"
					@update="panel.setLayerField(field.key, $event)" />
			</div>
			<BaseButton ref="addLayerRef" variant="outline" :is-disabled="isDisabled" @click="$emit('add-layer')">
				<template #left><BaseIcon name="plus" /></template>
				{{ UI_IMAGE_MAP_EDITOR.ADD_LAYER }}
			</BaseButton>
		</section>

		<ImageMapEditorPanel3d
			v-if="panel.scene3dFields.value.length"
			:panel="panel"
			:layer-title="currentLayer?.title"
			:is-disabled="isDisabled" />

		<section class="base-image-map-editor__section">
			<h3 class="base-image-map-editor__heading">{{ UI_IMAGE_MAP_EDITOR.GROUPS }}</h3>
			<fieldset v-for="group in panel.groups.value" :key="group.id" class="base-image-map-editor__fieldset">
				<legend class="base-image-map-editor__legend">{{ group.title }}</legend>
				<ImageMapEditorField
					v-for="field in group.fields"
					:key="field.key"
					:field="field"
					:is-disabled="isDisabled"
					@update="panel.setGroupField(group.id, field.key, $event)" />
				<BaseButton :ref="trackRow('group', group.id)" variant="ghost" :is-disabled="isDisabled" @click="removeGroup(group.id)">
					<template #left><BaseIcon name="trash" /></template>
					{{ formatMessage(UI_IMAGE_MAP_EDITOR.DELETE_GROUP, { title: group.title }) }}
				</BaseButton>
			</fieldset>
			<BaseButton ref="addGroupRef" variant="outline" :is-disabled="isDisabled" @click="panel.addGroup">
				<template #left><BaseIcon name="plus" /></template>
				{{ UI_IMAGE_MAP_EDITOR.ADD_GROUP }}
			</BaseButton>
		</section>
	</aside>
</template>

<script setup lang="ts">
import { formatMessage } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import { typeLabel } from '../model/canvas/useEditorTool'
import ImageMapEditorField from './ImageMapEditorField.vue'
import ImageMapEditorPanel3d from './ImageMapEditorPanel3d.vue'
import { useImageMapEditorPanel } from '../model/panel/useImageMapEditorPanel'
import type { ImageMapEditorPanelEmits, ImageMapEditorPanelProps } from '../types/ImageMapEditorPanel.types'

const props = defineProps<ImageMapEditorPanelProps>()

defineEmits<ImageMapEditorPanelEmits>()

const { addLayerRef, addGroupRef, trackRow, moveLayer, removeLayer, removeGroup } = useImageMapEditorPanel(props)
</script>
