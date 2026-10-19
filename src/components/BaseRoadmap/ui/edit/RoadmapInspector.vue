<template>
	<div ref="rootRef" class="base-roadmap__inspector" :class="ui('inspector')">
		<p v-if="!inspector.targetId.value" class="base-roadmap__inspector-empty">{{ UI_ROADMAP_EDIT.INSPECTOR_EMPTY }}</p>
		<template v-else>
			<RoadmapItemToolbar />
			<BaseTabs
				v-if="inspector.topic.value"
				:items="tabs"
				:model-value="inspector.tab.value"
				@update:model-value="inspector.setTab($event as 'topic' | 'materials')">
				<template #panel-topic>
					<div class="base-roadmap__inspector-pane">
						<div class="base-roadmap__inspector-head">
							<span class="base-roadmap__inspector-eyebrow">{{ eyebrow }}</span>
							<BaseBadge>{{ badge }}</BaseBadge>
						</div>
						<div data-roadmap-title>
							<BaseInput
								:model-value="inspector.topic.value.title"
								:label="UI_ROADMAP_EDIT.F_TITLE"
								:is-disabled="isDisabled()"
								@update:model-value="inspector.setTitle(String($event))" />
						</div>
						<BaseSelect
							:model-value="inspector.owner.value?.id"
							:options="stageOptions"
							:label="UI_ROADMAP_EDIT.F_STAGE"
							:is-disabled="isDisabled()"
							@update:model-value="onStage" />
						<div class="base-roadmap__inspector-row">
							<BaseSwitch
								:model-value="inspector.topic.value.kind === 'optional'"
								:label="UI_ROADMAP_EDIT.F_OPTIONAL"
								:is-disabled="isDisabled()"
								@update:model-value="inspector.setOptional" />
							<BaseSwitch
								:model-value="isAlternative"
								:label="UI_ROADMAP_EDIT.F_ALTERNATIVE"
								:is-disabled="isDisabled() || !inspector.canBeAlternative.value"
								@update:model-value="inspector.setAlternative" />
						</div>
						<BaseInputNumber
							:model-value="inspector.topic.value.hours ?? null"
							:label="UI_ROADMAP_EDIT.F_HOURS"
							:min="0"
							:step="0.5"
							:precision="1"
							:is-disabled="isDisabled()"
							@update:model-value="onHours" />
						<BaseSelect
							:model-value="requires"
							:options="inspector.requireOptions.value"
							:label="UI_ROADMAP_EDIT.F_REQUIRES"
							:placeholder="UI_ROADMAP_EDIT.F_REQUIRES_PLACEHOLDER"
							is-multiple
							is-searchable
							:is-disabled="isDisabled()"
							@update:model-value="onRequires" />
						<BaseTextarea
							:model-value="inspector.topic.value.description ?? ''"
							:label="UI_ROADMAP_EDIT.F_DESCRIPTION"
							:placeholder="UI_ROADMAP_EDIT.F_DESCRIPTION_HINT"
							:rows="3"
							:is-disabled="isDisabled()"
							@update:model-value="inspector.setDescription" />
						<fieldset class="base-roadmap__inspector-group">
							<legend class="base-roadmap__inspector-legend">{{ UI_ROADMAP_EDIT.F_SUBTOPICS }}</legend>
							<p v-if="!inspector.topic.value.subtopics?.length" class="base-roadmap__inspector-empty">
								{{ UI_ROADMAP_EDIT.SUBTOPICS_EMPTY }}
							</p>
							<ul class="base-roadmap__inspector-list">
								<li v-for="item in inspector.topic.value.subtopics" :key="item.id" class="base-roadmap__inspector-item">
									<BaseInput
										:model-value="item.title"
										:aria-label="UI_ROADMAP_EDIT.SUBTOPIC_LABEL"
										:is-disabled="isDisabled()"
										@update:model-value="inspector.renameSubtopic(item.id, String($event))" />
									<BaseButton
										variant="ghost"
										:aria-label="removeSubtopicLabel(item.title)"
										:is-disabled="isDisabled()"
										@click="inspector.removeSubtopic(item.id)">
										<BaseIcon name="x-mark" />
									</BaseButton>
								</li>
							</ul>
							<BaseButton variant="outline" :is-disabled="isDisabled()" @click="inspector.addSubtopic">
								<template #left><BaseIcon name="plus" /></template>
								{{ UI_ROADMAP_EDIT.ADD_SUBTOPIC }}
							</BaseButton>
						</fieldset>
					</div>
				</template>
				<template #panel-materials>
					<RoadmapInspectorMaterials />
				</template>
			</BaseTabs>
			<div v-else-if="inspector.stage.value" class="base-roadmap__inspector-pane">
				<div class="base-roadmap__inspector-head">
					<span class="base-roadmap__inspector-eyebrow">{{ eyebrow }}</span>
					<BaseBadge>{{ badge }}</BaseBadge>
				</div>
				<div data-roadmap-title>
					<BaseInput
						:model-value="inspector.stage.value.title"
						:label="UI_ROADMAP_EDIT.F_TITLE"
						:is-disabled="isDisabled()"
						@update:model-value="inspector.setTitle(String($event))" />
				</div>
				<BaseSwitch
					:model-value="inspector.stage.value.kind === 'optional'"
					:label="UI_ROADMAP_EDIT.F_OPTIONAL"
					:is-disabled="isDisabled()"
					@update:model-value="inspector.setOptional" />
				<BaseSelect
					:model-value="requires"
					:options="inspector.requireOptions.value"
					:label="UI_ROADMAP_EDIT.F_REQUIRES"
					:placeholder="UI_ROADMAP_EDIT.F_REQUIRES_PLACEHOLDER"
					is-multiple
					is-searchable
					:is-disabled="isDisabled()"
					@update:model-value="onRequires" />
				<BaseTextarea
					:model-value="inspector.stage.value.description ?? ''"
					:label="UI_ROADMAP_EDIT.F_DESCRIPTION"
					:rows="3"
					:is-disabled="isDisabled()"
					@update:model-value="inspector.setDescription" />
			</div>
			<div class="base-roadmap__inspector-foot">
				<BaseButton variant="outline" :is-disabled="isDisabled()" @click="remove">
					<template #left><BaseIcon name="trash" /></template>
					{{ inspector.topic.value ? UI_ROADMAP_EDIT.REMOVE_TOPIC : UI_ROADMAP_EDIT.REMOVE_STAGE }}
				</BaseButton>
				<BaseButton @click="done">{{ UI_ROADMAP_EDIT.DONE }}</BaseButton>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseTabs } from '@components/BaseTabs'
import { BaseBadge } from '@components/BaseBadge'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { BaseSwitch } from '@components/BaseSwitch'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { BaseTextarea } from '@components/BaseTextarea'
import RoadmapItemToolbar from './RoadmapItemToolbar.vue'
import { BaseInputNumber } from '@components/BaseInputNumber'
import RoadmapInspectorMaterials from './RoadmapInspectorMaterials.vue'
import { useRoadmapEditorContext } from '../../model/edit/view/roadmapEditorContext'
import { useRoadmapInspectorPanel } from '../../model/edit/sortable/useRoadmapInspectorPanel'

const { ui } = useRoadmapEditorContext()
const {
	rootRef,
	inspector,
	isDisabled,
	focusTitle,
	eyebrow,
	badge,
	isAlternative,
	stageOptions,
	tabs,
	requires,
	onRequires,
	onStage,
	onHours,
	done,
	remove,
	removeSubtopicLabel,
} = useRoadmapInspectorPanel()
defineExpose({ focusTitle })
</script>
