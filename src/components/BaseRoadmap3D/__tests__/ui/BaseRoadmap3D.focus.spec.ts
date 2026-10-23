import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, screen, waitFor, within } from '@testing-library/vue'
import { useRoadmap3DEnvironment } from '../fixtures/roadmap3d.test-utils'

const env = useRoadmap3DEnvironment()

const panel = () => screen.getByRole('region', { name: /Подробности/ })
const viewport = () => screen.getByRole('group', { name: 'Путь' })
const live = () => document.querySelector('.base-roadmap-3d__sr[role="status"]') as HTMLElement

async function pressOnViewport(key: string, init: KeyboardEventInit = {}) {
	await fireEvent.keyDown(viewport(), { key, ...init })
}

describe('BaseRoadmap3D: фокус на этапе и панель', () => {
	it('кнопка этапа в полосе открывает панель, сообщает фокус и озвучивает этап', async () => {
		const user = userEvent.setup()
		const { events } = await env.renderRoadmap()
		await user.click(screen.getByRole('button', { name: /Этап 2 из 4.*Каркас/ }))
		expect(within(panel()).getByRole('heading', { level: 2, name: 'Каркас' })).toBeInTheDocument()
		expect(events['update:focused']?.at(-1)).toEqual(['frame'])
		await waitFor(() => expect(live()).toHaveTextContent(/Каркас/))
		expect(screen.getByRole('button', { name: /Этап 2 из 4/ })).toHaveAttribute('aria-current', 'step')
	})

	it('в панели: проценты, темы, значок статуса; закрытый этап — что открывает путь', async () => {
		const user = userEvent.setup()
		await env.renderRoadmap({ focused: 'build' })
		expect(within(panel()).getByText(/Откроется после/)).toBeInTheDocument()
		await user.click(within(panel()).getByRole('button', { name: /Закрыть/ }))
		expect(screen.queryByRole('region', { name: /Подробности/ })).not.toBeInTheDocument()
	})

	it('проп focused ведёт фокус снаружи, неизвестный id — общий вид', async () => {
		const { rerender } = await env.renderRoadmap({ focused: 'basics' })
		expect(within(panel()).getByRole('heading', { level: 2, name: 'Основы' })).toBeInTheDocument()
		await rerender({ focused: 'frame' })
		expect(within(panel()).getByRole('heading', { level: 2, name: 'Каркас' })).toBeInTheDocument()
		await rerender({ focused: 'нет' })
		expect(screen.queryByRole('region', { name: /Подробности/ })).not.toBeInTheDocument()
	})

	it('«Следующий этап» и «Открыть в 2D» в панели', async () => {
		const user = userEvent.setup()
		const { events } = await env.renderRoadmap({ focused: 'basics' })
		await user.click(within(panel()).getByRole('button', { name: /К следующему этапу/ }))
		expect(within(panel()).getByRole('heading', { level: 2, name: 'Каркас' })).toBeInTheDocument()
		await user.click(within(panel()).getByRole('button', { name: /2D/ }))
		expect(events['update:view']?.at(-1)).toEqual(['2d'])
	})

	it('у последнего этапа «Следующий этап» нет', async () => {
		await env.renderRoadmap({ focused: 'ship' })
		expect(within(panel()).queryByRole('button', { name: /К следующему этапу/ })).not.toBeInTheDocument()
	})

	it('кнопка общего вида в панели инструментов снимает фокус', async () => {
		const user = userEvent.setup()
		const { events } = await env.renderRoadmap({ focused: 'basics' })
		await user.click(within(screen.getByRole('toolbar')).getByRole('button', { name: /Весь|Общий|остров/i }))
		expect(events['update:focused']?.at(-1)).toEqual([null])
	})
})

describe('BaseRoadmap3D: тема в панели', () => {
	it('выбор темы показывает её подробности; «Назад к этапу» и Escape закрывают сначала тему, потом панель', async () => {
		const user = userEvent.setup()
		await env.renderRoadmap({ focused: 'frame' })
		await user.click(within(panel()).getByRole('button', { name: /^Vue/ }))
		expect(within(panel()).getByRole('heading', { level: 2, name: 'Vue' })).toBeInTheDocument()
		await user.click(within(panel()).getByRole('button', { name: /К этапу/ }))
		expect(within(panel()).getByRole('heading', { level: 2, name: 'Каркас' })).toBeInTheDocument()
		await user.click(within(panel()).getByRole('button', { name: /^Vue/ }))
		await pressOnViewport('Escape')
		expect(within(panel()).getByRole('heading', { level: 2, name: 'Каркас' })).toBeInTheDocument()
		await pressOnViewport('Escape')
		expect(screen.queryByRole('region', { name: /Подробности/ })).not.toBeInTheDocument()
	})

	it('подтемы отмечаются в общий прогресс; «Дальше» открывает следующую тему', async () => {
		const user = userEvent.setup()
		const { events } = await env.renderRoadmap({ focused: 'frame' })
		await user.click(within(panel()).getByRole('button', { name: /^Vue/ }))
		await user.click(within(panel()).getByRole('checkbox', { name: 'Реактивность' }))
		await waitFor(() => expect(events['update:progress']?.length).toBeGreaterThan(0))
		await user.click(within(panel()).getByRole('button', { name: /Следующая тема/ }))
		expect(within(panel()).getByRole('heading', { level: 2 })).toBeInTheDocument()
	})

	it('статус темы меняется кнопкой «Отметить»', async () => {
		const user = userEvent.setup()
		const { events } = await env.renderRoadmap({ focused: 'frame' })
		await user.click(within(panel()).getByRole('button', { name: /^React/ }))
		await user.click(within(panel()).getByRole('button', { name: /Отметить|пройден|Изучен/i }))
		await waitFor(() => expect(events['status-change']?.length).toBeGreaterThan(0))
	})

	it('выбор темы другого этапа через скрытый список переводит фокус на этот этап', async () => {
		const user = userEvent.setup()
		await env.renderRoadmap({ focused: 'basics' })
		const list = screen.getByRole('list', { name: /Список/ })
		await user.click(within(list).getByRole('button', { name: /^Vue, / }))
		expect(within(panel()).getByRole('heading', { level: 2, name: 'Vue' })).toBeInTheDocument()
	})

	it('selected снаружи открывает тему и фокусирует её этап', async () => {
		const { exposed } = await env.renderRoadmap()
		exposed.value?.selectTopic('vite')
		await waitFor(() => expect(within(panel()).getByRole('heading', { level: 2, name: 'Vite' })).toBeInTheDocument())
	})
})

describe('BaseRoadmap3D: клавиатура', () => {
	it('стрелки двигают курсор и озвучивают этап, Enter открывает его, Escape возвращает общий вид', async () => {
		await env.renderRoadmap()
		await pressOnViewport('ArrowRight')
		await waitFor(() => expect(live()).toHaveTextContent(/Основы/))
		await pressOnViewport('ArrowDown')
		await waitFor(() => expect(live()).toHaveTextContent(/Каркас/))
		await pressOnViewport('Enter')
		expect(within(panel()).getByRole('heading', { level: 2, name: 'Каркас' })).toBeInTheDocument()
		await pressOnViewport('ArrowRight')
		expect(within(panel()).getByRole('heading', { level: 2, name: 'Сборка' })).toBeInTheDocument()
		await pressOnViewport('End')
		expect(within(panel()).getByRole('heading', { level: 2, name: 'Релиз' })).toBeInTheDocument()
		await pressOnViewport('Home')
		expect(within(panel()).getByRole('heading', { level: 2, name: 'Основы' })).toBeInTheDocument()
		await pressOnViewport('Escape')
		expect(screen.queryByRole('region', { name: /Подробности/ })).not.toBeInTheDocument()
	})

	it('пробел без курсора открывает текущий этап', async () => {
		await env.renderRoadmap()
		await pressOnViewport(' ')
		expect(within(panel()).getByRole('heading', { level: 2, name: 'Каркас' })).toBeInTheDocument()
	})

	it('камера с клавиатуры: Q, E, Shift+стрелки, плюс, минус, 0', async () => {
		const { events } = await env.renderRoadmap()
		await pressOnViewport('q')
		await pressOnViewport('e')
		await pressOnViewport('ArrowLeft', { shiftKey: true })
		await pressOnViewport('ArrowUp', { shiftKey: true })
		await pressOnViewport('+')
		await pressOnViewport('-')
		await pressOnViewport('0')
		expect(events['update:camera']?.length).toBeGreaterThan(0)
	})

	it('уход фокуса с области возвращает курсор на этап в фокусе', async () => {
		await env.renderRoadmap({ focused: 'basics' })
		await pressOnViewport('ArrowRight')
		await fireEvent.focusOut(viewport())
		await pressOnViewport('Enter')
		expect(within(panel()).getByRole('heading', { level: 2 })).toBeInTheDocument()
	})
})
