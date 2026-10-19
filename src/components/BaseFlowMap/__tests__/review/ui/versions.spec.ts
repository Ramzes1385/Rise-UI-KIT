import '@testing-library/jest-dom/vitest'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import { screen, within } from '@testing-library/vue'
import { BORIS, reviewData } from '../fixtures/reviewHarness'
import { mountReview, stubFrame } from '../fixtures/reviewUi'
import type { FlowVersion } from '../../../types/data/flowReview.types'

const withDelta = () => reviewData({ nodes: [...reviewData().nodes, { id: 'd', kind: 'service', label: 'Delta' }] })

const versions = (): FlowVersion[] => [
	{ id: 'v1', label: 'v1 · черновик', date: 1000, data: reviewData() },
	{ id: 'v2', label: 'v2 · согласовано', date: 2000, author: BORIS, data: withDelta() },
]

async function openVersions(user: ReturnType<typeof userEvent.setup>) {
	await user.click(screen.getByRole('tab', { name: new RegExp(UI_FLOW_REVIEW.TAB_VERSIONS) }))
}

beforeEach(() => stubFrame(1200))

describe('вкладка «Версии»', () => {
	it('без версий — пустое состояние', async () => {
		const user = userEvent.setup()
		mountReview()
		await openVersions(user)
		expect(screen.getByText(UI_FLOW_REVIEW.EMPTY_VERSIONS)).toBeInTheDocument()
	})

	it('список: новые сверху, у текущей значок «текущая» и нет кнопки, у остальных — «Сравнить с текущей»', async () => {
		const user = userEvent.setup()
		mountReview({ versions: versions(), data: withDelta() })
		await openVersions(user)
		const cards = document.querySelectorAll('.base-flow-map__review-card')
		expect(cards).toHaveLength(2)
		expect(within(cards[0] as HTMLElement).getByText('v2 · согласовано')).toBeInTheDocument()
		expect(within(cards[0] as HTMLElement).getByText(UI_FLOW_REVIEW.CURRENT)).toBeInTheDocument()
		expect(within(cards[0] as HTMLElement).queryByRole('button')).toBeNull()
		expect(within(cards[0] as HTMLElement).getByText('Б')).toBeInTheDocument()
		expect(within(cards[1] as HTMLElement).getByText('v1 · черновик')).toBeInTheDocument()
		expect(cards[1].querySelector('.base-avatar')).toBeNull()
		expect(within(cards[1] as HTMLElement).getByRole('button', { name: UI_FLOW_REVIEW.COMPARE_WITH_CURRENT })).toHaveAttribute(
			'aria-pressed',
			'false',
		)
		expect(within(cards[1] as HTMLElement).getByText(/узел/)).toBeInTheDocument()
	})

	it('сравнение: полоса «Сравнение» со слоями и сводкой, кнопка нажата, метка «+» на холсте', async () => {
		const user = userEvent.setup()
		mountReview({ versions: versions(), data: withDelta() })
		await openVersions(user)
		expect(screen.queryByRole('group', { name: UI_FLOW_REVIEW.COMPARE })).toBeNull()
		await user.click(screen.getByRole('button', { name: UI_FLOW_REVIEW.COMPARE_WITH_CURRENT }))
		const bar = screen.getByRole('group', { name: UI_FLOW_REVIEW.COMPARE })
		expect(within(bar).getByRole('radiogroup', { name: UI_FLOW_REVIEW.COMPARE_LAYER })).toBeInTheDocument()
		expect(
			within(bar)
				.getAllByRole('radio')
				.map(item => item.getAttribute('aria-label') ?? item.parentElement?.textContent?.trim()),
		).toHaveLength(3)
		expect(within(bar).getByText(/^\+1 узел/)).toBeInTheDocument()
		const pressed = screen.getByRole('button', { name: UI_FLOW_REVIEW.COMPARING })
		expect(pressed).toHaveAttribute('aria-pressed', 'true')
		expect(document.querySelector('.base-flow-map__review-layer')).toHaveAttribute('data-side', 'diff')
		expect(document.querySelector('.base-flow-map__review-mark--add')).not.toBeNull()
	})

	it('слои: «Было» показывает только убранное, «Стало» ничего; «Разница» возвращает всё', async () => {
		const user = userEvent.setup()
		mountReview({ versions: versions(), data: withDelta() })
		await openVersions(user)
		await user.click(screen.getByRole('button', { name: UI_FLOW_REVIEW.COMPARE_WITH_CURRENT }))
		const bar = screen.getByRole('group', { name: UI_FLOW_REVIEW.COMPARE })
		const radios = within(bar).getAllByRole('radio')
		await user.click(radios[0])
		expect(document.querySelector('.base-flow-map__review-layer')).toHaveAttribute('data-side', 'old')
		expect(document.querySelectorAll('.base-flow-map__review-mark')).toHaveLength(0)
		await user.click(radios[1])
		expect(document.querySelector('.base-flow-map__review-layer')).toHaveAttribute('data-side', 'new')
		expect(document.querySelectorAll('.base-flow-map__review-mark')).toHaveLength(0)
		await user.click(radios[2])
		expect(document.querySelector('.base-flow-map__review-mark--add')).not.toBeNull()
	})

	it('слой «Было» рисует убранные между версиями узлы призраками', async () => {
		const user = userEvent.setup()
		mountReview({ versions: [versions()[1], { ...versions()[0], id: 'v3', date: 3000, data: reviewData() }], data: reviewData() })
		await openVersions(user)
		await user.click(screen.getByRole('button', { name: UI_FLOW_REVIEW.COMPARE_WITH_CURRENT }))
		const bar = screen.getByRole('group', { name: UI_FLOW_REVIEW.COMPARE })
		await user.click(within(bar).getAllByRole('radio')[0])
		expect(document.querySelector('.base-flow-map__review-mark--remove')).not.toBeNull()
	})

	it('«Сравнивается» повторным нажатием выключает сравнение; крестик в полосе — тоже', async () => {
		const user = userEvent.setup()
		mountReview({ versions: versions(), data: withDelta() })
		await openVersions(user)
		await user.click(screen.getByRole('button', { name: UI_FLOW_REVIEW.COMPARE_WITH_CURRENT }))
		await user.click(screen.getByRole('button', { name: UI_FLOW_REVIEW.COMPARING }))
		expect(screen.queryByRole('group', { name: UI_FLOW_REVIEW.COMPARE })).toBeNull()
		await user.click(screen.getByRole('button', { name: UI_FLOW_REVIEW.COMPARE_WITH_CURRENT }))
		await user.click(screen.getByRole('button', { name: UI_FLOW_REVIEW.COMPARE_CLOSE }))
		expect(screen.queryByRole('group', { name: UI_FLOW_REVIEW.COMPARE })).toBeNull()
		expect(document.querySelector('.base-flow-map__review-layer')).not.toHaveAttribute('data-side')
	})

	it('версии без отличий: полоса есть, сводки нет', () => {
		const same = reviewData({ edges: reviewData().edges.map(edge => ({ ...edge, kind: 'call' })) })
		const list: FlowVersion[] = [
			{ id: 'v1', label: 'v1', date: 1000, data: same },
			{ id: 'v2', label: 'v2', date: 2000, data: same },
		]
		mountReview({ versions: list, data: same, compareWith: 'v1' })
		const bar = screen.getByRole('group', { name: UI_FLOW_REVIEW.COMPARE })
		expect(bar.querySelector('.base-flow-map__review-summary')).toBeNull()
	})

	it('compareWith из props открывает сравнение сразу, нужная версия отмечена в списке', async () => {
		const user = userEvent.setup()
		mountReview({ versions: versions(), data: withDelta(), compareWith: 'v1' })
		expect(screen.getByRole('group', { name: UI_FLOW_REVIEW.COMPARE })).toBeInTheDocument()
		await openVersions(user)
		expect(screen.getByRole('button', { name: UI_FLOW_REVIEW.COMPARING })).toHaveAttribute('aria-pressed', 'true')
	})
})
