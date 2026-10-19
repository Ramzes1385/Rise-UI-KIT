import { currentLocale } from '@/locales/state'
import { UI_ROADMAP_REVIEW } from '@/locales/messages'
import { editData, stage, topic } from '../edit/fixtures/editFixtures'
import { setProposalStatus, toSuggestion } from '../../model/review/format/roadmapProposals'
import { proposalTitle, roadmapElementName } from '../../model/review/format/roadmapReviewLabels'
import { nextRoadmapReviewId, roadmapThreadsByTarget } from '../../model/review/format/roadmapReviewIds'
import type { RoadmapChange, RoadmapCommentThread, RoadmapProposal } from '../../types/roadmapEdit.types'
import { fieldLabel, formatCount, formatValue, kindLabel, kindStatus, summaryText } from '../../model/review/format/roadmapReviewFormat'

describe('formatCount и summaryText', () => {
	it('форма по числу: один, несколько, много', () => {
		expect(formatCount('{n} тема|{n} темы|{n} тем|{n} тем', 1)).toBe('1 тема')
		expect(formatCount('{n} тема|{n} темы|{n} тем|{n} тем', 3)).toBe('3 темы')
		expect(formatCount('{n} тема|{n} темы|{n} тем|{n} тем', 11)).toBe('11 тем')
	})

	it('если форм меньше, чем категорий, берётся последняя', () => {
		expect(formatCount('{n} шт', 5)).toBe('5 шт')
		expect(formatCount('{n} раз|{n} раза', 7)).toBe('7 раза')
	})

	it('категория, которой нет в таблице (например, «two» в арабском), тоже берёт запасную форму', () => {
		const saved = currentLocale.value
		currentLocale.value = { ...saved, intl: 'ar' }
		try {
			expect(formatCount('{n} раз|{n} раза', 2)).toBe('2 раза')
			expect(formatCount('{n} a|{n} b|{n} c|{n} d', 2)).toBe('2 d')
		} finally {
			currentLocale.value = saved
		}
	})

	it('сводка: знак вида и число сущностей через запятую', () => {
		const text = summaryText([
			{ kind: 'add', entity: 'topic', count: 1 },
			{ kind: 'remove', entity: 'stage', count: 2 },
			{ kind: 'update', entity: 'topic', count: 3 },
			{ kind: 'update', entity: 'unknown' as never, count: 1 },
		])
		expect(text.split(', ')).toHaveLength(4)
		expect(text).toContain('+')
		expect(text).toContain('−')
		expect(text).toContain('~')
	})
})

describe('подписи видов и полей', () => {
	it('вид изменения: подпись и цвет бейджа', () => {
		expect(kindLabel('add')).toBe(UI_ROADMAP_REVIEW.KIND_ADD)
		expect(kindStatus('add')).toBe('success')
		expect(kindStatus('remove')).toBe('error')
		expect(kindStatus('rename')).toBe('warning')
		expect(kindStatus('move')).toBe('info')
		expect(kindStatus('update')).toBe('warning')
		expect(kindStatus('mixed')).toBe('neutral')
		expect(kindLabel('mixed')).toBe(UI_ROADMAP_REVIEW.KIND_MIXED)
	})

	it('поле: известное — подпись словаря, неизвестное — как есть', () => {
		expect(fieldLabel('title')).toBe(UI_ROADMAP_REVIEW.FIELD_TITLE)
		expect(fieldLabel('hours')).toBe(UI_ROADMAP_REVIEW.FIELD_HOURS)
		expect(fieldLabel('tags')).toBe('tags')
	})

	it('значение: пустое — тире, позиция — номер, объект — JSON, остальное — строка', () => {
		expect(formatValue('title', undefined)).toBe('—')
		expect(formatValue('title', null)).toBe('—')
		expect(formatValue('position', 0)).toBe('1')
		expect(formatValue('position', { stage: 's2', index: 1 })).toBe('s2 · 2')
		expect(formatValue('position', { index: 0 })).toBe(' · 1')
		expect(formatValue('position', { stage: 's' })).toBe('{"stage":"s"}')
		expect(formatValue('requires', ['a'])).toBe('["a"]')
		expect(formatValue('hours', 3)).toBe('3')
	})
})

describe('идентификаторы и цепочки', () => {
	it('nextRoadmapReviewId не повторяет занятые', () => {
		expect(nextRoadmapReviewId('p', [])).toBe('p1')
		expect(nextRoadmapReviewId('p', ['p1', 'p2'])).toBe('p3')
		expect(nextRoadmapReviewId('p', ['p2', 'x'])).toBe('p3')
		expect(nextRoadmapReviewId('p', ['p2', 'p3', 'p1'])).toBe('p4')
		expect(nextRoadmapReviewId('p', new Set(['p1']))).toBe('p2')
	})

	it('цепочки группируются по сущности и id', () => {
		const make = (id: string, entity: 'stage' | 'topic', target: string): RoadmapCommentThread => ({
			id,
			target: { entity, id: target },
			comments: [],
		})
		const map = roadmapThreadsByTarget([make('t1', 'topic', 'a'), make('t2', 'topic', 'a'), make('t3', 'stage', 'a')])
		expect([...map.keys()]).toEqual(['topic:a', 'stage:a'])
		expect(map.get('topic:a')?.map(item => item.id)).toEqual(['t1', 't2'])
		expect(roadmapThreadsByTarget([]).size).toBe(0)
	})
})

describe('предложения: статус и формат ядра', () => {
	const proposal = (status: RoadmapProposal['status']): RoadmapProposal => ({
		id: 'p1',
		author: { name: 'Анна' },
		date: 1,
		changes: [],
		status,
	})

	it('rejected превращается в declined, остальные статусы не меняются', () => {
		expect(toSuggestion(proposal('rejected')).status).toBe('declined')
		expect(toSuggestion(proposal('open')).status).toBe('open')
		expect(toSuggestion(proposal('accepted')).status).toBe('accepted')
	})

	it('setProposalStatus меняет только нужное предложение', () => {
		const list = [proposal('open'), { ...proposal('open'), id: 'p2' }]
		const next = setProposalStatus(list, 'p2', 'accepted')
		expect(next.map(item => item.status)).toEqual(['open', 'accepted'])
		expect(next[0]).toBe(list[0])
	})
})

describe('названия в предложениях', () => {
	const data = editData()

	it('roadmapElementName: этап, тема, тема под видом этапа и неизвестное', () => {
		expect(roadmapElementName(data, 'stage', 's2')).toBe('Этап s2')
		expect(roadmapElementName(data, 'topic', 'e')).toBe('Тема e')
		expect(roadmapElementName(data, 'topic', 's2')).toBe('s2')
		expect(roadmapElementName(data, 'stage', 'ghost')).toBe('ghost')
	})

	it('proposalTitle: без изменений, одно изменение и несколько', () => {
		const add: RoadmapChange = { type: 'add', entity: 'topic', stage: 's1', value: topic('n', { title: 'Новая' }), index: 0 }
		const rename: RoadmapChange = { type: 'update', entity: 'topic', id: 'a', patch: { title: 'X' }, previous: { title: 'Тема a' } }
		const root: RoadmapChange = { type: 'root', patch: {}, previous: {} }
		expect(proposalTitle([], data)).toBe(UI_ROADMAP_REVIEW.PROPOSAL_UNTITLED)
		expect(proposalTitle([root], data)).toBe(UI_ROADMAP_REVIEW.PROPOSAL_UNTITLED)
		expect(proposalTitle([add], data)).toContain('Новая')
		expect(proposalTitle([rename], data)).toContain('Тема a')
		expect(proposalTitle([add, rename, { type: 'add', entity: 'stage', value: stage('z', []), index: 0 }], data)).toContain('2')
	})
})
