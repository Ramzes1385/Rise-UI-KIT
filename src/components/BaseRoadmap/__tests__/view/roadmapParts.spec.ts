import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import RoadmapLegend from '../../ui/parts/RoadmapLegend.vue'
import RoadmapSummary from '../../ui/parts/RoadmapSummary.vue'
import { stageView, topicView } from '../fixtures/shellFixtures'
import { fireEvent, render, screen } from '@testing-library/vue'
import RoadmapMaterials from '../../ui/parts/RoadmapMaterials.vue'
import RoadmapTopicChip from '../../ui/parts/RoadmapTopicChip.vue'
import RoadmapStatusIcon from '../../ui/parts/RoadmapStatusIcon.vue'
import RoadmapStageHeader from '../../ui/parts/RoadmapStageHeader.vue'
import type { RoadmapSummaryView } from '../../types/internal/roadmapView.types'

const ui = (part: string): string => `base-roadmap__${part}`

const SUMMARY: RoadmapSummaryView = { done: 2, total: 5, percent: 40, hoursLeft: 7.4, continueId: 'a', continueTitle: 'CSS' }

describe('RoadmapStatusIcon', () => {
	it('закрытая тема — замок без кольца', () => {
		const { container } = render(RoadmapStatusIcon, { props: { status: 'locked' } })
		expect(container.querySelector('.base-roadmap__status-lock')).not.toBeNull()
		expect(container.querySelector('.base-roadmap__status-fill')).toBeNull()
		expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
	})

	it('остальные статусы — кольцо с долей, по умолчанию пустое', () => {
		const first = render(RoadmapStatusIcon, { props: { status: 'in-progress', fraction: 0.4 } })
		expect((first.container.querySelector('.base-roadmap__status-fill') as SVGElement).style.strokeDasharray).toBe('0.4 1')
		expect(first.container.querySelector('svg')).toHaveClass('base-roadmap__status-icon--in-progress')
		const second = render(RoadmapStatusIcon, { props: { status: 'available' } })
		expect((second.container.querySelector('.base-roadmap__status-fill') as SVGElement).style.strokeDasharray).toBe('0 1')
	})
})

describe('RoadmapLegend', () => {
	it('перечисляет статусы, «по желанию» и альтернативу', () => {
		render(RoadmapLegend, { props: { ui } })
		const items = screen.getAllByRole('listitem').map(item => item.textContent?.trim())
		expect(items).toEqual(['Изучена', 'В процессе', 'Доступна', 'Закрыта', 'По желанию', 'или Альтернатива'])
		expect(screen.getByRole('list', { name: 'Обозначения' })).toHaveClass('base-roadmap__status')
	})
})

describe('RoadmapTopicChip', () => {
	it('название, подпись часов и скрытый статус в имени кнопки', () => {
		render(RoadmapTopicChip, { props: { view: topicView({ title: 'HTML', topic: { hours: 4 } }), ui } })
		expect(screen.getByRole('button', { name: /^HTML.*4 ч.*доступна/ })).toHaveAttribute('aria-pressed', 'false')
	})

	it('метки «или» и «советуем», классы вида', () => {
		const { container } = render(RoadmapTopicChip, {
			props: { view: topicView({ isAlternative: true, topic: { isRecommended: true, kind: 'optional' } }), ui },
		})
		expect(screen.getByText('или')).toBeInTheDocument()
		expect(screen.getByText('советуем')).toBeInTheDocument()
		expect(container.firstElementChild).toHaveClass('base-roadmap__topic--alternative', 'base-roadmap__topic--optional')
	})

	it('выбранная, приглушённая и занятая тема отмечены', () => {
		const view = { ...topicView({ isSelected: true }), isFiltered: true }
		const { container } = render(RoadmapTopicChip, { props: { view, ui, isBusy: true } })
		expect(container.firstElementChild).toHaveClass('base-roadmap__topic--selected', 'base-roadmap__topic--filtered')
		expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true')
		expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
	})

	it('закрытая тема называет, что нужно знать', () => {
		render(RoadmapTopicChip, { props: { view: topicView({ status: 'locked' }), ui, missing: ['HTML'] } })
		expect(screen.getByRole('button')).toHaveAccessibleName(/закрыта: нужно знать HTML/)
	})

	it('нажатие на название сообщает select, мышью по значку — toggle, пальцем — select', async () => {
		const user = userEvent.setup()
		const { emitted, container } = render(RoadmapTopicChip, { props: { view: topicView({ id: 'x' }), ui } })
		await user.click(screen.getByRole('button'))
		const icon = container.querySelector('.base-roadmap__topic-icon') as HTMLElement
		await user.click(icon)
		await fireEvent(icon, new PointerEvent('click', { pointerType: 'touch', bubbles: true }))
		await fireEvent(icon, new PointerEvent('click', { pointerType: 'mouse', bubbles: true }))
		expect(emitted().select).toEqual([['x'], ['x']])
		expect(emitted().toggle).toEqual([['x'], ['x']])
	})

	it('без PointerEvent значок всегда переключает', async () => {
		vi.stubGlobal('PointerEvent', undefined)
		const { emitted, container } = render(RoadmapTopicChip, { props: { view: topicView({ id: 'x' }), ui } })
		await fireEvent.click(container.querySelector('.base-roadmap__topic-icon') as HTMLElement)
		vi.unstubAllGlobals()
		expect(emitted().toggle).toEqual([['x']])
	})

	it('слот по умолчанию заменяет содержимое', () => {
		render(RoadmapTopicChip, {
			props: { view: topicView({ title: 'T' }), ui },
			slots: { default: ({ topic }: { topic: { title: string } }) => h('i', `Свой ${topic.title}`) },
		})
		expect(screen.getByText('Свой T')).toBeInTheDocument()
	})
})

describe('RoadmapStageHeader', () => {
	it('раскрытый этап: aria-expanded и aria-controls, нажатие сообщает id', async () => {
		const user = userEvent.setup()
		const { emitted } = render(RoadmapStageHeader, {
			props: { view: stageView({ id: 's9', isExpanded: true, status: 'current' }), ui },
		})
		const button = screen.getByRole('button')
		expect(button).toHaveAttribute('aria-expanded', 'true')
		expect(button).toHaveAttribute('aria-controls', 's9-panel')
		expect(screen.getByText('Вы здесь')).toBeInTheDocument()
		await user.click(button)
		expect(emitted().toggle).toEqual([['s9']])
	})

	it('свёрнутый этап: aria-controls нет', () => {
		render(RoadmapStageHeader, { props: { view: stageView(), ui } })
		expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
		expect(screen.getByRole('button')).not.toHaveAttribute('aria-controls')
	})

	it('статичный этап не раскрывается и не показывает стрелку', async () => {
		const user = userEvent.setup()
		const { emitted, container } = render(RoadmapStageHeader, {
			props: { view: stageView({ status: 'locked' }), ui, isStatic: true, unlockTitle: 'CSS' },
		})
		await user.click(screen.getByRole('button'))
		expect(emitted().toggle).toBeUndefined()
		expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByRole('button')).not.toHaveAttribute('aria-expanded')
		expect(container.querySelector('.base-roadmap__chevron')).toBeNull()
		expect(screen.getByText('Откроется после «CSS»')).toBeInTheDocument()
	})

	it('доля заполнения кольца — выполненные темы этапа', () => {
		const view = stageView({ done: 1, topics: [topicView({ id: 'a' }), topicView({ id: 'b' })] })
		const { container } = render(RoadmapStageHeader, { props: { view: { ...view, done: 1 }, ui } })
		expect((container.querySelector('.base-roadmap__stage-fill') as SVGElement).style.strokeDasharray).toBe('0.5 1')
	})

	it('этап без тем — пустое кольцо', () => {
		const { container } = render(RoadmapStageHeader, { props: { view: stageView({ topics: [] }), ui } })
		expect((container.querySelector('.base-roadmap__stage-fill') as SVGElement).style.strokeDasharray).toBe('0 1')
	})

	it('слот заменяет содержимое кнопки', () => {
		render(RoadmapStageHeader, {
			props: { view: stageView({ title: 'Этап' }), ui },
			slots: { default: ({ stage }: { stage: { title: string } }) => h('b', `Свой ${stage.title}`) },
		})
		expect(screen.getByRole('button', { name: 'Свой Этап' })).toBeInTheDocument()
	})
})

describe('RoadmapSummary', () => {
	it('широкий вид: подпись, остаток часов и кнопка «Продолжить»', async () => {
		const user = userEvent.setup()
		const { emitted } = render(RoadmapSummary, { props: { summary: SUMMARY, ui } })
		expect(screen.getByText('2 из 5 тем')).toBeInTheDocument()
		expect(screen.getByText('осталось ≈ 7 ч')).toBeInTheDocument()
		expect(screen.getByRole('progressbar', { name: 'Прогресс пути' })).toHaveAttribute('aria-valuenow', '40')
		await user.click(screen.getByRole('button', { name: 'Продолжить: CSS' }))
		expect(emitted().continue).toHaveLength(1)
	})

	it('без остатка часов и продолжения лишнего нет', () => {
		render(RoadmapSummary, { props: { summary: { ...SUMMARY, hoursLeft: 0, continueId: null, continueTitle: null }, ui } })
		expect(screen.queryByText(/осталось/)).not.toBeInTheDocument()
		expect(screen.queryByRole('button')).not.toBeInTheDocument()
	})

	it('узкий вид: процент и текст в одной строке, кнопки нет', () => {
		const { container } = render(RoadmapSummary, { props: { summary: SUMMARY, ui, isNarrow: true } })
		expect(container.firstElementChild).toHaveClass('base-roadmap__summary--narrow')
		expect(screen.getByText('40 %')).toBeInTheDocument()
		expect(screen.getByText('2 из 5 тем · осталось ≈ 7 ч')).toBeInTheDocument()
		expect(screen.queryByRole('button')).not.toBeInTheDocument()
	})

	it('узкий вид без часов не рисует разделитель', () => {
		render(RoadmapSummary, { props: { summary: { ...SUMMARY, hoursLeft: 0 }, ui, isNarrow: true } })
		expect(screen.getByText('2 из 5 тем')).toBeInTheDocument()
	})

	it('слот summary-end дописывается в конец', () => {
		render(RoadmapSummary, { props: { summary: SUMMARY, ui }, slots: { 'summary-end': () => h('span', 'Конец') } })
		expect(screen.getByText('Конец')).toBeInTheDocument()
	})
})

describe('RoadmapMaterials', () => {
	const materials = [
		{ id: 'a', title: 'Внешний', kind: 'doc', url: 'https://example.org/x' },
		{ title: 'Без ссылки', kind: 'book', minutes: 20 },
		{ title: 'Внутренний', kind: 'practice', url: '/page' },
	] as const

	it('ссылка, текст без ссылки и подписи видов', () => {
		render(RoadmapMaterials, { props: { materials: [...materials], ui } })
		expect(screen.getAllByRole('listitem')).toHaveLength(3)
		expect(screen.getByRole('link', { name: /Внешний/ })).toHaveAttribute('target', '_blank')
		expect(screen.getByRole('link', { name: /Внутренний/ })).not.toHaveAttribute('target')
		expect(screen.queryByRole('link', { name: /Без ссылки/ })).not.toBeInTheDocument()
		expect(screen.getByText('Книга · 20 мин')).toBeInTheDocument()
		expect(screen.getByText('Документация')).toBeInTheDocument()
	})

	it('слот material получает материал', () => {
		render(RoadmapMaterials, {
			props: { materials: [...materials], ui },
			slots: { material: ({ material }: { material: { title: string } }) => h('em', `М ${material.title}`) },
		})
		expect(screen.getByText('М Внешний')).toBeInTheDocument()
		expect(screen.queryByRole('link')).not.toBeInTheDocument()
	})
})
