import '@testing-library/jest-dom/vitest'
import { formatMessage } from '@/locales/state'
import userEvent from '@testing-library/user-event'
import { screen, within } from '@testing-library/vue'
import { mountMap, stubFrame } from '../fixtures/flow2Ui'
import { UI_FLOW_C4, UI_FLOW_MAP } from '@/locales/messages'
import { edge, group, map, node } from '../fixtures/flow2Data'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flowC4, flowEpc, flowEventStorming, flowSequence } from '../../../index'

beforeEach(() => stubFrame(1100, 700))

afterEach(() => vi.restoreAllMocks())

const levelName = (n: number, name: string) => formatMessage(UI_FLOW_MAP.LEVEL_BUTTON, { n, name })

describe('C4 на карте: смысловой зум и блок границы', () => {
	const data = map({
		notation: 'c4',
		title: 'Магазин',
		groups: [
			group('sys', { kind: 'system-boundary', label: 'Магазин' }),
			group('api', { kind: 'container-boundary', label: 'API', parent: 'sys', props: { technology: 'Go' } }),
		],
		nodes: [
			node('user', { kind: 'person', label: 'Клиент' }),
			node('web', { kind: 'container', label: 'Веб', group: 'sys', props: { technology: 'Vue' } }),
			node('auth', { kind: 'component', label: 'Авторизация', group: 'api' }),
		],
		edges: [edge('e1', ['user', 'web'], { label: 'Открывает' }), edge('e2', ['web', 'auth'], { label: 'Вызывает' })],
	})

	it('на крупном плане граница — блок со строкой «Программная система» и числом элементов', () => {
		mountMap({ data, notations: [flowC4] })
		const block = screen.getByLabelText(/Магазин/, { selector: '[data-flow-entity="node"]' })
		expect(block).toHaveTextContent(formatMessage(UI_FLOW_C4.CARD_LINE_PLAIN, { kind: UI_FLOW_C4.SOFTWARE_SYSTEM }))
		expect(block).toHaveClass('base-flow-map__node--label-bottom')
	})

	it('переключатель называет три уровня C4, на втором вложенная граница — блок с технологией', async () => {
		const user = userEvent.setup()
		mountMap({ data, notations: [flowC4] })
		const levels = screen.getByRole('group', { name: UI_FLOW_MAP.LEVELS_ARIA })
		expect(
			within(levels)
				.getAllByRole('button')
				.map(item => item.getAttribute('aria-label')),
		).toEqual([
			levelName(1, UI_FLOW_C4.LEVEL_CONTEXT),
			levelName(2, UI_FLOW_C4.LEVEL_CONTAINERS),
			levelName(3, UI_FLOW_C4.LEVEL_COMPONENTS),
		])
		await user.click(screen.getByRole('button', { name: levelName(2, UI_FLOW_C4.LEVEL_CONTAINERS) }))
		const inner = await screen.findByLabelText(/API/, { selector: '[data-flow-entity="node"]' })
		expect(inner).toHaveTextContent(formatMessage(UI_FLOW_C4.CARD_LINE, { kind: UI_FLOW_C4.CONTAINER, technology: 'Go' }))
	})

	it('вход в блок показывает крошки с названием границы', async () => {
		const user = userEvent.setup()
		mountMap({ data, notations: [flowC4] })
		await user.click(screen.getByLabelText(/Магазин/, { selector: '[data-flow-entity="node"]' }))
		const crumbs = await screen.findByRole('navigation', { name: UI_FLOW_MAP.CRUMBS_ARIA })
		expect(within(crumbs).getByText('Магазин', { selector: '[aria-current="location"]' })).toBeInTheDocument()
	})
})

describe('Sequence на карте', () => {
	const data = map({
		notation: 'sequence',
		nodes: [
			node('a', { kind: 'actor', label: 'Клиент' }),
			node('b', { kind: 'lifeline', label: 'Сервис' }),
			node('f', { kind: 'fragment', label: '', props: { operator: 'opt', guard: 'есть токен', from: 'm1', to: 'm2' } }),
		],
		edges: [
			edge('m1', ['a', 'b'], { kind: 'sync', label: 'Войти' }),
			edge('m2', ['b', 'b'], { kind: 'sync', label: 'Проверить' }),
			edge('m3', ['a', 'b'], { kind: 'destroy', label: 'Закрыть' }),
		],
	})

	it('название линии жизни стоит в заголовке по центру, оператор фрагмента — в его вкладке', () => {
		const { container } = mountMap({ data, notations: [flowSequence], panels: [] })
		const texts = [...container.querySelectorAll('svg text')].map(item => item.textContent)
		expect(texts).toContain('Сервис')
		expect(texts).toContain('Клиент')
		expect(texts).toContain('opt [есть токен]')
	})

	it('связь destroy рисуется с маркером-крестом', () => {
		const { container } = mountMap({ data, notations: [flowSequence], panels: [] })
		const marker = container.querySelector('marker[id$="-cross"]')
		expect(marker).not.toBeNull()
		expect(marker?.querySelectorAll('path')).toHaveLength(2)
		expect(container.querySelector('path[marker-end$="-cross)"]')).not.toBeNull()
	})

	it('в легенде у destroy — крест на конце линии', () => {
		const { container } = mountMap({ data, notations: [flowSequence], panels: ['legend'] })
		const legend = container.querySelector('.base-flow-map__legend') as HTMLElement
		expect(legend).not.toBeNull()
		expect([...legend.querySelectorAll('path')].some(path => path.getAttribute('d') === 'M18 3.5l5 7M23 3.5l-5 7')).toBe(true)
	})
})

describe('EPC и Event Storming на карте', () => {
	it('EPC: коннектор XOR виден знаком, а поток — стрелками', () => {
		const data = map({
			notation: 'epc',
			nodes: [
				node('e', { kind: 'event', label: 'Заказ' }),
				node('x', { kind: 'xor', label: 'Ветвление' }),
				node('f', { kind: 'function', label: 'Проверить' }),
			],
			edges: [edge('c1', ['e', 'x'], { kind: 'control' }), edge('c2', ['x', 'f'], { kind: 'control' })],
		})
		const { container } = mountMap({ data, notations: [flowEpc], panels: [] })
		expect([...container.querySelectorAll('svg text')].map(item => item.textContent)).toContain('XOR')
		expect(container.querySelectorAll('path[marker-end]').length).toBeGreaterThanOrEqual(2)
	})

	it('Event Storming: стикеры по видам и контекст вокруг них', () => {
		const data = map({
			notation: 'event-storming',
			groups: [group('ctx', { kind: 'context', label: 'Заказы' })],
			nodes: [
				node('c', { kind: 'command', label: 'Оформить', group: 'ctx' }),
				node('ev', { kind: 'domain-event', label: 'Оформлен', group: 'ctx' }),
			],
			edges: [edge('1', ['c', 'ev'], { kind: 'flow' })],
		})
		mountMap({ data, notations: [flowEventStorming], panels: [] })
		expect(screen.getByLabelText(/Оформить/, { selector: '[data-flow-entity="node"]' })).toBeInTheDocument()
		expect(screen.getByLabelText(/Оформлен/, { selector: '[data-flow-entity="node"]' })).toBeInTheDocument()
		expect(screen.getAllByLabelText(/Заказы/, { selector: '[data-flow-entity="group"]' })).toHaveLength(1)
	})
})
