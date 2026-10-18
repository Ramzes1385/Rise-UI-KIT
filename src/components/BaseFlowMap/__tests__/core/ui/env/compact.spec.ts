import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { UI_FLOW_SCENARIO } from '@/locales/messages'
import { mapData, mountMap, stubFrame } from '../flowUi'
import { fireEvent, screen } from '@testing-library/vue'

async function compact(props: Parameters<typeof mountMap>[0] = {}) {
	stubFrame(400, 500)
	const result = mountMap(props)
	await nextTick()
	await nextTick()
	return result
}

describe('BaseFlowMap компактный вид', () => {
	it('меньше compactBreakpoint включается компактный режим, от порога — нет', async () => {
		const narrow = await compact()
		expect(narrow.container.firstElementChild).toHaveClass('base-flow-map--compact')
		narrow.unmount()
		vi.restoreAllMocks()
		stubFrame(640)
		const exact = mountMap()
		await nextTick()
		expect(exact.container.firstElementChild).not.toHaveClass('base-flow-map--compact')
	})

	it('порог задаётся пропсом', async () => {
		stubFrame(700)
		const result = mountMap({ compactBreakpoint: 800 })
		await nextTick()
		expect(result.container.firstElementChild).toHaveClass('base-flow-map--compact')
	})

	it('HTML-узлы становятся плитками без подзаголовка, SVG-узлы не меняются', async () => {
		const { container } = await compact({
			data: mapData({
				nodes: [
					{ id: 'a', kind: 'service', label: 'Alpha', subtitle: 'описание' },
					{ id: 'n', kind: 'note', label: 'Заметка' },
				],
				edges: [],
			}),
		})
		expect(container.querySelector('.base-flow-map__node--tile')).toBeInTheDocument()
		expect(screen.queryByText('описание')).not.toBeInTheDocument()
		expect(container.querySelector('.base-flow-map__node--svg')).not.toHaveClass('base-flow-map__node--tile')
	})

	it('сценарий в компактном виде — плеер из одной кнопки запуска и шага', async () => {
		await compact({
			data: mapData({
				scenarios: [{ id: 's', label: 'Заказ', steps: [{ id: 'one', edge: 'e1', label: 'Создать' }] }],
			}),
			scenario: 's',
		})
		expect(screen.getByRole('group', { name: UI_FLOW_SCENARIO.PANEL })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: UI_FLOW_SCENARIO.PLAY })).toBeInTheDocument()
	})

	it('подробности узла в компактном виде открываются нижней шторкой', async () => {
		await compact()
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Alpha/ }))
		expect(await screen.findByRole('dialog')).toBeInTheDocument()
	})
})
