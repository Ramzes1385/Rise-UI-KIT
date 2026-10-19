import '@testing-library/jest-dom/vitest'
import { fireEvent } from '@testing-library/vue'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { editData, liveText, mountEdit, screen, settle, waitFor } from './editHarness'

guardConsole()

const pressed = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-pressed')

describe('инструменты: V H C N T G', () => {
	it('панель инструментов показывает шесть инструментов, выбран «Выделение»', async () => {
		await mountEdit({ data: editData() })
		const bar = screen.getByRole('toolbar', { name: 'Инструменты правки' })
		expect(bar).toBeInTheDocument()
		for (const name of ['Выделение, V', 'Рука, H', 'Связь, C', 'Узел, N', 'Заметка, T', 'Группа или дорожка, G']) {
			expect(screen.getByRole('button', { name })).toBeInTheDocument()
		}
		expect(pressed('Выделение, V')).toBe('true')
	})

	it('H включает «Руку», V возвращает «Выделение», Escape сбрасывает инструмент', async () => {
		const map = await mountEdit({ data: editData() })
		await map.press('h')
		expect(pressed('Рука, H')).toBe('true')
		expect(pressed('Выделение, V')).toBe('false')
		await map.press('v')
		expect(pressed('Выделение, V')).toBe('true')
		await map.press('g')
		expect(pressed('Группа или дорожка, G')).toBe('true')
		await map.press('Escape')
		expect(pressed('Выделение, V')).toBe('true')
	})

	it('щелчок по кнопке инструмента выбирает его и озвучивает', async () => {
		const map = await mountEdit({ data: editData() })
		await fireEvent.click(screen.getByRole('button', { name: 'Связь, C' }))
		expect(pressed('Связь, C')).toBe('true')
		expect(await liveText(map)).toBe('Инструмент: Связь')
	})

	it('T выбирает «Заметку», если в нотации есть вид-заметка; G при выделении сразу собирает группу', async () => {
		const map = await mountEdit({ data: editData() })
		await map.press('t')
		await waitFor(() => expect(map.data().nodes.some(node => node.kind === 'note' && node.id !== 'nt')).toBe(true))
		map.controller.select(['gw'])
		await settle()
		await map.press('g')
		expect(map.data().groups?.length).toBe(2)
		expect(pressed('Выделение, V')).toBe('true')
	})

	it('в нотации без заметки нет кнопки T и клавиша ничего не делает', async () => {
		const { flowBpmn } = await import('../../model/notations/bpmn')
		const nodes = [{ id: 'x', kind: 'task', label: 'Задача', position: { x: 0, y: 0 }, isPinned: true }]
		const map = await mountEdit({ data: { version: 1, notation: 'bpmn', nodes, edges: [] }, notations: [flowBpmn] })
		void map
		expect(screen.queryByRole('button', { name: 'Заметка, T' })).toBeNull()
	})
})
