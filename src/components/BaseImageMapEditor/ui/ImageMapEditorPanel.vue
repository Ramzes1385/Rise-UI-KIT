<template>
	<aside :class="[ui('panel'), panelClass]">
		<ImageMapEditorSection v-if="currentLayer" id="objects" :title="UI_IMAGE_MAP_EDITOR.OBJECTS" :sections="sections" :ui="ui">
			<ul v-if="objects.length" :class="ui('list')">
				<li v-for="object in objects" :key="object.id">
					<button
						type="button"
						:class="[ui('item'), { 'base-image-map-editor__item--selected': object.id === selected?.id }]"
						:aria-current="object.id === selected?.id ? 'true' : undefined"
						@click="$emit('select', object.id)">
						<span class="base-image-map-editor__item-title">{{ object.title }}</span>
						<span class="base-image-map-editor__item-type">{{ typeLabel(object.type) }}</span>
					</button>
				</li>
			</ul>
			<BaseText v-else tag="p" class="base-image-map-editor__hint">{{ UI_IMAGE_MAP_EDITOR.NO_OBJECTS }}</BaseText>
		</ImageMapEditorSection>

		<ImageMapEditorSection v-if="currentLayer" id="properties" :title="UI_IMAGE_MAP_EDITOR.PROPERTIES" :sections="sections" :ui="ui">
			<BaseText v-if="!selected" tag="p" class="base-image-map-editor__hint">{{ UI_IMAGE_MAP_EDITOR.NOTHING_SELECTED }}</BaseText>
			<fieldset v-for="section in panel.sections.value" :key="section.id" :class="ui('fieldset')">
				<legend :class="ui('legend')">{{ section.title }}</legend>
				<ImageMapEditorField
					v-for="field in section.fields"
					:key="field.key"
					:field="field"
					:is-disabled="isDisabled"
					@update="panel.setField(field.key, $event)" />
			</fieldset>
		</ImageMapEditorSection>

		<ImageMapEditorSection id="layers" :title="UI_IMAGE_MAP_EDITOR.LAYERS" :sections="sections" :ui="ui">
			<ul v-if="data.layers.length" :class="ui('list')">
				<li v-for="(layer, index) in data.layers" :key="layer.id" class="base-image-map-editor__row">
					<button
						:ref="trackRow('layer', layer.id)"
						type="button"
						:class="[ui('item'), { 'base-image-map-editor__item--selected': layer.id === currentLayer?.id }]"
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
		</ImageMapEditorSection>

		<ImageMapEditorPanel3d
			v-if="panel.scene3dFields.value.length"
			:panel="panel"
			:layer-title="currentLayer?.title"
			:selected="selected"
			:is-disabled="isDisabled"
			:sections="sections"
			:ui="ui" />

		<ImageMapEditorSection id="filters" :title="UI_IMAGE_MAP_EDITOR.FILTERS" :sections="sections" :ui="ui">
			<ImageMapEditorRows
				:rows="panel.filterRows.value"
				:add-label="UI_IMAGE_MAP_EDITOR.ADD_FILTER"
				:empty-text="UI_IMAGE_MAP_EDITOR.NO_FILTERS"
				:is-disabled="isDisabled"
				@update="panel.setFilterField"
				@add="panel.addFilter"
				@remove="panel.removeFilter"
				@update-child="panel.setFilterOption"
				@add-child="panel.addFilterOption"
				@remove-child="panel.removeFilterOption" />
		</ImageMapEditorSection>

		<ImageMapEditorSection id="styles" :title="UI_IMAGE_MAP_EDITOR.STYLES" :sections="sections" :ui="ui">
			<ImageMapEditorRows
				:rows="panel.styleRows.value"
				:add-label="UI_IMAGE_MAP_EDITOR.ADD_STYLE"
				:empty-text="UI_IMAGE_MAP_EDITOR.NO_STYLES"
				:is-disabled="isDisabled"
				@update="panel.setStyleField"
				@add="panel.addStyle"
				@remove="panel.removeStyle" />
		</ImageMapEditorSection>

		<ImageMapEditorSection id="groups" :title="UI_IMAGE_MAP_EDITOR.GROUPS" :sections="sections" :ui="ui">
			<fieldset v-for="group in panel.groups.value" :key="group.id" :class="ui('fieldset')">
				<legend :class="ui('legend')">{{ group.title }}</legend>
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
		</ImageMapEditorSection>
	</aside>
</template>

<script setup lang="ts">
import { formatMessage } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import { typeLabel } from '../model/canvas/useEditorTool'
import ImageMapEditorRows from './ImageMapEditorRows.vue'
import ImageMapEditorField from './ImageMapEditorField.vue'
import ImageMapEditorPanel3d from './ImageMapEditorPanel3d.vue'
import ImageMapEditorSection from './ImageMapEditorSection.vue'
import { useImageMapEditorPanel } from '../model/panel/useImageMapEditorPanel'
import type { ImageMapEditorPanelEmits, ImageMapEditorPanelProps } from '../types/ImageMapEditorPanel.types'

const props = defineProps<ImageMapEditorPanelProps>()

defineEmits<ImageMapEditorPanelEmits>()

const { addLayerRef, addGroupRef, trackRow, moveLayer, removeLayer, removeGroup } = useImageMapEditorPanel(props)
</script>
