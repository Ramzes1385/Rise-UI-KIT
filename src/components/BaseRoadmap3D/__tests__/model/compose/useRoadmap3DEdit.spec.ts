import { mountWith } from '../../fixtures/model.test-utils'
import { useRoadmap3DEdit } from '../../../model/compose/useRoadmap3DEdit'
import type { RoadmapData } from '@components/BaseRoadmap/types/roadmapData.types'
import { DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D } from '../../fixtures/roadmap3d.test-utils'

async function mountEdit(data: RoadmapData = DATA_ROADMAP_3D) {
	const announce = vi.fn()
	const focusStage = vi.fn()
	const mounted = mountWith(data, PROGRESS_ROADMAP_3D, ({ model, snapshot }) =>
		useRoadmap3DEdit({ model, snapshot, announce, focusStage }),
	)
	mounted.model.setMode('edit')
	await mounted.wrapper.vm.$nextTick()
	const ids = () => mounted.model.data.value.stages.map(stage => stage.id)
	return { ...mounted, edit: mounted.made, announce, focusStage, ids }
}

describe('useRoadmap3DEdit: порядок этапов', () => {
	it('shift двигает этап и озвучивает новое место общей историей модели', async () => {
		const { edit, ids, announce, model } = await mountEdit()
		expect(await edit.shift('frame', -1)).toBe(true)
		expect(ids()).toEqual(['frame', 'basics', 'build', 'ship'])
		expect(announce).toHaveBeenCalledWith(expect.stringContaining('Каркас'))
		expect(announce.mock.lastCall?.[0]).toMatch(/1.*4/)
		expect(model.editor.methods.undo()).toBe(true)
		expect(ids()).toEqual(['basics', 'frame', 'build', 'ship'])
	})

	it('за краем и для неизвестного этапа — false, ничего не меняется', async () => {
		const { edit, ids, announce } = await mountEdit()
		expect(await edit.shift('basics', -1)).toBe(false)
		expect(await edit.shift('ship', 1)).toBe(false)
		expect(await edit.shift('нет', 1)).toBe(false)
		expect(ids()).toEqual(['basics', 'frame', 'build', 'ship'])
		expect(announce).not.toHaveBeenCalled()
	})

	it('отказ хука beforeChange: перенос не проходит и молчит', async () => {
		const { edit, model, announce, ids } = await mountEdit()
		model.hooks.on('beforeChange', () => false)
		expect(await edit.shift('frame', -1)).toBe(false)
		expect(announce).not.toHaveBeenCalled()
		expect(ids()).toEqual(['basics', 'frame', 'build', 'ship'])
	})
})

describe('useRoadmap3DEdit: этапы', () => {
	it('add: свободный id по числу этапов, фокус на новом', async () => {
		const { edit, ids, focusStage } = await mountEdit()
		expect(await edit.add()).toBe(true)
		expect(ids().at(-1)).toBe('stage-5')
		expect(focusStage).toHaveBeenCalledWith('stage-5')
	})

	it('add обходит занятый id этапа или темы', async () => {
		const data: RoadmapData = {
			...DATA_ROADMAP_3D,
			stages: [{ id: 'stage-2', title: 'Один', topics: [{ id: 'stage-3', title: 'Тема' }] }],
		}
		const { edit, ids } = await mountEdit(data)
		await edit.add()
		expect(ids().at(-1)).toBe('stage-4')
	})

	it('add не фокусирует, если добавить не удалось', async () => {
		const { edit, model, focusStage } = await mountEdit()
		model.hooks.on('beforeChange', () => false)
		expect(await edit.add()).toBe(false)
		expect(focusStage).not.toHaveBeenCalled()
	})

	it('remove убирает этап и сбрасывает фокус; нельзя — не трогает', async () => {
		const { edit, ids, focusStage, model } = await mountEdit()
		expect(await edit.remove('build')).toBe(true)
		expect(ids()).toEqual(['basics', 'frame', 'ship'])
		expect(focusStage).toHaveBeenCalledWith(null)
		focusStage.mockClear()
		model.hooks.on('beforeDelete', () => false)
		expect(await edit.remove('ship')).toBe(false)
		expect(focusStage).not.toHaveBeenCalled()
	})

	it('rename меняет название', async () => {
		const { edit, model } = await mountEdit()
		await edit.rename('basics', 'Азы')
		expect(model.data.value.stages[0].title).toBe('Азы')
	})
})

describe('useRoadmap3DEdit: модель пьедестала', () => {
	it('своя модель по ключу заменяет прежнюю, цвет и масштаб остаются', async () => {
		const data: RoadmapData = {
			...DATA_ROADMAP_3D,
			stages: [{ id: 'a', title: 'A', topics: [], model3d: { model: 'book', tint: '#123456', scale: 2 } }],
		}
		const { edit, model } = await mountEdit(data)
		expect(await edit.setModel('a', { model: 'gear' })).toBe(true)
		expect(model.data.value.stages[0].model3d).toEqual({ tint: '#123456', scale: 2, model: 'gear' })
	})

	it('адрес GLB ставится отдельно', async () => {
		const { edit, model } = await mountEdit()
		await edit.setModel('basics', { url: 'a.glb' })
		expect(model.data.value.stages[0].model3d).toEqual({ url: 'a.glb' })
	})

	it('«авто» (пустая правка) убирает модель, но оставляет цвет; без цвета — убирает поле', async () => {
		const { edit, model } = await mountEdit()
		await edit.setModel('basics', { model: 'gear' })
		await edit.setModel('basics', {})
		expect(model.data.value.stages[0].model3d).toBeUndefined()
		await edit.setModel('frame', {})
		expect(model.data.value.stages[1].model3d).toEqual({ tint: '#ff8800' })
	})

	it('неизвестный этап — false', async () => {
		const { edit } = await mountEdit()
		expect(await edit.setModel('нет', { model: 'gear' })).toBe(false)
	})
})
