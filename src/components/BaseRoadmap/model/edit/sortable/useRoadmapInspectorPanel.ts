import { computed, ref } from 'vue'
import { UI_ROADMAP } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import type { TabItem } from '@components/BaseTabs'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import type { BaseSelectOption } from '@components/BaseSelect'
import { topicStatusText } from '../../view/format/roadmapText'
import { useRoadmapHooksTab } from '../view/useRoadmapHooksTab'
import { useRoadmapEditorContext } from '../view/roadmapEditorContext'
import type { RoadmapMaterialKind, RoadmapProgressStatus } from '../../../types/roadmapData.types'
import { ROADMAP_MATERIAL_KINDS, ROADMAP_PROGRESS_STATUSES } from '../../../types/roadmapData.types'
const NO_STATUS = 'available'

const KIND_TEXT: Record<RoadmapMaterialKind, () => string> = {
	doc: () => UI_ROADMAP.MATERIAL_DOC,
	article: () => UI_ROADMAP.MATERIAL_ARTICLE,
	video: () => UI_ROADMAP.MATERIAL_VIDEO,
	course: () => UI_ROADMAP.MATERIAL_COURSE,
	book: () => UI_ROADMAP.MATERIAL_BOOK,
	practice: () => UI_ROADMAP.MATERIAL_PRACTICE,
	link: () => UI_ROADMAP.MATERIAL_LINK,
}

export function useRoadmapInspectorPanel() {
	const { edit, editor, isDisabled } = useRoadmapEditorContext()
	const { inspector } = editor
	const rootRef = ref<HTMLElement | null>(null)
	const newKind = ref<RoadmapMaterialKind>('doc')
	const hooksCount = useRoadmapHooksTab().count
	const materialsCount = computed(() => inspector.topic.value?.materials?.length ?? 0)
	return {
		rootRef,
		newKind,
		inspector,
		isDisabled,
		materialsCount,
		focusTitle: (): void => rootRef.value?.querySelector<HTMLInputElement>('[data-roadmap-title] input')?.focus(),
		eyebrow: computed(() => {
			const stage = inspector.owner.value
			const index = edit.viewData.value.stages.findIndex(item => item.id === stage?.id)
			return formatMessage(UI_ROADMAP_EDIT.EYEBROW, { n: index + 1, title: stage?.title ?? '' })
		}),
		badge: computed(() => {
			const item = inspector.topic.value ?? inspector.stage.value
			return item?.kind === 'optional' ? UI_ROADMAP.KIND_OPTIONAL : UI_ROADMAP.KIND_REQUIRED
		}),
		isAlternative: computed(() => inspector.topic.value?.choice !== undefined),
		stageOptions: computed<BaseSelectOption[]>(() => edit.viewData.value.stages.map(item => ({ value: item.id, label: item.title }))),
		kindOptions: computed(() => ROADMAP_MATERIAL_KINDS.map(kind => ({ value: kind, label: KIND_TEXT[kind]() }))),
		tabs: computed<TabItem[]>(() => [
			{ id: 'topic', label: UI_ROADMAP_EDIT.TAB_TOPIC },
			{ id: 'materials', label: `${UI_ROADMAP_EDIT.TAB_MATERIALS} ${materialsCount.value}` },
			{ id: 'hooks', label: `${UI_ROADMAP_EDIT.TAB_HOOKS} ${hooksCount.value}` },
		]),
		defaultStatus: computed(() => inspector.topic.value?.defaultStatus ?? NO_STATUS),
		defaultStatusOptions: computed<BaseSelectOption[]>(() => [
			{ value: NO_STATUS, label: UI_ROADMAP_EDIT.DEFAULT_STATUS_NONE },
			...ROADMAP_PROGRESS_STATUSES.map(status => ({ value: status, label: topicStatusText(status) })),
		]),
		onDefaultStatus: (value: unknown): void =>
			void inspector.setDefaultStatus(value === NO_STATUS ? undefined : (value as RoadmapProgressStatus)),
		requires: computed(() => inspector.topic.value?.requires ?? inspector.stage.value?.requires ?? []),
		onRequires: (value: unknown): void => void inspector.setRequires(value as string[]),
		onStage: (value: unknown): void => void inspector.moveToStage(value as string),
		onHours: (value: number | null): void => void inspector.setHours(value),
		done: (): void => inspector.select(null),
		remove: (): void => editor.requestRemove(inspector.targetId.value as string),
		removeSubtopicLabel: (title: string): string => formatMessage(UI_ROADMAP_EDIT.REMOVE_SUBTOPIC, { title }),
		removeMaterialLabel: (title: string): string => formatMessage(UI_ROADMAP_EDIT.REMOVE_MATERIAL, { title }),
		materials: computed(() => inspector.topic.value?.materials ?? []),
		materialsHeading: computed(() => formatMessage(UI_ROADMAP_EDIT.MATERIALS_OF, { title: inspector.topic.value?.title ?? '' })),
	}
}
