import '@testing-library/jest-dom/vitest'
import { guardConsole } from '../../helpers/consoleGuard.test-utils'
import { editData, mountEdit, settle, type EditMap } from '../editHarness'

guardConsole()

const ids = (map: EditMap) => map.data().nodes.map(node => node.id)
const rootOf = (map: EditMap) => map.container.querySelector('.base-flow-map') as HTMLElement
const isInside = (map: EditMap) => rootOf(map).contains(document.activeElement) && document.activeElement !== rootOf(map).parentElement

async function select(map: EditMap, ...list: string[]) {
	map.controller.select(list)
	await settle()
}

function loseFocus() {
	;(document.activeElement as HTMLElement | null)?.blur()
	expect(document.activeElement).toBe(document.body)
}

describe('фокус после действий правки', () => {
	afterEach(() => {
		document.body.querySelectorAll('input[data-outside]').forEach(item => item.remove())
	})

	it('после Delete узла фокус внутри карты, следующий Ctrl+Z возвращает узел', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 's1')
		loseFocus()
		await map.press('Delete')
		expect(ids(map)).not.toContain('s1')
		expect(isInside(map)).toBe(true)
		await map.press('z', { ctrlKey: true })
		expect(ids(map)).toContain('s1')
	})

	it('после Delete связи и группы фокус остаётся внутри карты', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 'e1')
		loseFocus()
		await map.press('Delete')
		expect(map.data().edges.map(edge => edge.id)).not.toContain('e1')
		expect(isInside(map)).toBe(true)
		await select(map, 'z1')
		loseFocus()
		await map.press('Delete')
		expect(map.data().groups?.map(group => group.id) ?? []).not.toContain('z1')
		expect(isInside(map)).toBe(true)
	})

	it('после «Вырезать», Ctrl+Z и Ctrl+Shift+Z фокус внутри карты', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 'nt')
		loseFocus()
		await map.press('x', { ctrlKey: true })
		expect(ids(map)).not.toContain('nt')
		expect(isInside(map)).toBe(true)
		loseFocus()
		await map.press('z', { ctrlKey: true })
		expect(ids(map)).toContain('nt')
		expect(isInside(map)).toBe(true)
		loseFocus()
		await map.press('z', { ctrlKey: true, shiftKey: true })
		expect(ids(map)).not.toContain('nt')
		expect(isInside(map)).toBe(true)
	})

	it('фокус берётся узлом с tabindex=0, если он есть', async () => {
		const map = await mountEdit({ data: editData() })
		const node = map.node('gw')
		node.setAttribute('tabindex', '0')
		await select(map, 's1')
		loseFocus()
		await map.press('Delete')
		expect(document.activeElement).toBe(node)
	})

	it('фокус вне карты (поле ввода) не отбирается', async () => {
		const map = await mountEdit({ data: editData() })
		const input = document.createElement('input')
		input.setAttribute('data-outside', '')
		document.body.append(input)
		await select(map, 's1')
		input.focus()
		await map.press('Delete')
		expect(ids(map)).not.toContain('s1')
		expect(document.activeElement).toBe(input)
		await map.press('z', { ctrlKey: true })
		expect(document.activeElement).toBe(input)
		await settle()
	})
})
