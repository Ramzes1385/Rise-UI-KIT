import { computed, useId } from 'vue'
import { formatMessage, formatNumber } from '@/locales/state'
import { useRoadmap3DUi, roadmapPanelUi } from '../view/useRoadmap3DUi'
import { UI_ROADMAP, UI_ROADMAP_3D, UI_SCENE_3D } from '@/locales/messages'
import type { Roadmap3DStageItem } from '../../types/internal/roadmap3dInternal.types'
import { summaryDoneText } from '@components/BaseRoadmap/model/view/format/roadmapText'
import type { RoadmapModel } from '@components/BaseRoadmap/types/internal/roadmapView.types'
import type { Roadmap3DTemplateParts, Roadmap3DStageApi } from '../../types/internal/roadmap3dCompose.types'

function stepItems(stages: Roadmap3DStageItem[], focusedId: string | null) {
	return stages.map(item => ({
		id: item.id,
		n: item.index + 1,
		status: item.status,
		isFocused: focusedId === item.id,
		label: formatMessage(item.status === 'locked' ? UI_ROADMAP_3D.LIVE_LOCKED : UI_ROADMAP_3D.LIVE_STAGE, {
			n: item.index + 1,
			of: stages.length,
			title: item.title,
			percent: item.percent,
		}),
	}))
}

function summaryText(value: RoadmapModel['summary']['value'], title: string | null) {
	return {
		total: value.total,
		percent: value.percent,
		doneText: summaryDoneText(value.done, value.total),
		percentText: formatMessage(UI_ROADMAP.SUMMARY_PERCENT, { percent: formatNumber(value.percent) }),
		leftText: value.hoursLeft > 0 ? formatMessage(UI_ROADMAP.SUMMARY_HOURS, { hours: formatNumber(Math.round(value.hoursLeft)) }) : '',
		continueText: value.continueTopicId ? formatMessage(UI_ROADMAP.CONTINUE, { topic: title! }) : '',
	}
}

export function useRoadmap3DTemplate(parts: Roadmap3DTemplateParts, stage: Roadmap3DStageApi) {
	const { props, model, view, snapshot, focus, tour } = parts
	const ui = useRoadmap3DUi(props)
	const status = computed(() => {
		if (view.shownView.value === '2d') return null
		if (props.isLoading) return { kind: 'loading', text: UI_ROADMAP.LOADING }
		if (snapshot.value.stages.length === 0) return { kind: 'empty', text: UI_ROADMAP.EMPTY }
		return stage.content.value ? null : { kind: 'loading', text: UI_ROADMAP_3D.BUILDING }
	})
	const caption = computed(() =>
		tour.isPlaying.value ? formatMessage(UI_ROADMAP_3D.TOUR_STEP, { n: tour.step.value + 1, of: tour.total.value }) : '',
	)
	const steps = computed(() => stepItems(snapshot.value.stages, focus.focused.value))
	const summary = computed(() =>
		summaryText(model.summary.value, model.index.value.topics.get(model.summary.value.continueTopicId ?? '')?.topic.title ?? null),
	)
	const nav = computed(() => {
		const index = focus.indexOf(focus.focused.value ?? focus.cursor.value)
		return { isFirst: index === 0, isLast: index >= 0 && index === snapshot.value.stages.length - 1 }
	})
	return {
		ui,
		nav,
		summary,
		isSupported: view.fallback.isSupported,
		hasPanel: computed(() => view.shownView.value === '3d' && focus.focused.value !== null),
		snapshotEmpty: computed(() => snapshot.value.stages.length === 0),
		viewOptions: [
			{ value: '3d', label: UI_ROADMAP_3D.VIEW_3D },
			{ value: '2d', label: UI_ROADMAP_3D.VIEW_2D },
		],
		panelUi: roadmapPanelUi,
		status,
		caption,
		steps,
		label: computed(() => props.ariaLabel ?? model.data.value.title ?? UI_ROADMAP_3D.DEFAULT_LABEL),
		hasCanvas: computed(() => view.shownView.value === '3d' && view.fallback.isSupported.value === true),
		hintId: `${useId()}-hint`,
		keyboardHint: `${UI_SCENE_3D.KEYBOARD_HINT}. ${UI_ROADMAP_3D.KEYBOARD_HINT}`,
	}
}
