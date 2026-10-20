import { computed } from 'vue'
import { presetsOfSet } from '@/scene3d/models/presets'
import type { BadgeStatus } from '@components/BaseBadge'
import { modelTitle } from '@/scene3d/models/modelTitles'
import { formatMessage, formatNumber } from '@/locales/state'
import { UI_ROADMAP, UI_ROADMAP_3D } from '@/locales/messages'
import type { RoadmapStagePanelProps } from '../../types/internal/roadmap3dUi.types'
import { formatHours, topicStatusText } from '@components/BaseRoadmap/model/view/format/roadmapText'

const RING_RADIUS = 26
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
export const CUSTOM_MODEL = '__custom'
export const AUTO_MODEL = '__auto'

const BADGES: Record<string, { status: BadgeStatus; text: string }> = {
	done: { status: 'success', text: UI_ROADMAP.STAGE_DONE },
	current: { status: 'primary', text: UI_ROADMAP.STAGE_CURRENT },
	locked: { status: 'neutral', text: UI_ROADMAP.STAGE_LOCKED },
}

export function modelOptions() {
	return [
		{ value: AUTO_MODEL, label: UI_ROADMAP_3D.MODEL_AUTO },
		...presetsOfSet('learning').map(id => ({ value: id, label: modelTitle(id) })),
		{ value: CUSTOM_MODEL, label: UI_ROADMAP_3D.MODEL_CUSTOM },
	]
}

export function useRoadmapStagePanel(props: RoadmapStagePanelProps) {
	const current = computed(() => {
		const { model, url } = props.stage.item.selection.model3d ?? {}
		if (url) return CUSTOM_MODEL
		return model ?? AUTO_MODEL
	})
	return {
		eyebrow: computed(() => formatMessage(UI_ROADMAP_3D.PANEL_EYEBROW, { n: props.stage.n, of: props.stage.total })),
		badge: computed(() => BADGES[props.stage.item.status] ?? null),
		percentText: computed(() => formatMessage(UI_ROADMAP.SUMMARY_PERCENT, { percent: formatNumber(props.stage.item.percent) })),
		doneText: computed(() =>
			formatMessage(UI_ROADMAP_3D.PANEL_TOPICS_DONE, { done: props.stage.item.done, of: props.stage.item.total }),
		),
		unlockText: computed(() => (props.stage.unlock ? formatMessage(UI_ROADMAP.STAGE_UNLOCK, { title: props.stage.unlock }) : '')),
		dash: computed(() => `${(CIRCUMFERENCE * props.stage.item.percent) / 100} ${CIRCUMFERENCE}`),
		circumference: CIRCUMFERENCE,
		radius: RING_RADIUS,
		rows: computed(() =>
			props.stage.view.topics.map(row => ({
				id: row.topic.id,
				title: row.topic.title,
				status: row.state.status,
				statusText: topicStatusText(row.state.status),
				isAlternative: row.isAlternative,
				hours: row.topic.hours === undefined ? '' : formatHours(row.topic.hours),
			})),
		),
		editClass: 'base-roadmap-3d__panel-edit',
		models: modelOptions(),
		currentModel: current,
		isCustomModel: computed(() => current.value === CUSTOM_MODEL),
		customUrl: computed(() => props.stage.item.selection.model3d?.url ?? ''),
	}
}
