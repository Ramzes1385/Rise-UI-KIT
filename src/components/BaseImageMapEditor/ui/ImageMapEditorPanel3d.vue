<template>
	<section class="base-image-map-editor__section">
		<h3 class="base-image-map-editor__heading">{{ UI_IMAGE_MAP_EDITOR.SECTION_3D }}</h3>
		<fieldset v-if="panel.layer3dFields.value.length" class="base-image-map-editor__fieldset">
			<legend class="base-image-map-editor__legend">
				{{ formatMessage(UI_IMAGE_MAP_EDITOR.LAYER_3D, { title: layerTitle ?? '' }) }}
			</legend>
			<ImageMapEditorField
				v-for="field in panel.layer3dFields.value"
				:key="field.key"
				:field="field"
				:is-disabled="isDisabled"
				@update="panel.setLayer3dField(field.key, $event)" />
		</fieldset>
		<fieldset class="base-image-map-editor__fieldset">
			<legend class="base-image-map-editor__legend">{{ UI_IMAGE_MAP_EDITOR.SCENE_3D }}</legend>
			<ImageMapEditorField
				v-for="field in panel.scene3dFields.value"
				:key="field.key"
				:field="field"
				:is-disabled="isDisabled"
				@update="panel.setScene3dField(field.key, $event)" />
		</fieldset>
	</section>
</template>

<script setup lang="ts">
import { formatMessage } from '@/locales/state'
import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import ImageMapEditorField from './ImageMapEditorField.vue'
import type { ImageMapEditorPanel3dProps } from '../types/ImageMapEditorPanel.types'

defineProps<ImageMapEditorPanel3dProps>()
</script>
