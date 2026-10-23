import { progressOf, topic } from '../fixtures/roadmapFixtures'
import {
	emptyRoadmapProgress,
	markedSubtopics,
	mergeRoadmapProgress,
	normalizeRoadmapProgress,
	roadmapProgressKey,
	withSubtopic,
	withTopicStatus,
} from '../../../model/progress/roadmapProgress'

const NOW = '2026-10-18T10:00:00.000Z'
const subtopics = [
	{ id: 'x', title: 'X' },
	{ id: 'y', title: 'Y' },
]

describe('emptyRoadmapProgress', () => {
	it('версия 1 и пустые темы; каждый раз новый объект', () => {
		expect(emptyRoadmapProgress()).toEqual({ version: 1, topics: {} })
		expect(emptyRoadmapProgress()).not.toBe(emptyRoadmapProgress())
	})
})

describe('roadmapProgressKey', () => {
	it('data.id — как есть', () => {
		expect(roadmapProgressKey({ version: 1, id: 'vue', title: 'T', stages: [] })).toBe('vue')
	})

	it('без id — roadmap-<хеш названия>, стабильный и зависящий от названия', () => {
		const key = roadmapProgressKey({ version: 1, title: 'Путь', stages: [] })
		expect(key).toMatch(/^roadmap-[0-9a-z]+$/)
		expect(roadmapProgressKey({ version: 1, title: 'Путь', stages: [] })).toBe(key)
		expect(roadmapProgressKey({ version: 1, title: 'Другой путь', stages: [] })).not.toBe(key)
	})

	it('пустое название даёт хеш начального значения', () => {
		expect(roadmapProgressKey({ version: 1, title: '', stages: [] })).toBe(`roadmap-${(5381).toString(36)}`)
	})
})

describe('withTopicStatus', () => {
	it('ставит статус и метку updatedAt, исходный прогресс не меняет', () => {
		const base = progressOf()
		const next = withTopicStatus(base, { topicId: 'a', status: 'done', now: NOW })
		expect(next.topics.a).toEqual({ status: 'done', updatedAt: NOW })
		expect(base.topics).toEqual({})
	})

	it('сохраняет отметки подтем при смене статуса', () => {
		const base = progressOf({ a: { status: 'in-progress', subtopics: ['x'], updatedAt: 'old' } })
		expect(withTopicStatus(base, { topicId: 'a', status: 'done', now: NOW }).topics.a).toEqual({
			status: 'done',
			subtopics: ['x'],
			updatedAt: NOW,
		})
	})

	it('то же значение — тот же объект', () => {
		const base = progressOf({ a: { status: 'done' } })
		expect(withTopicStatus(base, { topicId: 'a', status: 'done', now: NOW })).toBe(base)
	})

	it('null сбрасывает статус и подтемы, оставляя метку времени', () => {
		const base = progressOf({ a: { status: 'done', subtopics: ['x'] } })
		expect(withTopicStatus(base, { topicId: 'a', status: null, now: NOW }).topics.a).toEqual({ updatedAt: NOW })
	})

	it('null у темы без прогресса — тот же объект', () => {
		const base = progressOf()
		expect(withTopicStatus(base, { topicId: 'a', status: null, now: NOW })).toBe(base)
	})
})

describe('markedSubtopics', () => {
	const target = topic('a', { subtopics })

	it('у явного done — все подтемы темы', () => {
		expect(markedSubtopics({ status: 'done', subtopics: ['x'] }, target)).toEqual(['x', 'y'])
		expect(markedSubtopics({ status: 'done' }, topic('b'))).toEqual([])
	})

	it('иначе — отмеченные из прогресса; нет записи или массива — пусто', () => {
		expect(markedSubtopics({ status: 'skipped', subtopics: ['y'] }, target)).toEqual(['y'])
		expect(markedSubtopics({ status: 'in-progress' }, target)).toEqual([])
		expect(markedSubtopics(undefined, target)).toEqual([])
	})
})

describe('withSubtopic', () => {
	const target = topic('a', { subtopics: [...subtopics, { id: 'z', title: 'Z' }] })

	it('отмечает подтему и ставит метку', () => {
		const next = withSubtopic(progressOf(), target, { subtopicId: 'x', isDone: true, now: NOW })
		expect(next.topics.a).toEqual({ subtopics: ['x'], updatedAt: NOW })
	})

	it('снимает отметку', () => {
		const base = progressOf({ a: { subtopics: ['x', 'y'] } })
		expect(withSubtopic(base, target, { subtopicId: 'x', isDone: false, now: NOW }).topics.a?.subtopics).toEqual(['y'])
	})

	it('правка подтем снимает явный skipped', () => {
		const base = progressOf({ a: { status: 'skipped', subtopics: ['x'] } })
		const next = withSubtopic(base, target, { subtopicId: 'y', isDone: true, now: NOW })
		expect(next.topics.a).toEqual({ subtopics: ['x', 'y'], updatedAt: NOW })
	})

	it('у явного done снятие подтемы записывает все остальные и сбрасывает done', () => {
		const base = progressOf({ a: { status: 'done', updatedAt: 'old' } })
		const next = withSubtopic(base, target, { subtopicId: 'y', isDone: false, now: NOW })
		expect(next.topics.a).toEqual({ subtopics: ['x', 'z'], updatedAt: NOW })
		expect(next.topics.a?.status).toBeUndefined()
	})

	it('у явного done отметка уже «отмеченной» подтемы — тот же объект', () => {
		const base = progressOf({ a: { status: 'done', subtopics: ['x'] } })
		expect(withSubtopic(base, target, { subtopicId: 'y', isDone: true, now: NOW })).toBe(base)
	})

	it('in-progress при правке подтем остаётся', () => {
		const base = progressOf({ a: { status: 'in-progress' } })
		expect(withSubtopic(base, target, { subtopicId: 'x', isDone: true, now: NOW }).topics.a).toEqual({
			status: 'in-progress',
			subtopics: ['x'],
			updatedAt: NOW,
		})
	})

	it('неизвестная подтема и тема без подтем — тот же объект', () => {
		const base = progressOf()
		expect(withSubtopic(base, target, { subtopicId: 'ghost', isDone: true, now: NOW })).toBe(base)
		expect(withSubtopic(base, topic('b'), { subtopicId: 'x', isDone: true, now: NOW })).toBe(base)
	})

	it('то же значение — тот же объект', () => {
		const marked = progressOf({ a: { subtopics: ['x'] } })
		expect(withSubtopic(marked, target, { subtopicId: 'x', isDone: true, now: NOW })).toBe(marked)
		const empty = progressOf()
		expect(withSubtopic(empty, target, { subtopicId: 'x', isDone: false, now: NOW })).toBe(empty)
	})
})

describe('mergeRoadmapProgress', () => {
	const old = '2026-10-18T09:00:00.000Z'

	it('берёт из хранилища темы, которых нет локально, и более новые', () => {
		const current = progressOf({ a: { status: 'done', updatedAt: old } })
		const stored = progressOf({ a: { status: 'skipped', updatedAt: NOW }, b: { status: 'done', updatedAt: old } })
		const result = mergeRoadmapProgress(current, stored)
		expect(result.fromStored).toEqual(['a', 'b'])
		expect(result.fromLocal).toEqual([])
		expect(result.progress.topics).toEqual(stored.topics)
	})

	it('локальные более новые и отсутствующие в хранилище темы остаются и попадают в fromLocal', () => {
		const current = progressOf({ a: { status: 'done', updatedAt: NOW }, c: { status: 'done', updatedAt: old } })
		const stored = progressOf({ a: { status: 'skipped', updatedAt: old } })
		const result = mergeRoadmapProgress(current, stored)
		expect(result.fromStored).toEqual([])
		expect(result.fromLocal).toEqual(['a', 'c'])
		expect(result.progress.topics).toEqual(current.topics)
	})

	it('равные метки — остаётся текущее, ни там ни там не учитывается', () => {
		const current = progressOf({ a: { status: 'done', updatedAt: NOW } })
		const stored = progressOf({ a: { status: 'skipped', updatedAt: NOW } })
		const result = mergeRoadmapProgress(current, stored)
		expect(result.progress.topics.a?.status).toBe('done')
		expect(result.fromStored).toEqual([])
		expect(result.fromLocal).toEqual([])
	})

	it('без метки или с битой меткой проигрывает любой метке; обе без метки — текущее', () => {
		const current = progressOf({ a: { status: 'done' }, b: { status: 'done', updatedAt: 'не дата' }, c: { status: 'done' } })
		const stored = progressOf({
			a: { status: 'skipped', updatedAt: old },
			b: { status: 'skipped', updatedAt: old },
			c: { status: 'skipped' },
		})
		const result = mergeRoadmapProgress(current, stored)
		expect(result.fromStored).toEqual(['a', 'b'])
		expect(result.progress.topics.c?.status).toBe('done')
	})

	it('версию и порядок текущего прогресса не теряет; исходные объекты не меняет', () => {
		const current = { version: 3, topics: {} }
		const result = mergeRoadmapProgress(current, progressOf({ a: { updatedAt: NOW } }))
		expect(result.progress.version).toBe(3)
		expect(current.topics).toEqual({})
	})
})

describe('normalizeRoadmapProgress', () => {
	it('мусор — null', () => {
		for (const raw of [
			null,
			undefined,
			5,
			'x',
			[],
			{ topics: {} },
			{ version: 'a', topics: {} },
			{ version: 1 },
			{ version: 1, topics: null },
		]) {
			expect(normalizeRoadmapProgress(raw)).toBeNull()
		}
	})

	it('корректный прогресс сохраняется', () => {
		const raw = { version: 1, topics: { a: { status: 'done', subtopics: ['x'], updatedAt: NOW } } }
		expect(normalizeRoadmapProgress(raw)).toEqual(raw)
	})

	it('отбрасывает неизвестные статусы, не-строки в подтемах, чужие поля и не-объекты вместо записей', () => {
		const raw = {
			version: 2,
			topics: {
				a: { status: 'finished', subtopics: ['x', 5, null], updatedAt: 7, extra: 1 },
				b: 'мусор',
				c: null,
				d: {},
			},
		}
		expect(normalizeRoadmapProgress(raw)).toEqual({ version: 2, topics: { a: { subtopics: ['x'] }, d: {} } })
	})
})
