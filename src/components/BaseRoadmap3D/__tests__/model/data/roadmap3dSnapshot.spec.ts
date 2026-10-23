import { nextTick } from 'vue'
import { mountSnapshot } from '../../fixtures/model.test-utils'
import { stagesData } from '../../fixtures/roadmap3d.test-utils'
import { defaultPerRow, perRowOf, stageTint } from '../../../model/data/roadmap3dSnapshot'
import type { RoadmapData, RoadmapStage } from '@components/BaseRoadmap/types/roadmapData.types'

const stage = (patch: Partial<RoadmapStage> = {}): RoadmapStage => ({ id: 's', title: 'S', topics: [], ...patch })

describe('defaultPerRow и perRowOf', () => {
	it('по числу этапов: до 6 — 2, до 12 — 3, больше — 4', () => {
		expect([1, 6, 7, 12, 13, 24].map(defaultPerRow)).toEqual([2, 2, 3, 3, 4, 4])
	})

	it('берёт view3d.perRow и держит его в 2-4, не число — по умолчанию', () => {
		expect(perRowOf({ ...stagesData(3), view3d: { perRow: 4 } })).toBe(4)
		expect(perRowOf({ ...stagesData(3), view3d: { perRow: 9 } })).toBe(4)
		expect(perRowOf({ ...stagesData(3), view3d: { perRow: 1 } })).toBe(2)
		expect(perRowOf(stagesData(9))).toBe(3)
		expect(perRowOf({ ...stagesData(9), view3d: { perRow: undefined } })).toBe(3)
	})
})

describe('stageTint', () => {
	it('свой цвет сильнее, иначе --rise-chart-N по кругу из шести', () => {
		expect(stageTint(stage({ model3d: { tint: '#123456' } }), 0)).toBe('#123456')
		expect(stageTint(stage(), 0)).toBe('var(--rise-chart-1)')
		expect(stageTint(stage(), 5)).toBe('var(--rise-chart-6)')
		expect(stageTint(stage(), 6)).toBe('var(--rise-chart-1)')
	})
})

describe('снимок пути', () => {
	it('этапы: статус, проценты, цвет, выбор модели, темы и места по змейке', () => {
		const { snapshot } = mountSnapshot()
		const [basics, frame, build, ship] = snapshot.value.stages
		expect([basics.status, frame.status, build.status, ship.status]).toEqual(['done', 'current', 'locked', 'done'])
		expect(basics.percent).toBe(100)
		expect(frame.percent).toBe(0)
		expect(build.percent).toBe(0)
		expect(ship.percent).toBe(0)
		expect(frame.tint).toBe('#ff8800')
		expect(basics.tint).toBe('var(--rise-chart-1)')
		expect(basics.selection.node.tags).toEqual(['web', 'style'])
		expect(basics.selection.node.tone).toBe('none')
		expect(build.selection.node.tone).toBe('muted')
		expect(basics.selection.model3d).toBeUndefined()
		expect(frame.selection.model3d).toEqual({ model: 'book', url: undefined })
		expect(frame.topics.map(topic => [topic.id, topic.isAlternative, topic.isOptional])).toEqual([
			['vue', false, false],
			['react', false, false],
			['svelte', true, true],
		])
		expect(snapshot.value.stages.map(item => item.index)).toEqual([0, 1, 2, 3])
		expect(snapshot.value.stages.every(item => Number.isFinite(item.position.x) && Number.isFinite(item.position.z))).toBe(true)
		expect(snapshot.value.goal).toBe('Работа')
		expect(snapshot.value.currentIndex).toBe(1)
		expect(snapshot.value.hasCar).toBe(true)
	})

	it('своя модель по адресу попадает в выбор, пустое model3d — нет', () => {
		const data: RoadmapData = {
			version: 1,
			title: 'Адрес',
			stages: [stage({ id: 'a', model3d: { url: 'a.glb' } }), stage({ id: 'b', model3d: { scale: 2 } })],
		}
		const { snapshot } = mountSnapshot(data, undefined)
		expect(snapshot.value.stages[0].selection.model3d).toEqual({ model: undefined, url: 'a.glb' })
		expect(snapshot.value.stages[1].selection.model3d).toBeUndefined()
	})

	it('доля дороги идёт по текущему этапу и растёт с прогрессом', async () => {
		const { snapshot, wrapper } = mountSnapshot()
		const before = snapshot.value.progress
		expect(before).toBeGreaterThan(0)
		expect(before).toBeLessThan(1)
		await wrapper.setProps({
			progress: { version: 1, topics: { html: { status: 'done' }, css: { status: 'done' }, vue: { status: 'done' } } },
		})
		await nextTick()
		expect(snapshot.value.progress).toBeGreaterThan(before)
	})

	it('всё пройдено — 1; нет текущего и не всё пройдено — 0; пустой путь — 0 и без машинки', () => {
		const done = mountSnapshot(stagesData(2), { version: 1, topics: { t1: { status: 'done' }, t2: { status: 'done' } } })
		expect(done.snapshot.value.progress).toBe(1)
		expect(done.snapshot.value.currentIndex).toBe(-1)
		const optional = mountSnapshot(
			{ ...stagesData(1), stages: [stage({ id: 'o', kind: 'optional', topics: [{ id: 'x', title: 'X' }] })] },
			undefined,
		)
		expect(optional.snapshot.value.progress).toBe(0)
		const empty = mountSnapshot(stagesData(0), undefined)
		expect(empty.snapshot.value.progress).toBe(0)
		expect(empty.snapshot.value.hasCar).toBe(false)
	})

	it('hasCar: false в view3d убирает машинку', () => {
		const { snapshot } = mountSnapshot({ ...stagesData(2), view3d: { hasCar: false } }, undefined)
		expect(snapshot.value.hasCar).toBe(false)
	})

	it('закрытый этап без тем — 0 %', () => {
		const data: RoadmapData = {
			version: 1,
			title: 'Закрыт',
			stages: [stage({ id: 'a', topics: [{ id: 'ta', title: 'TA' }] }), stage({ id: 'b', requires: ['a'] })],
		}
		const { snapshot } = mountSnapshot(data, undefined)
		expect(snapshot.value.stages[1].percent).toBe(0)
	})

	it('зерно из view3d.seed, без него — из id или названия: остров тот же при том же зерне', () => {
		const first = mountSnapshot({ ...stagesData(3), view3d: { seed: 7 } }, undefined).snapshot.value.island
		const second = mountSnapshot({ ...stagesData(3), view3d: { seed: 7 } }, undefined).snapshot.value.island
		const other = mountSnapshot({ ...stagesData(3), view3d: { seed: 8 } }, undefined).snapshot.value.island
		const noId = mountSnapshot({ ...stagesData(3), id: undefined }, undefined).snapshot.value.island
		expect(JSON.stringify(first)).toBe(JSON.stringify(second))
		expect(JSON.stringify(first)).not.toBe(JSON.stringify(other))
		expect(noId.layout.stages).toHaveLength(3)
	})
})
