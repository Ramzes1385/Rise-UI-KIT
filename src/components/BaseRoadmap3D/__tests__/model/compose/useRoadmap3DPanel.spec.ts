import { reactive, ref } from 'vue'
import { mountWith } from '../../fixtures/model.test-utils'
import { useRoadmap3DPanel } from '../../../model/compose/useRoadmap3DPanel'
import type { RoadmapData } from '@components/BaseRoadmap/types/roadmapData.types'
import { DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D } from '../../fixtures/roadmap3d.test-utils'

function mountPanel(data: RoadmapData = DATA_ROADMAP_3D) {
	const focus = reactive({ focused: null as string | null, focusStage: vi.fn(), overview: vi.fn() })
	const focusRef = { focused: ref<string | null>(null), focusStage: vi.fn(), overview: vi.fn() }
	const mounted = mountWith(data, PROGRESS_ROADMAP_3D, ({ model, snapshot }) =>
		useRoadmap3DPanel({ model, snapshot, focus: focusRef as never }),
	)
	return { ...mounted, panel: mounted.made, focus: focusRef, unused: focus }
}

describe('useRoadmap3DPanel: этап', () => {
	it('без фокуса панели нет', () => {
		expect(mountPanel().panel.stage.value).toBeNull()
		expect(mountPanel().panel.topic.value).toBeNull()
	})

	it('в фокусе: номер, итог, часы, соседи', () => {
		const { panel, focus } = mountPanel()
		focus.focused.value = 'basics'
		expect(panel.stage.value).toMatchObject({
			n: 1,
			total: 4,
			hours: expect.stringContaining('10'),
			hasPrev: false,
			hasNext: true,
			unlock: '',
		})
		focus.focused.value = 'ship'
		expect(panel.stage.value).toMatchObject({ n: 4, hasPrev: true, hasNext: false, hours: '' })
	})

	it('закрытый этап называет, что открывает путь', () => {
		const { panel, focus } = mountPanel()
		focus.focused.value = 'build'
		expect(panel.stage.value?.unlock).toBe('Каркас')
	})

	it('закрытый этап, где условие не нашлось, даёт пустую подсказку', () => {
		const data: RoadmapData = {
			...DATA_ROADMAP_3D,
			stages: [{ id: 'z', title: 'Z', requires: ['нет такого'], topics: [{ id: 'q', title: 'Q' }] }],
		}
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { panel, focus } = mountPanel(data)
		focus.focused.value = 'z'
		expect(panel.stage.value?.unlock).toBe('')
		expect(warn).toHaveBeenCalled()
	})
})

describe('useRoadmap3DPanel: тема', () => {
	it('selectTopic выбирает тему и переводит фокус на её этап', () => {
		const { panel, focus, model } = mountPanel()
		panel.selectTopic('vue')
		expect(focus.focusStage).toHaveBeenCalledWith('frame')
		expect(model.selectedId.value).toBe('vue')
		focus.focused.value = 'frame'
		focus.focusStage.mockClear()
		panel.selectTopic('react')
		expect(focus.focusStage).not.toHaveBeenCalled()
		expect(model.selectedId.value).toBe('react')
	})

	it('неизвестная тема выбирается без смены фокуса; null снимает выбор', () => {
		const { panel, focus, model } = mountPanel()
		panel.selectTopic('нет')
		expect(focus.focusStage).not.toHaveBeenCalled()
		panel.selectTopic('vue')
		panel.selectTopic(null)
		expect(model.selectedId.value).toBeNull()
	})

	it('topic: тема выбранного этапа с подтемами, условиями и признаком «дальше»', () => {
		const { panel, focus } = mountPanel()
		panel.selectTopic('vue')
		focus.focused.value = 'frame'
		expect(panel.topic.value).toMatchObject({ doneSubtopics: ['vue-1'], hasNext: true, isBusy: false })
		expect(panel.topic.value?.requirements).toEqual([])
		focus.focused.value = 'basics'
		expect(panel.topic.value).toBeNull()
		panel.selectTopic('vite')
		focus.focused.value = 'build'
		expect(panel.topic.value).toMatchObject({ doneSubtopics: [], hasNext: true })
	})

	it('openNextTopic открывает следующую тему; без выбора и на последней ничего не делает', () => {
		const { panel, model } = mountPanel()
		panel.openNextTopic()
		expect(model.selectedId.value).toBeNull()
		panel.selectTopic('html')
		panel.openNextTopic()
		expect(model.selectedId.value).toBe('vue')
	})

	it('единственная тема: «дальше» нет, выбор остаётся', () => {
		const data: RoadmapData = { ...DATA_ROADMAP_3D, stages: [{ id: 'a', title: 'A', topics: [{ id: 'only', title: 'Одна' }] }] }
		const { panel, model, focus } = mountPanel(data)
		panel.selectTopic('only')
		focus.focused.value = 'a'
		expect(panel.topic.value?.hasNext).toBe(false)
		panel.openNextTopic()
		expect(model.selectedId.value).toBe('only')
	})

	it('closePanel: сначала закрывает тему, потом возвращает общий вид', () => {
		const { panel, focus, model } = mountPanel()
		panel.selectTopic('html')
		panel.closePanel()
		expect(model.selectedId.value).toBeNull()
		expect(focus.overview).not.toHaveBeenCalled()
		panel.closePanel()
		expect(focus.overview).toHaveBeenCalledOnce()
	})

	it('setStatus и toggleSubtopic меняют общий прогресс', async () => {
		const { panel, model } = mountPanel()
		panel.setStatus('svelte', 'done')
		await Promise.resolve()
		await Promise.resolve()
		expect(model.progress.value.topics.svelte?.status).toBe('done')
		panel.toggleSubtopic('vue', 'vue-2', true)
		await Promise.resolve()
		await Promise.resolve()
		expect(model.progress.value.topics.vue?.subtopics).toContain('vue-2')
	})
})

describe('useRoadmap3DPanel: неизвестный фокус и требования', () => {
	it('фокус на несуществующем этапе — панели нет', () => {
		const { panel, focus } = mountPanel()
		focus.focused.value = 'ghost'
		expect(panel.stage.value).toBeNull()
	})
})
