import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, within } from '@testing-library/vue'
import { LAYOUT_CASES, layoutProps, sampleStages } from './layoutCases'
import { manyStages, stageView, topicView } from '../fixtures/viewFixtures'

describe.each(LAYOUT_CASES)('$name', ({ component, kind }) => {
	function renderLayout(extra: { goal?: string; progress?: number; slots?: Record<string, unknown> } = {}) {
		const { slots, ...rest } = extra
		const user = userEvent.setup()
		const view = render(component, { props: layoutProps(sampleStages(), rest), slots } as never)
		return { user, ...view }
	}

	it('холст помечен видом раскладки и несёт размеры в переменных', () => {
		const { container } = renderLayout()
		const canvas = container.querySelector('.base-roadmap__canvas') as HTMLElement
		expect(canvas).toHaveClass(`base-roadmap__canvas--${kind}`)
		expect(canvas.style.getPropertyValue('--rl-width')).not.toBe('')
		expect(canvas.style.getPropertyValue('--rl-height')).not.toBe('')
	})

	it('этапы — нумерованный список, у каждого заголовок h3 с кнопкой', () => {
		const { container } = renderLayout()
		const stages = container.querySelector('ol.base-roadmap__stages') as HTMLElement
		expect(within(stages).getAllByRole('heading', { level: 3 })).toHaveLength(3)
		expect(stages.querySelectorAll(':scope > li')).toHaveLength(3)
		expect(screen.getByRole('button', { name: /^Этап 1,\s*Основы/ })).toBeInTheDocument()
	})

	it('панель тем и aria-controls есть только у раскрытого этапа', () => {
		renderLayout()
		const basics = screen.getByRole('button', { name: /^Этап 1,\s*Основы/ })
		const frameworks = screen.getByRole('button', { name: /^Этап 2,\s*Фреймворки/ })
		expect(basics).toHaveAttribute('aria-expanded', 'true')
		expect(basics).toHaveAttribute('aria-controls', 'basics-panel')
		expect(frameworks).toHaveAttribute('aria-expanded', 'false')
		expect(frameworks).not.toHaveAttribute('aria-controls')
		const panel = document.getElementById('basics-panel') as HTMLElement
		expect(panel.tagName).toBe('UL')
		expect(panel).toHaveAttribute('aria-labelledby', 'basics-heading')
		expect(document.getElementById('frameworks-panel')).toBeNull()
		expect(screen.queryByRole('button', { name: /Vue/ })).not.toBeInTheDocument()
	})

	it('панель названа заголовком этапа, темы — кнопки внутри списка', () => {
		renderLayout()
		const list = screen.getByRole('list', { name: /^Этап 1,\s*Основы/ })
		expect(within(list).getAllByRole('listitem')).toHaveLength(2)
		expect(within(list).getByRole('button', { name: /HTML/ })).toBeInTheDocument()
		expect(within(list).getByRole('button', { name: /CSS/ })).toBeInTheDocument()
	})

	it('раскрытый этап без тем даёт пустую панель без веток', () => {
		const { container } = renderLayout()
		const panel = document.getElementById('empty-panel') as HTMLElement
		expect(panel.children).toHaveLength(0)
		expect(container.querySelectorAll('.base-roadmap__branches')).toHaveLength(1)
	})

	it('рисунок хребта, ветки, бегущая точка и метка «Старт» скрыты от скринридера', () => {
		const { container } = renderLayout()
		expect(container.querySelector('.base-roadmap__lines')).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelector('.base-roadmap__branches')).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelector('.base-roadmap__runner-layer')).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelector('.base-roadmap__mark--start')).toHaveAttribute('aria-hidden', 'true')
		container.querySelectorAll('svg').forEach(svg => {
			expect(svg.closest('[aria-hidden="true"]')).not.toBeNull()
		})
	})

	it('цель — текст в DOM для скринридера, флажок скрыт', () => {
		const { container } = renderLayout({ goal: 'Frontend-разработчик' })
		const mark = container.querySelector('.base-roadmap__mark--goal') as HTMLElement
		expect(mark).not.toHaveAttribute('aria-hidden')
		expect(within(mark).getByText('Frontend-разработчик')).toBeInTheDocument()
		expect(mark.querySelector('.base-roadmap__goal-flag')).toHaveAttribute('aria-hidden', 'true')
	})

	it('без цели вся метка скрыта и текста нет', () => {
		const { container } = renderLayout()
		const mark = container.querySelector('.base-roadmap__mark--goal') as HTMLElement
		expect(mark).toHaveAttribute('aria-hidden', 'true')
		expect(mark.querySelector('.base-roadmap__goal-text')).toBeNull()
	})

	it('клик по кнопке этапа отдаёт toggle-stage с id этапа', async () => {
		const { user, emitted } = renderLayout()
		await user.click(screen.getByRole('button', { name: /^Этап 1,\s*Основы/ }))
		await user.click(screen.getByRole('button', { name: /^Этап 2,\s*Фреймворки/ }))
		expect(emitted()['toggle-stage']).toEqual([['basics'], ['frameworks']])
	})

	it('клик по теме отдаёт select-topic, клик по значку — toggle-topic', async () => {
		const { user, emitted, container } = renderLayout()
		await user.click(screen.getByRole('button', { name: /CSS/ }))
		expect(emitted()['select-topic']).toEqual([['css']])
		await user.click(container.querySelector('[data-topic-id="html"] .base-roadmap__topic-icon') as HTMLElement)
		expect(emitted()['toggle-topic']).toEqual([['html']])
	})

	it('слот topic подменяет содержимое карточки темы', () => {
		renderLayout({ slots: { topic: (props: { topic: { title: string } }) => h('b', `слот ${props.topic.title}`) } })
		expect(screen.getByText('слот HTML')).toBeInTheDocument()
		expect(screen.getByText('слот CSS')).toBeInTheDocument()
	})

	it('слот stage-header подменяет содержимое кнопки этапа', () => {
		renderLayout({
			slots: {
				'stage-header': (props: { stage: { title: string }; status: string }) =>
					h('i', `шапка ${props.stage.title} ${props.status}`),
			},
		})
		expect(screen.getByText('шапка Основы current')).toBeInTheDocument()
		expect(screen.getByText('шапка Пустой available')).toBeInTheDocument()
	})

	it('выбранная тема рисует связь «нужно знать» с требованием', () => {
		const stages = sampleStages()
		stages[0] = { ...stages[0], topics: [stages[0].topics[0], { ...stages[0].topics[1], isSelected: true }] }
		const { container } = render(component, { props: layoutProps(stages) })
		expect(container.querySelectorAll('.base-roadmap__link')).toHaveLength(1)
	})

	it('без выбранной темы связей нет', () => {
		const { container } = renderLayout()
		expect(container.querySelectorAll('.base-roadmap__link')).toHaveLength(0)
	})

	it('доля пройденного пути идёт в штрих сплошной части хребта', () => {
		const { container } = renderLayout({ progress: 1 })
		const done = container.querySelector('.base-roadmap__spine-done') as SVGElement
		expect(done.style.strokeDasharray).toBe('1 1')
		const none = render(component, { props: layoutProps(sampleStages(), { progress: 0 }) }).container.querySelector(
			'.base-roadmap__spine-done',
		) as SVGElement
		expect(Number.parseFloat(none.style.strokeDasharray)).toBeLessThan(0.5)
	})

	it('длинные названия остаются целиком в DOM для скринридера', () => {
		const title = 'Очень длинное название этапа, которое не помещается в карточку и обрезается многоточием при показе'
		const topic = 'Очень длинное название темы про оптимизацию рендеринга больших списков и виртуализацию'
		const stages = [stageView({ id: 'long', title, index: 0, isExpanded: true, topics: [topicView({ id: 'lt', title: topic })] })]
		render(component, { props: layoutProps(stages) })
		expect(screen.getByRole('button', { name: new RegExp(title) })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: new RegExp(topic) })).toBeInTheDocument()
	})

	it('24 этапа по 7 тем в раскрытом виде рисуются без ошибок', () => {
		const stages = manyStages({ count: 24, topics: 7, expanded: Array.from({ length: 24 }, (_, index) => index) })
		const { container } = render(component, { props: layoutProps(stages) })
		expect(container.querySelectorAll('ol.base-roadmap__stages > li')).toHaveLength(24)
		expect(container.querySelectorAll('.base-roadmap__branch-item')).toHaveLength(168)
	})

	it('один этап и этап без тем: список из одного пункта', () => {
		const stages = [stageView({ id: 'one', title: 'Один', index: 0, topics: [] })]
		const { container } = render(component, { props: layoutProps(stages) })
		expect(container.querySelectorAll('ol.base-roadmap__stages > li')).toHaveLength(1)
		expect(document.getElementById('one-panel')).toBeNull()
	})

	it('ничего не пишет в консоль', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		renderLayout({ goal: 'Цель' })
		expect(warn).not.toHaveBeenCalled()
		expect(error).not.toHaveBeenCalled()
		warn.mockRestore()
		error.mockRestore()
	})
})
