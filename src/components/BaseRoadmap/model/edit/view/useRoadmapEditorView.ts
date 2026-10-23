import { computed, ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { useRoadmapEditor } from '../editor/useRoadmapEditor'
import { provideRoadmapEditor } from './roadmapEditorContext'
import { useRoadmapSortable } from '../sortable/useRoadmapSortable'
import type { RoadmapEditorEmits, RoadmapEditorProps, RoadmapInspectorExpose } from '../../../types/internal/roadmapEditView.types'

export function useRoadmapEditorView(props: RoadmapEditorProps, emit: RoadmapEditorEmits) {
	const areaRef = ref<HTMLElement | null>(null)
	const inspectorRef = ref<RoadmapInspectorExpose | null>(null)
	const isDisabled = (): boolean => Boolean(props.isDisabled)
	const editor = useRoadmapEditor(props.edit, () => inspectorRef.value?.focusTitle())
	const sort = useRoadmapSortable({ rootRef: areaRef, edit: props.edit, isDisabled })
	const publish = (): void => emit('publish')
	provideRoadmapEditor({ edit: props.edit, editor, sort, ui: props.ui, isDisabled, publish })
	const pending = computed(() => editor.pending.value)
	const isTemplate = computed(() => pending.value?.kind === 'template')
	return {
		topicGhost: sort.topics.ghostRef,
		stageGhost: sort.stages.ghostRef,
		savedLabel: computed(() => formatMessage(UI_ROADMAP_EDIT.FOOTER_SAVED, { time: editor.savedText(props.draftSavedAt) })),
		checkLabel: computed(() => formatMessage(UI_ROADMAP_EDIT.FOOTER_CHECK, { n: editor.counts.value.issues })),
		confirmTitle: computed(() =>
			formatMessage(isTemplate.value ? UI_ROADMAP_EDIT.CONFIRM_TEMPLATE_TITLE : UI_ROADMAP_EDIT.CONFIRM_STAGE_TITLE, {
				title: pending.value?.title ?? '',
			}),
		),
		confirmText: computed(() =>
			pending.value?.kind === 'stage'
				? formatMessage(UI_ROADMAP_EDIT.CONFIRM_STAGE_TEXT, { topics: pending.value.topics })
				: UI_ROADMAP_EDIT.CONFIRM_TEMPLATE_TEXT,
		),
		confirmOk: computed(() => (isTemplate.value ? UI_ROADMAP_EDIT.CONFIRM_TEMPLATE_OK : UI_ROADMAP_EDIT.CONFIRM_STAGE_OK)),
		areaRef,
		inspectorRef,
		editor,
		sort,
		publish,
		savedText: (): string => editor.savedText(props.draftSavedAt),
	}
}
