import '@testing-library/jest-dom/vitest'
import { fireEvent } from '@testing-library/vue'
import { guardConsole } from '../../helpers/consoleGuard.test-utils'
import { editData, flush, liveText, mountEdit, screen, settle, waitFor, type EditMap } from '../editHarness'

guardConsole()

const labelOf = (map: EditMap, id: string) => map.data().nodes.find(node => node.id === id)?.label
const input = () => screen.queryByRole('textbox', { name: 'Подпись элемента' }) as HTMLInputElement | null

async function rename(map: EditMap, id: string) {
	const element = map.node(id)
	element.focus()
	await settle()
	await map.press('F2', {}, element)
	return screen.findByRole('textbox', { name: 'Подпись элемента' }) as Promise<HTMLInputElement>
}

describe('подпись на месте', () => {
	it('F2 открывает поле с текстом, Enter сохраняет новую подпись и закрывает поле', async () => {
		const map = await mountEdit({ data: editData() })
		const field = await rename(map, 'gw')
		expect(field.value).toBe('Шлюз')
		await waitFor(() => expect(field).toHaveFocus())
		await fireEvent.update(field, 'Входной шлюз')
		await fireEvent.keyDown(field, { key: 'Enter' })
		await waitFor(() => expect(labelOf(map, 'gw')).toBe('Входной шлюз'))
		expect(input()).toBeNull()
		await map.press('z', { ctrlKey: true })
		expect(labelOf(map, 'gw')).toBe('Шлюз')
	})

	it('Escape отменяет, без изменений ничего не записывается, уход фокуса сохраняет', async () => {
		const map = await mountEdit({ data: editData() })
		let field = await rename(map, 'gw')
		await fireEvent.update(field, 'Другое')
		await fireEvent.keyDown(field, { key: 'Escape' })
		expect(input()).toBeNull()
		expect(labelOf(map, 'gw')).toBe('Шлюз')
		field = await rename(map, 'gw')
		await fireEvent.keyDown(field, { key: 'Enter' })
		expect(map.controller.getHistory().canUndo).toBe(false)
		field = await rename(map, 's1')
		await fireEvent.update(field, 'Заказы v2')
		await fireEvent.focusOut(field)
		await waitFor(() => expect(labelOf(map, 's1')).toBe('Заказы v2'))
	})

	it('двойной щелчок по узлу, связи и группе открывает подпись; в просмотре — нет', async () => {
		const map = await mountEdit({ data: editData() })
		await fireEvent.dblClick(map.node('s2'))
		expect((await screen.findByRole('textbox', { name: 'Подпись элемента' })) as HTMLInputElement).toHaveValue('Оплата')
		await fireEvent.keyDown(input()!, { key: 'Escape' })
		await fireEvent.dblClick(map.element('group', 'z1'))
		expect(input()).toHaveValue('Ядро')
		await fireEvent.keyDown(input()!, { key: 'Escape' })
		await fireEvent.dblClick(map.element('edge', 'e1'))
		await settle()
		expect(input()).not.toBeNull()
		await fireEvent.keyDown(input()!, { key: 'Escape' })
		await fireEvent.dblClick(map.root)
		expect(input()).toBeNull()
	})

	it('в заметке Enter сохраняет, а Shift+Enter переносит строку', async () => {
		const map = await mountEdit({ data: editData() })
		const field = (await rename(map, 'nt')) as unknown as HTMLTextAreaElement
		expect(field.tagName).toBe('TEXTAREA')
		const shiftEnter = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, cancelable: true })
		field.dispatchEvent(shiftEnter)
		expect(shiftEnter.defaultPrevented).toBe(false)
		expect(labelOf(map, 'nt')).toBe('Заметка')
		await fireEvent.update(field, 'Строка 1\nСтрока 2')
		await fireEvent.keyDown(field, { key: 'Enter' })
		await waitFor(() => expect(labelOf(map, 'nt')).toBe('Строка 1\nСтрока 2'))
	})

	it('beforeEditLabel может заменить текст или отказать с уведомлением', async () => {
		const beforeEditLabel = vi.fn(({ value }: { value: string }) => (value === 'Нельзя' ? false : value.toUpperCase()))
		const map = await mountEdit({ data: editData(), beforeEditLabel })
		let field = await rename(map, 'gw')
		await fireEvent.update(field, 'новый')
		await fireEvent.keyDown(field, { key: 'Enter' })
		await waitFor(() => expect(labelOf(map, 'gw')).toBe('НОВЫЙ'))
		expect(beforeEditLabel).toHaveBeenCalledWith(expect.objectContaining({ previous: 'Шлюз', value: 'новый' }))
		field = await rename(map, 'gw')
		await fireEvent.update(field, 'Нельзя')
		await fireEvent.keyDown(field, { key: 'Enter' })
		await flush()
		await settle()
		expect(labelOf(map, 'gw')).toBe('НОВЫЙ')
		expect(screen.getByRole('status', { name: 'Уведомления правки' }).textContent).toMatch(/^Нельзя: /)
		expect((await liveText(map)).length).toBeGreaterThan(0)
	})

	it('F2 без фокуса и выделения ничего не открывает; для связи и группы в фокусе открывает', async () => {
		const map = await mountEdit({ data: editData() })
		await map.press('F2')
		expect(input()).toBeNull()
		const edge = map.element('edge', 'e1')
		edge.focus()
		await settle()
		await map.press('F2', {}, edge)
		expect(input()).not.toBeNull()
		await fireEvent.keyDown(input()!, { key: 'Escape' })
		const group = map.element('group', 'z1')
		group.focus()
		await settle()
		await map.press('F2', {}, group)
		expect(input()).toHaveValue('Ядро')
	})
})
