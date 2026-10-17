import '@testing-library/jest-dom/vitest'
import { UI_FLOW_PANELS } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import FlowLegend from '../../ui/panels/FlowLegend.vue'
import { render, screen, within } from '@testing-library/vue'
import { createFakeContext, provideContext } from '../fixtures/panelsContext'

function mount(options: Parameters<typeof createFakeContext>[0] = {}) {
	const fake = createFakeContext(options)
	const view = render(FlowLegend, { global: provideContext(fake.context) })
	return { ...fake, ...view }
}

function legend(): HTMLElement {
	return screen.getByRole('group', { name: UI_FLOW_PANELS.LEGEND })
}

describe('FlowLegend', () => {
	it('показывает виды узлов, виды связей и статусы карты списком с подписями', () => {
		mount()
		const labels = within(legend())
			.getAllByRole('listitem')
			.map(item => item.textContent?.trim())
		expect(labels).toEqual([
			'Сервис',
			'База',
			'Партнёр',
			'Вызов',
			'Событие',
			UI_FLOW_PANELS.STATUS_OK,
			UI_FLOW_PANELS.STATUS_ERROR,
			UI_FLOW_PANELS.STATUS_DOWN,
			'Деградация',
		])
	})

	it('образцы декоративные: скрыты от скринридера', () => {
		const { container } = mount()
		const samples = container.querySelectorAll('.base-flow-map__legend-sample')
		expect(samples.length).toBe(5)
		samples.forEach(sample => expect(sample).toHaveAttribute('aria-hidden', 'true'))
	})

	it('внешняя система рисуется пунктирной рамкой', () => {
		const { container } = mount()
		const shapes = [...container.querySelectorAll('.base-flow-map__legend-shape')]
		expect(shapes.map(shape => shape.classList.contains('base-flow-map__legend-shape--external'))).toEqual([false, false, true])
	})

	it('образец связи: штрих, значки концов и цвет вида', () => {
		const { container } = mount()
		const [call, event] = [...container.querySelectorAll<SVGElement>('svg.base-flow-map__legend-sample')].slice(3)
		expect(call!.querySelector('.base-flow-map__legend-line')).not.toHaveAttribute('stroke-dasharray', '4 3')
		expect(call!.querySelectorAll('.base-flow-map__legend-mark--filled')).toHaveLength(1)
		expect(call!.getAttribute('style')).toBeNull()
		expect(event!.querySelector('.base-flow-map__legend-line')).toHaveAttribute('stroke-dasharray', '4 3')
		expect(event!.querySelectorAll('.base-flow-map__legend-mark')).toHaveLength(2)
		expect(event!.querySelectorAll('.base-flow-map__legend-mark--filled')).toHaveLength(0)
		expect(event!.style.color).toBe('var(--rise-info)')
	})

	it('статус: значок и цвет статуса', () => {
		const { container } = mount()
		const icons = container.querySelectorAll<HTMLElement>('.base-flow-map__legend-status')
		expect(icons).toHaveLength(4)
		expect(icons[0]!.style.color).toBe('var(--rise-success)')
		expect(icons[3]!.style.color).toBe('rgb(204, 102, 0)')
	})

	it('на широком экране развёрнута и кнопки сворачивания не имеет', () => {
		mount()
		expect(screen.queryByRole('button')).not.toBeInTheDocument()
		expect(legend()).not.toHaveClass('base-flow-map__legend--collapsed')
	})

	it('карта без узлов и связей — легенды нет', () => {
		mount({ data: { version: 1, nodes: [], edges: [] } })
		expect(screen.queryByRole('group')).not.toBeInTheDocument()
	})

	describe('на узком экране', () => {
		it('свёрнута: список скрыт, кнопка предлагает показать и сообщает о состоянии', () => {
			mount({ isCompact: true })
			const toggle = screen.getByRole('button', { name: UI_FLOW_PANELS.LEGEND_SHOW })
			expect(toggle).toHaveAttribute('aria-expanded', 'false')
			expect(screen.queryByRole('list')).not.toBeInTheDocument()
			expect(legend()).toHaveClass('base-flow-map__legend--collapsed')
		})

		it('кнопка раскрывает и снова сворачивает', async () => {
			mount({ isCompact: true })
			const user = userEvent.setup()
			await user.click(screen.getByRole('button', { name: UI_FLOW_PANELS.LEGEND_SHOW }))
			expect(screen.getByRole('list')).toBeInTheDocument()
			const hide = screen.getByRole('button', { name: UI_FLOW_PANELS.LEGEND_HIDE })
			expect(hide).toHaveAttribute('aria-expanded', 'true')
			await user.click(hide)
			expect(screen.queryByRole('list')).not.toBeInTheDocument()
		})

		it('выбор пользователя сохраняется при смене ширины', async () => {
			const { isCompact } = mount({ isCompact: true })
			const user = userEvent.setup()
			await user.click(screen.getByRole('button', { name: UI_FLOW_PANELS.LEGEND_SHOW }))
			isCompact.value = false
			await Promise.resolve()
			expect(screen.getByRole('list')).toBeInTheDocument()
		})
	})
})
