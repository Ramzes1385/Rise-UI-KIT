import { buildStageViews } from '../../../model/state/roadmapViews'
import { progressOf, roadmap, stage, statusesOf, topic } from '../fixtures/roadmapFixtures'

const data = roadmap([stage('s1', [topic('a', { hours: 1.5 }), topic('b', { kind: 'optional' })]), stage('s2', [topic('c')])])

describe('buildStageViews', () => {
	it('строит вид этапов с id для aria из префикса', () => {
		const views = buildStageViews({
			data,
			statuses: statusesOf(data, progressOf({ a: { status: 'done' } })),
			expanded: ['s2'],
			filter: 'all',
			selectedId: 'c',
			idPrefix: 'rm',
		})
		expect(views[0]).toMatchObject({ index: 0, status: 'done', done: 1, total: 2, hours: 1.5, isExpanded: false })
		expect(views[0].headingId).toBe('rm-stage-0-heading')
		expect(views[1]).toMatchObject({ isExpanded: true, panelId: 'rm-stage-1-panel' })
		expect(views[1].topics[0].isSelected).toBe(true)
	})

	it('запасные значения, если статусов для этапа и темы нет: этап доступен, тема доступна без прогресса', () => {
		const views = buildStageViews({
			data,
			statuses: { topics: new Map(), stages: new Map(), currentStageId: null },
			expanded: [],
			filter: 'all',
			selectedId: null,
			idPrefix: 'rm',
		})
		expect(views[0].status).toBe('available')
		expect(views[0].topics[0].state).toEqual({ status: 'available', done: 0, total: 0, fraction: 0, missing: [] })
		expect(views[0].done).toBe(0)
	})
})
