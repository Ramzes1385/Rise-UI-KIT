import { reactive, ref } from 'vue'
import { mountWith } from '../../fixtures/model.test-utils'
import { useRoadmap3DPanel } from '../../../model/compose/useRoadmap3DPanel'
import type { RoadmapData } from '@components/BaseRoadmap/types/roadmapData.types'
import type { RoadmapStagePanelProps } from '../../../types/internal/roadmap3dUi.types'
import { AUTO_MODEL, useRoadmapStagePanel } from '../../../model/view/useRoadmapStagePanel'
import { DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D, stagesData } from '../../fixtures/roadmap3d.test-utils'

function panelFor(id: string, data: RoadmapData = DATA_ROADMAP_3D) {
	const focused = ref<string | null>(id)
	const mounted = mountWith(data, PROGRESS_ROADMAP_3D, ({ model, snapshot }) => {
		const panel = useRoadmap3DPanel({ model, snapshot, focus: { focused } as never })
		const props = reactive({ stage: panel.stage.value }) as unknown as RoadmapStagePanelProps
		return useRoadmapStagePanel(props)
	})
	return mounted.made
}

describe('useRoadmapStagePanel', () => {
	it('подпись, проценты, итог тем и кольцо', () => {
		const panel = panelFor('basics')
		expect(panel.eyebrow.value).toContain('1')
		expect(panel.percentText.value).toContain('100')
		expect(panel.doneText.value).toContain('2')
		expect(panel.dash.value).toBe(`${panel.circumference} ${panel.circumference}`)
		expect(panel.radius).toBe(26)
		expect(panel.editClass).toBe('base-roadmap-3d__panel-edit')
	})

	it('значок статуса: пройден, идёт, закрыт; у остальных его нет', () => {
		expect(panelFor('basics').badge.value?.status).toBe('success')
		expect(panelFor('frame').badge.value?.status).toBe('primary')
		expect(panelFor('build').badge.value?.status).toBe('neutral')
		expect(panelFor('s2', stagesData(3)).badge.value).toBeNull()
	})

	it('подсказка «откроется после» только у закрытого этапа', () => {
		expect(panelFor('build').unlockText.value).toContain('Каркас')
		expect(panelFor('basics').unlockText.value).toBe('')
	})

	it('строки тем: часы, альтернатива, статус словами', () => {
		const rows = panelFor('frame').rows.value
		expect(rows.map(row => row.id)).toEqual(['vue', 'react', 'svelte'])
		expect(rows[0].hours).not.toBe('')
		expect(rows[2]).toMatchObject({ isAlternative: true, hours: '' })
		expect(rows[0].statusText).not.toBe('')
	})

	it('выбор модели: авто, встроенная, своя по адресу; список — авто, модели набора, своя', () => {
		const auto = panelFor('basics')
		expect(auto.currentModel.value).toBe(AUTO_MODEL)
		expect(auto.isCustomModel.value).toBe(false)
		expect(auto.customUrl.value).toBe('')
		expect(auto.models[0]).toEqual({ value: AUTO_MODEL, label: expect.any(String) })
		expect(auto.models.at(-1)?.value).toBe('__custom')
		expect(auto.models.length).toBeGreaterThan(3)
		expect(panelFor('frame').currentModel.value).toBe('book')
		const custom = panelFor('a', {
			...DATA_ROADMAP_3D,
			stages: [{ id: 'a', title: 'A', topics: [], model3d: { url: 'a.glb' } }],
		})
		expect(custom.currentModel.value).toBe('__custom')
		expect(custom.isCustomModel.value).toBe(true)
		expect(custom.customUrl.value).toBe('a.glb')
	})
})
