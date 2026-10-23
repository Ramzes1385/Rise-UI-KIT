import { reactive } from 'vue'
import { mountWith } from '../../fixtures/model.test-utils'
import { useRoadmap3DTwoD } from '../../../model/view/useRoadmap3DTwoD'
import type { Roadmap3DProps } from '../../../types/BaseRoadmap3D.types'
import { DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D } from '../../fixtures/roadmap3d.test-utils'

function mountTwoD() {
	const props = reactive({
		modes: ['view', 'edit'],
		review: null,
		templates: undefined,
		hasSummary: true,
		isLoading: false,
		isDisabled: true,
	})
	const emit = vi.fn()
	const mounted = mountWith(DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D, ({ model }) =>
		useRoadmap3DTwoD({ props: props as unknown as Roadmap3DProps, emit: emit as never, model, getLabel: () => 'Подпись' }),
	)
	return { ...mounted, twoD: mounted.made, emit }
}

describe('useRoadmap3DTwoD', () => {
	it('отдаёт 2D-виду данные, прогресс, выбор, режим и подпись; раскладка — путь, хранилище у 3D', () => {
		const { twoD, model } = mountTwoD()
		expect(twoD.value).toMatchObject({
			data: model.data.value,
			progress: model.progress.value,
			storage: null,
			selected: null,
			layout: 'path',
			ariaLabel: 'Подпись',
			isDisabled: true,
			modes: ['view', 'edit'],
		})
	})

	it('события 2D-вида уходят наружу под своими именами', () => {
		const { twoD, emit } = mountTwoD()
		const listeners = twoD.value as unknown as Record<string, (...args: unknown[]) => void>
		const forwarded: Record<string, string> = {
			'onUpdate:expanded': 'update:expanded',
			'onUpdate:filter': 'update:filter',
			'onUpdate:review': 'update:review',
			onStatusChange: 'status-change',
			onTopicComplete: 'topic-complete',
			onStageComplete: 'stage-complete',
			onReorder: 'reorder',
			onPublish: 'publish',
			onProgressError: 'progress-error',
		}
		Object.entries(forwarded).forEach(([key, name]) => {
			listeners[key]('a', 'b')
			expect(emit).toHaveBeenLastCalledWith(name, 'a', 'b')
		})
	})

	it('данные, прогресс, выбор и режим из 2D-вида попадают в общую модель и наружу', () => {
		const { twoD, model, emit } = mountTwoD()
		const listeners = twoD.value as unknown as Record<string, (value: unknown) => void>
		const data = { ...DATA_ROADMAP_3D, title: 'Новое' }
		listeners['onUpdate:data'](data)
		expect(model.data.value.title).toBe('Новое')
		expect(emit).toHaveBeenCalledWith('update:data', data)
		const progress = { version: 1, topics: { vite: { status: 'done' } } }
		listeners['onUpdate:progress'](progress)
		expect(model.progress.value).toEqual(progress)
		expect(emit).toHaveBeenCalledWith('update:progress', progress)
		listeners['onUpdate:selected']('html')
		expect(model.selectedId.value).toBe('html')
		listeners['onUpdate:mode']('edit')
		expect(model.currentMode.value).toBe('edit')
	})

	it('хуки 2D-вида идут через общий реестр: отказ хука — false, иначе undefined', async () => {
		const { twoD, model } = mountTwoD()
		const hooks = twoD.value as unknown as Record<string, (context: unknown) => Promise<unknown>>
		expect(await hooks.beforeStatusChange({})).toBeUndefined()
		expect(await hooks.beforeDelete({})).toBeUndefined()
		expect(await hooks.beforeChange({ changes: [] })).toEqual([])
		model.hooks.on('beforeStatusChange', () => false)
		model.hooks.on('beforeDelete', () => false)
		model.hooks.on('beforeChange', () => false)
		expect(await hooks.beforeStatusChange({})).toBe(false)
		expect(await hooks.beforeDelete({})).toBe(false)
		expect(await hooks.beforeChange({ changes: [] })).toBe(false)
	})

	it('хук изменений может вернуть свой список правок', async () => {
		const { twoD, model } = mountTwoD()
		const hooks = twoD.value as unknown as Record<string, (context: unknown) => Promise<unknown>>
		const replaced = [{ type: 'rename' }]
		model.hooks.on('beforeChange', () => replaced as never)
		expect(await hooks.beforeChange({ changes: [] })).toEqual(replaced)
		model.hooks.on('beforeChange', () => 'не список' as never)
		expect(await hooks.beforeChange({ changes: [] })).toBeUndefined()
	})
})
