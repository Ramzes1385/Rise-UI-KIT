<template>
	<div class="base-roadmap__inspector-pane">
		<span class="base-roadmap__inspector-eyebrow">{{ heading }}</span>
		<p v-if="!materials.length" class="base-roadmap__inspector-empty">{{ UI_ROADMAP_EDIT.MATERIALS_EMPTY }}</p>
		<p v-if="!materials.length" class="base-roadmap__inspector-warn" role="status">
			<BaseIcon name="alert-triangle" />{{ UI_ROADMAP_EDIT.MATERIALS_WARN }}
		</p>
		<ul class="base-roadmap__inspector-list">
			<li v-for="(item, position) in materials" :key="position" class="base-roadmap__inspector-material">
				<BaseSelect
					:model-value="item.kind"
					:options="kindOptions"
					:aria-label="UI_ROADMAP_EDIT.MATERIAL_KIND"
					:is-disabled="isDisabled()"
					@update:model-value="inspector.updateMaterial(position, { kind: $event as RoadmapMaterialKind })" />
				<BaseInput
					:model-value="item.title"
					:aria-label="UI_ROADMAP_EDIT.MATERIAL_TITLE"
					:is-disabled="isDisabled()"
					@update:model-value="inspector.updateMaterial(position, { title: String($event) })" />
				<BaseInput
					:model-value="item.url ?? ''"
					:aria-label="UI_ROADMAP_EDIT.MATERIAL_URL"
					:is-disabled="isDisabled()"
					@update:model-value="inspector.updateMaterial(position, { url: String($event) })" />
				<BaseButton
					variant="ghost"
					:aria-label="removeLabel(item.title)"
					:is-disabled="isDisabled()"
					@click="inspector.removeMaterial(position)">
					<BaseIcon name="x-mark" />
				</BaseButton>
			</li>
		</ul>
		<div class="base-roadmap__inspector-row">
			<BaseSelect v-model="newKind" :options="kindOptions" :label="UI_ROADMAP_EDIT.MATERIAL_NEW_KIND" :is-disabled="isDisabled()" />
			<BaseButton variant="outline" :is-disabled="isDisabled()" @click="inspector.addMaterial(newKind)">
				<template #left><BaseIcon name="plus" /></template>
				{{ UI_ROADMAP_EDIT.ADD_MATERIAL }}
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import type { RoadmapMaterialKind } from '../../types/roadmapData.types'
import { useRoadmapInspectorPanel } from '../../model/edit/sortable/useRoadmapInspectorPanel'

const {
	inspector,
	isDisabled,
	kindOptions,
	newKind,
	materials,
	materialsHeading: heading,
	removeMaterialLabel: removeLabel,
} = useRoadmapInspectorPanel()
</script>
