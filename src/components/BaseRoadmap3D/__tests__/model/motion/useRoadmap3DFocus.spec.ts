import { reactive } from 'vue'
import { nextTick } from 'vue'
import { mountWith } from '../../fixtures/model.test-utils'
import type { Roadmap3DProps } from '../../../types/BaseRoadmap3D.types'
import { useRoadmap3DFocus } from '../../../model/motion/useRoadmap3DFocus'
import type { RoadmapData } from '@components/BaseRoadmap/types/roadmapData.types'
import type { Roadmap3DCameraApi } from '../../../types/internal/roadmap3dCompose.types'
import { DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D, stagesData } from '../../fixtures/roadmap3d.test-utils'

function mountFocus(options: { data?: RoadmapData; focused?: string | null; hasCamera?: boolean } = {}) {
	const props = reactive({ focused: options.focused }) as unknown as Roadmap3DProps
	const emit = vi.fn()
	const announce = vi.fn()
	const focusPoint = vi.fn()
	const camera = { focusPoint } as unknown as Roadmap3DCameraApi
	const mounted = mountWith(options.data ?? DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D, ({ snapshot }) =>
		useRoadmap3DFocus({
			props,
			emit: emit as never,
			snapshot,
			getCamera: () => (options.hasCamera === false ? null : camera),
			announce,
		}),
	)
	return { ...mounted, focus: mounted.made, props, emit, announce, focusPoint }
}

describe('useRoadmap3DFocus: фокус', () => {
	it('focusStage ставит фокус, двигает камеру, сообщает наружу и вслух', () => {
		const { focus, emit, announce, focusPoint, snapshot } = mountFocus()
		focus.focusStage('frame')
		expect(focus.focused.value).toBe('frame')
		expect(focus.cursor.value).toBe('frame')
		expect(emit).toHaveBeenCalledWith('update:focused', 'frame')
		expect(focusPoint).toHaveBeenCalledWith(snapshot.value.stages[1].position)
		expect(announce).toHaveBeenLastCalledWith(expect.stringContaining('Каркас'))
		expect(announce.mock.lastCall?.[0]).toContain('вы здесь')
	})

	it('закрытый этап озвучивается как закрытый, обычный — без «Вы здесь»', () => {
		const { focus, announce } = mountFocus()
		focus.focusStage('build')
		expect(announce.mock.lastCall?.[0]).toContain('Сборка')
		expect(announce.mock.lastCall?.[0]).not.toContain('вы здесь')
		focus.focusStage('basics')
		expect(announce.mock.lastCall?.[0]).not.toContain('вы здесь')
	})

	it('неизвестный id и null — общий вид: камера на весь остров, курсор остаётся', () => {
		const { focus, emit, announce, focusPoint } = mountFocus({ focused: 'basics' })
		expect(focus.focused.value).toBe('basics')
		focus.focusStage('нет такого')
		expect(focus.focused.value).toBeNull()
		expect(focus.cursor.value).toBe('basics')
		expect(focusPoint).toHaveBeenLastCalledWith(null)
		expect(emit).toHaveBeenLastCalledWith('update:focused', null)
		expect(announce).toHaveBeenCalledTimes(1)
	})

	it('тихий фокус не сообщает; камеры нет — не падает', () => {
		const { focus, emit, announce } = mountFocus({ hasCamera: false })
		focus.focusStage('basics', true)
		expect(emit).not.toHaveBeenCalled()
		expect(announce).not.toHaveBeenCalled()
		expect(() => focus.reapply()).not.toThrow()
	})

	it('reapply повторяет наезд, overview возвращает общий вид', () => {
		const { focus, focusPoint, snapshot } = mountFocus({ focused: 'frame' })
		focus.reapply()
		expect(focusPoint).toHaveBeenLastCalledWith(snapshot.value.stages[1].position)
		focus.overview()
		expect(focus.focused.value).toBeNull()
	})
})

describe('useRoadmap3DFocus: курсор и переходы', () => {
	it('step без фокуса двигает курсор: вперёд с первого, назад с последнего', () => {
		const { focus, announce, emit } = mountFocus()
		focus.step(1)
		expect(focus.cursor.value).toBe('basics')
		focus.step(1)
		expect(focus.cursor.value).toBe('frame')
		expect(emit).not.toHaveBeenCalled()
		expect(announce).toHaveBeenCalledTimes(2)
		const back = mountFocus()
		back.focus.step(-1)
		expect(back.focus.cursor.value).toBe('ship')
	})

	it('step в фокусе переводит фокус; на краях остаётся на краю', () => {
		const { focus } = mountFocus({ focused: 'frame' })
		focus.step(1)
		expect(focus.focused.value).toBe('build')
		focus.last()
		expect(focus.focused.value).toBe('ship')
		focus.step(1)
		expect(focus.focused.value).toBe('ship')
		focus.first()
		expect(focus.focused.value).toBe('basics')
		focus.step(-1)
		expect(focus.focused.value).toBe('basics')
	})

	it('go без места идёт на текущий этап, с места — на соседний', () => {
		const { focus } = mountFocus()
		focus.go(1)
		expect(focus.focused.value).toBe('frame')
		focus.go(1)
		expect(focus.focused.value).toBe('build')
		focus.go(-1)
		expect(focus.focused.value).toBe('frame')
	})

	it('go без текущего этапа идёт на первый', () => {
		const done = { version: 1, topics: { t1: { status: 'done' }, t2: { status: 'done' } } } as never
		const props = reactive({ focused: undefined }) as unknown as Roadmap3DProps
		const mounted = mountWith(stagesData(2), done, ({ snapshot }) =>
			useRoadmap3DFocus({ props, emit: vi.fn() as never, snapshot, getCamera: () => null, announce: vi.fn() }),
		)
		mounted.made.go(1)
		expect(mounted.made.focused.value).toBe('s1')
	})

	it('пустой путь: переходы ничего не делают', () => {
		const { focus } = mountFocus({ data: stagesData(0) })
		focus.step(1)
		focus.first()
		focus.last()
		focus.go(1)
		expect(focus.focused.value).toBeNull()
		expect(focus.cursor.value).toBeNull()
		expect(focus.indexOf(null)).toBe(-1)
	})
})

describe('useRoadmap3DFocus: слежение', () => {
	it('проп focused меняет фокус тихо, тот же — ничего не делает', async () => {
		const { focus, props, emit } = mountFocus()
		;(props as { focused: string | null }).focused = 'frame'
		await nextTick()
		expect(focus.focused.value).toBe('frame')
		;(props as { focused?: string | null }).focused = undefined
		await nextTick()
		expect(focus.focused.value).toBeNull()
		;(props as { focused: string | null }).focused = null
		await nextTick()
		expect(emit).not.toHaveBeenCalled()
	})

	it('пропал этап в фокусе или под курсором — фокус и курсор сброшены', async () => {
		const { focus, wrapper, emit } = mountFocus({ focused: 'frame' })
		focus.step(1)
		const data = { ...DATA_ROADMAP_3D, stages: DATA_ROADMAP_3D.stages.filter(stage => stage.id === 'basics') }
		await wrapper.setProps({ data })
		expect(focus.focused.value).toBeNull()
		expect(focus.cursor.value).toBeNull()
		expect(emit).toHaveBeenCalledWith('update:focused', null)
	})

	it('смена данных, где этапы на месте, фокус не трогает', async () => {
		const { focus, wrapper } = mountFocus({ focused: 'basics' })
		await wrapper.setProps({ data: { ...DATA_ROADMAP_3D, title: 'Другой' } })
		expect(focus.focused.value).toBe('basics')
	})
})
