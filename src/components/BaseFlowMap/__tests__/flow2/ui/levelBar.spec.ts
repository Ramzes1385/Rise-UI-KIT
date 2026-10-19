import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import { map, node, tree } from '../fixtures/flow2Data'
import { fired, mountMap, stubFrame } from '../fixtures/flow2Ui'
import { fireEvent, screen, within } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const expandName = (name: string) => formatMessage(UI_FLOW_MAP.GROUP_EXPAND, { name })
const collapseName = (name: string) => formatMessage(UI_FLOW_MAP.GROUP_COLLAPSE, { name })
const levelName = (n: number, name: string) => formatMessage(UI_FLOW_MAP.LEVEL_BUTTON, { n, name })

beforeEach(() => stubFrame(1000))

afterEach(() => {
	vi.restoreAllMocks()
	vi.useRealTimers()
})

describe('свёрнутый блок и шеврон группы', () => {
	it('блок свёрнутой группы — кнопка «Развернуть …» с aria-expanded=false и числом элементов', () => {
		mountMap()
		const button = screen.getByRole('button', { name: expandName('Шлюз') })
		expect(button).toHaveAttribute('aria-expanded', 'false')
		expect(screen.getByText(/Шлюз/, { selector: '.base-flow-map__node-label' })).toBeInTheDocument()
	})

	it('клик по шеврону разворачивает блок: у группы появляется «Свернуть …» с aria-expanded=true', async () => {
		const user = userEvent.setup()
		mountMap()
		await user.click(screen.getByRole('button', { name: expandName('Шлюз') }))
		const collapse = await screen.findByRole('button', { name: collapseName('Шлюз') })
		expect(collapse).toHaveAttribute('aria-expanded', 'true')
		expect(screen.queryByRole('button', { name: expandName('Шлюз') })).not.toBeInTheDocument()
		await user.click(collapse)
		expect(await screen.findByRole('button', { name: expandName('Шлюз') })).toBeInTheDocument()
	})

	it('шеврон не выбирает элемент и не входит в группу', async () => {
		const user = userEvent.setup()
		const view = mountMap()
		await user.click(screen.getByRole('button', { name: expandName('Шлюз') }))
		expect(fired(view, 'update:selection')).toEqual([])
		expect(view.controllerOf().getLevel().path).toEqual([])
	})

	it('в списке для скринридера узлы и группы несут aria-expanded', async () => {
		mountMap({ data: tree() })
		const list = screen.getByRole('group', { name: UI_FLOW_MAP.LIST_TITLE })
		const collapsed = within(list)
			.getAllByRole('button', { hidden: true })
			.filter(item => item.getAttribute('aria-expanded') === 'false')
		expect(collapsed).toHaveLength(1)
		await userEvent.setup().click(screen.getByRole('button', { name: expandName('Шлюз') }))
		await screen.findByRole('button', { name: collapseName('Шлюз') })
		const groups = within(list)
			.getAllByRole('button', { hidden: true })
			.filter(item => item.getAttribute('aria-expanded') === 'true')
		expect(groups.map(item => item.textContent?.trim())).toContain('Шлюз')
		expect(within(list).getByText(UI_FLOW_MAP.LIST_GROUPS)).toBeInTheDocument()
	})
})

describe('видимый список панели list', () => {
	it('кнопки списка доступны с клавиатуры и выбирают группу и блок', async () => {
		const user = userEvent.setup()
		const view = mountMap({ panels: ['list'] })
		const list = screen.getByRole('group', { name: UI_FLOW_MAP.LIST_TITLE })
		expect(list).toHaveAttribute('tabindex', '0')
		view.controllerOf().setLevel(1)
		await screen.findByRole('button', { name: expandName('Платежи') })
		await user.click(within(list).getByRole('button', { name: 'Шлюз' }))
		expect(view.controllerOf().getSelection()).toEqual(['g1'])
		expect(within(list).getByRole('button', { name: 'Шлюз' })).toHaveAttribute('tabindex', '0')
		expect(within(list).getByRole('button', { name: 'Шлюз' })).toHaveAttribute('aria-expanded', 'true')
	})
})

describe('вход в группу', () => {
	it('клик по блоку входит в группу: крошки, уровень, событие level-change', async () => {
		const user = userEvent.setup()
		const view = mountMap()
		await user.click(screen.getByLabelText(/Шлюз/, { selector: '[data-flow-entity="node"]' }))
		const crumbs = await screen.findByRole('navigation', { name: UI_FLOW_MAP.CRUMBS_ARIA })
		expect(within(crumbs).getByText('Шлюз')).toHaveAttribute('aria-current', 'location')
		expect(within(crumbs).getByRole('button', { name: 'Система' })).toBeInTheDocument()
		expect(view.controllerOf().getLevel().path).toEqual(['g1'])
		expect(fired(view, 'node-click')).toHaveLength(1)
		expect(fired(view, 'level-change').length).toBeGreaterThan(0)
	})

	it('двойной клик по блоку тоже входит в группу и посылает dblclick', async () => {
		const view = mountMap()
		await fireEvent.dblClick(screen.getByLabelText(/Шлюз/, { selector: '[data-flow-entity="node"]' }))
		expect(view.controllerOf().getLevel().path).toEqual(['g1'])
		expect(fired(view, 'node-dblclick')).toHaveLength(1)
	})

	it('клик по обычному узлу и по группе в списке не входит в группу', async () => {
		const user = userEvent.setup()
		const view = mountMap()
		await user.click(screen.getByLabelText(/Delta/, { selector: '[data-flow-entity="node"]' }))
		expect(view.controllerOf().getLevel().path).toEqual([])
		view.controllerOf().setLevel(2)
		const list = await screen.findByRole('group', { name: UI_FLOW_MAP.LIST_TITLE })
		await user.click(await within(list).findByRole('button', { name: 'Шлюз', hidden: true }))
		expect(view.controllerOf().getLevel().path).toEqual([])
		expect(view.controllerOf().getSelection()).toEqual(['g1'])
	})

	it('двойной клик по обычному узлу не входит в группу', async () => {
		const view = mountMap()
		await fireEvent.dblClick(screen.getByLabelText(/Delta/, { selector: '[data-flow-entity="node"]' }))
		expect(view.controllerOf().getLevel().path).toEqual([])
	})

	it('двойной клик по связи не входит в группу', async () => {
		const view = mountMap()
		const edge = document.querySelector('[data-flow-entity="edge"]')
		if (edge) await fireEvent.dblClick(edge)
		expect(view.controllerOf().getLevel().path).toEqual([])
	})
})

describe('крошки', () => {
	it('крошка корня возвращает на уровень выше, текущая крошка — не кнопка', async () => {
		const user = userEvent.setup()
		const view = mountMap()
		view.controllerOf().enterGroup('g2')
		const crumbs = await screen.findByRole('navigation', { name: UI_FLOW_MAP.CRUMBS_ARIA })
		expect(within(crumbs).getByText('Платежи')).toHaveAttribute('aria-current', 'location')
		expect(within(crumbs).queryByRole('button', { name: 'Платежи' })).not.toBeInTheDocument()
		await user.click(within(crumbs).getByRole('button', { name: 'Шлюз' }))
		expect(view.controllerOf().getLevel().path).toEqual(['g1'])
		await user.click(within(crumbs).getByRole('button', { name: 'Система' }))
		expect(view.controllerOf().getLevel().path).toEqual([])
	})

	it('без заголовка данных корневая крошка называется «по умолчанию»', async () => {
		const view = mountMap({ data: tree({ title: undefined }) })
		view.controllerOf().enterGroup('g1')
		const crumbs = await screen.findByRole('navigation', { name: UI_FLOW_MAP.CRUMBS_ARIA })
		expect(within(crumbs).getByRole('button', { name: UI_FLOW_MAP.DEFAULT_LABEL })).toBeInTheDocument()
	})

	it('в узком кадре длинный путь сокращается до «…» и двух последних', async () => {
		stubFrame(400)
		const view = mountMap()
		view.controllerOf().enterGroup('g2')
		const crumbs = await screen.findByRole('navigation', { name: UI_FLOW_MAP.CRUMBS_ARIA })
		expect(crumbs).toHaveTextContent('…')
		expect(within(crumbs).queryByRole('button', { name: 'Система' })).not.toBeInTheDocument()
		expect(within(crumbs).getByRole('button', { name: 'Шлюз' })).toBeInTheDocument()
	})

	it('в узком кадре короткий путь не сокращается', async () => {
		stubFrame(400)
		const view = mountMap()
		view.controllerOf().enterGroup('g1')
		const crumbs = await screen.findByRole('navigation', { name: UI_FLOW_MAP.CRUMBS_ARIA })
		expect(within(crumbs).getByRole('button', { name: 'Система' })).toBeInTheDocument()
	})
})

describe('переключатель уровней', () => {
	it('показывает все уровни, активный отмечен aria-pressed, подпись — «N · название»', () => {
		mountMap()
		const levels = screen.getByRole('group', { name: UI_FLOW_MAP.LEVELS_ARIA })
		const buttons = within(levels).getAllByRole('button')
		expect(buttons.map(item => item.getAttribute('aria-label'))).toEqual([
			levelName(1, 'Контекст'),
			levelName(2, 'Контейнеры'),
			levelName(3, 'Компоненты'),
		])
		expect(buttons.map(item => item.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false'])
		expect(buttons[0]).toHaveTextContent(levelName(1, 'Контекст'))
	})

	it('клик по уровню переключает его и раскрывает группы', async () => {
		const user = userEvent.setup()
		const view = mountMap()
		await user.click(screen.getByRole('button', { name: levelName(3, 'Компоненты') }))
		expect(view.controllerOf().getLevel().index).toBe(2)
		expect(await screen.findByRole('button', { name: collapseName('Платежи') })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: levelName(3, 'Компоненты') })).toHaveAttribute('aria-pressed', 'true')
	})

	it('в узком кадре на кнопках только номера, а доступное имя полное', () => {
		stubFrame(400)
		mountMap()
		const button = screen.getByRole('button', { name: levelName(2, 'Контейнеры') })
		expect(button).toHaveTextContent(/^2$/)
	})

	it('панели нет, пока нет ни уровней, ни пути входа', () => {
		const { container } = mountMap({ data: map({ nodes: [node('a')] }) })
		expect(container.querySelector('.base-flow-map__levelbar')).toBeNull()
	})

	it('без смыслового зума есть только крошки после входа', async () => {
		const view = mountMap({ data: tree({ notation: undefined }), isSemanticZoom: false })
		expect(screen.queryByRole('group', { name: UI_FLOW_MAP.LEVELS_ARIA })).not.toBeInTheDocument()
		view.controllerOf().enterGroup('g1')
		await nextTick()
		expect(await screen.findByRole('navigation', { name: UI_FLOW_MAP.CRUMBS_ARIA })).toBeInTheDocument()
	})

	it('пустая карта без узлов панель не рисует', () => {
		const { container } = mountMap({ data: map({ notation: 'zoomy' }) })
		expect(container.querySelector('.base-flow-map__levelbar')).toBeNull()
	})

	it('слот level получает уровень и контроллер', async () => {
		const slots = {
			level: (slot: { level: { label: string }; controller: { setLevel: (index: number) => void } }) =>
				h('button', { type: 'button', onClick: () => slot.controller.setLevel(1) }, `слот: ${slot.level.label}`),
		}
		mountMap({}, slots)
		await fireEvent.click(screen.getByRole('button', { name: 'слот: Контекст' }))
		expect(await screen.findByRole('button', { name: 'слот: Контейнеры' })).toBeInTheDocument()
	})
})
