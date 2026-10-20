<template>
	<div class="base-roadmap__edit" @keydown="editor.onKeydown">
		<div class="base-roadmap__sr" role="status" aria-live="polite" aria-atomic="true">{{ edit.liveText.value }}</div>
		<RoadmapPalette />
		<div class="base-roadmap__edit-body">
			<section ref="areaRef" class="base-roadmap__edit-area" :aria-label="UI_ROADMAP_EDIT.AREA_LABEL">
				<p class="base-roadmap__edit-chip">
					<span class="base-roadmap__edit-dot" aria-hidden="true" />{{ UI_ROADMAP_EDIT.MODE_CHIP }}
					<span>{{ UI_ROADMAP_EDIT.MODE_CHIP_HINT }}</span>
				</p>
				<p v-if="editor.tool.value === 'link'" class="base-roadmap__edit-chip base-roadmap__edit-chip--link">
					{{ editor.linkFrom.value ? UI_ROADMAP_EDIT.LINK_TARGET : UI_ROADMAP_EDIT.LINK_SOURCE }}
				</p>
				<RoadmapRejectNotice
					v-if="edit.rejection.value"
					:rejection="edit.rejection.value"
					:can-undo="edit.history.state.value.canUndo"
					@dismiss="edit.dismissRejection" />
				<ol v-if="edit.viewData.value.stages.length" class="base-roadmap__edit-stages">
					<RoadmapEditStage v-for="(stage, index) in edit.viewData.value.stages" :key="stage.id" :stage="stage" :index="index" />
				</ol>
				<BaseEmpty v-else :title="UI_ROADMAP_EDIT.EMPTY" :description="UI_ROADMAP_EDIT.EMPTY_HINT" />
				<p class="base-roadmap__edit-hint">{{ UI_ROADMAP_EDIT.DRAG_HINT }}</p>
			</section>
			<aside class="base-roadmap__edit-side" :aria-label="UI_ROADMAP_EDIT.INSPECTOR_LABEL">
				<RoadmapInspector ref="inspectorRef" />
			</aside>
		</div>
		<div
			v-if="sort.topics.drag.value"
			ref="topicGhost"
			class="base-roadmap__edit-ghost"
			:style="sort.topics.ghostStyle.value"
			aria-hidden="true">
			{{ sort.topics.drag.value.item.title }}
		</div>
		<div
			v-if="sort.stages.drag.value"
			ref="stageGhost"
			class="base-roadmap__edit-ghost"
			:style="sort.stages.ghostStyle.value"
			aria-hidden="true">
			{{ sort.stages.drag.value.item.title }}
		</div>
		<footer class="base-roadmap__edit-status" :aria-label="UI_ROADMAP_EDIT.STATUS_LABEL">
			<span
				>{{ UI_ROADMAP_EDIT.FOOTER_STAGES }} <b>{{ editor.counts.value.stages }}</b></span
			>
			<span
				>{{ UI_ROADMAP_EDIT.FOOTER_TOPICS }} <b>{{ editor.counts.value.topics }}</b></span
			>
			<span
				>{{ UI_ROADMAP_EDIT.FOOTER_CHANGES }} <b>{{ editor.counts.value.changes }}</b></span
			>
			<span v-if="savedText()">{{ savedLabel }}</span>
			<span :class="{ 'base-roadmap__edit-status--warn': editor.counts.value.issues > 0 }">{{ checkLabel }}</span>
		</footer>
		<BaseConfirm
			:is-open="Boolean(editor.pending.value)"
			is-danger
			:title="confirmTitle"
			:description="confirmText"
			:confirm-label="confirmOk"
			:cancel-label="UI_ROADMAP_EDIT.CONFIRM_CANCEL"
			@close="editor.resolve" />
	</div>
</template>

<script setup lang="ts">
import '../../styles/_roadmap-edit.scss'
import RoadmapPalette from './RoadmapPalette.vue'
import { BaseEmpty } from '@components/BaseEmpty'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import RoadmapEditStage from './RoadmapEditStage.vue'
import RoadmapInspector from './RoadmapInspector.vue'
import { BaseConfirm } from '@components/BaseConfirm'
import RoadmapRejectNotice from '../parts/RoadmapRejectNotice.vue'
import { useRoadmapEditorView } from '../../model/edit/view/useRoadmapEditorView'
import type { RoadmapEditorEmits, RoadmapEditorProps } from '../../types/internal/roadmapEditView.types'

const props = defineProps<RoadmapEditorProps>()
const emit = defineEmits<RoadmapEditorEmits>()
const {
	areaRef,
	inspectorRef,
	editor,
	sort,
	topicGhost,
	stageGhost,
	savedText,
	savedLabel,
	checkLabel,
	confirmTitle,
	confirmText,
	confirmOk,
} = useRoadmapEditorView(props, emit)
</script>
