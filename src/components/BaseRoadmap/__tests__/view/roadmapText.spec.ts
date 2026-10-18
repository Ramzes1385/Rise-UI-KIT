import { stageView, topicView } from '../fixtures/shellFixtures'
import {
	formatHours,
	formatMinutes,
	liveText,
	ringFraction,
	stageMetaText,
	stageStatusText,
	subtitleText,
	subtopicsText,
	summaryDoneText,
	topicKindText,
	topicMetaText,
	topicSrText,
	topicStatusText,
} from '../../model/view/format/roadmapText'

describe('roadmapText', () => {
	it('часы округляются до десятых и пишутся в формате языка', () => {
		expect(formatHours(4)).toBe('4 ч')
		expect(formatHours(1.26)).toBe('1,3 ч')
	})

	it('минуты: меньше часа — минуты, иначе часы', () => {
		expect(formatMinutes(45)).toBe('45 мин')
		expect(formatMinutes(90)).toBe('1,5 ч')
	})

	it.each([
		{ status: 'done', text: 'Изучена' },
		{ status: 'in-progress', text: 'В процессе' },
		{ status: 'available', text: 'Доступна' },
		{ status: 'locked', text: 'Закрыта' },
		{ status: 'skipped', text: 'Пропущена' },
	] as const)('статус $status называется «$text»', ({ status, text }) => {
		expect(topicStatusText(status)).toBe(text)
	})

	it('сводка и подтемы склоняют слово по числу', () => {
		expect(summaryDoneText(1, 1)).toBe('1 из 1 темы')
		expect(summaryDoneText(2, 5)).toBe('2 из 5 тем')
		expect(subtopicsText(1, 2)).toBe('1 из 2 подтем')
	})

	it.each([
		{ status: 'done', text: 'HTML изучена · 1 из 3 тем' },
		{ status: 'in-progress', text: 'HTML: в процессе · 1 из 3 тем' },
		{ status: 'skipped', text: 'HTML пропущена · 1 из 3 тем' },
		{ status: 'available', text: 'HTML: отметка снята · 1 из 3 тем' },
		{ status: 'locked', text: 'HTML: отметка снята · 1 из 3 тем' },
		{ status: 'reset', text: 'HTML: отметка снята · 1 из 3 тем' },
	] as const)('объявление для $status', ({ status, text }) => {
		expect(liveText(status, 'HTML', { done: 1, total: 3 })).toBe(text)
	})

	describe('topicMetaText', () => {
		it('в процессе с подтемами — доля подтем', () => {
			expect(topicMetaText(topicView({ status: 'in-progress', done: 1, total: 4 }))).toBe('1 из 4')
		})

		it('иначе — часы темы, а без часов пусто', () => {
			expect(topicMetaText(topicView({ topic: { hours: 3 } }))).toBe('3 ч')
			expect(topicMetaText(topicView({ status: 'in-progress', topic: { hours: 2 } }))).toBe('2 ч')
			expect(topicMetaText(topicView())).toBe('')
		})
	})

	it('вид темы: альтернатива, по желанию, обязательная', () => {
		expect(topicKindText({ id: 'a', title: 'A' }, true)).toBe('Альтернатива')
		expect(topicKindText({ id: 'a', title: 'A', kind: 'optional' }, false)).toBe('По желанию')
		expect(topicKindText({ id: 'a', title: 'A' }, false)).toBe('Обязательная')
	})

	describe('topicSrText', () => {
		it('закрытая тема называет, что нужно знать', () => {
			expect(topicSrText(topicView({ status: 'locked' }), ['HTML', 'CSS'])).toBe('закрыта: нужно знать HTML, CSS')
		})

		it('закрытая тема без названий — просто статус', () => {
			expect(topicSrText(topicView({ status: 'locked' }), [])).toBe('закрыта')
		})

		it('в процессе добавляет подтемы, альтернатива и «советуем» — свои слова', () => {
			const view = topicView({ status: 'in-progress', done: 1, total: 2, isAlternative: true, topic: { isRecommended: true } })
			expect(topicSrText(view, [])).toBe('в процессе, 1 из 2 подтем, альтернатива, советуем')
		})

		it('тема по желанию помечена', () => {
			expect(topicSrText(topicView({ topic: { kind: 'optional' } }), [])).toBe('доступна, по желанию')
		})
	})

	describe('stageMetaText', () => {
		it('закрытый этап с подсказкой говорит, после чего откроется', () => {
			expect(stageMetaText(stageView({ status: 'locked', hours: 5 }), 'CSS')).toBe('Откроется после «CSS»')
		})

		it('закрытый без подсказки и текущий — прогресс и часы', () => {
			expect(stageMetaText(stageView({ status: 'locked', hours: 5 }))).toBe('0 из 1 темы · 5 ч')
			expect(stageMetaText(stageView({ status: 'current', hours: 2, done: 1 }))).toBe('1 из 1 темы · 2 ч')
		})

		it('пройденный — число тем и часы', () => {
			expect(stageMetaText(stageView({ status: 'done', hours: 2 }))).toBe('1 тема · 2 ч')
		})
	})

	it('статус этапа для скринридера: у доступного пусто', () => {
		expect(stageStatusText('done')).toBe('пройден')
		expect(stageStatusText('current')).toBe('текущий')
		expect(stageStatusText('available')).toBe('')
		expect(stageStatusText('locked')).toBe('закрыт')
	})

	it('подзаголовок: описание или число этапов и тем', () => {
		expect(subtitleText('Свой текст', 2, 5)).toBe('Свой текст')
		expect(subtitleText(undefined, 1, 5)).toBe('1 этап · 5 тем')
		expect(subtitleText('', 2, 1)).toBe('2 этапа · 1 тема')
	})

	it('доля кольца: done — полная, in-progress — своя или половина, остальное — пусто', () => {
		expect(ringFraction('done', 0)).toBe(1)
		expect(ringFraction('in-progress', 0.3)).toBe(0.3)
		expect(ringFraction('in-progress', 0)).toBe(0.5)
		expect(ringFraction('available', 0.9)).toBe(0)
		expect(ringFraction('locked', 0)).toBe(0)
	})
})
