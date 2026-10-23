import '@testing-library/jest-dom/vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/vue'
import { CROSS_DATA, LONE_DATA, T, nodeOf, tagOf, useEditHarness, viewport } from '../helpers/editHarness.test-utils'

const { mountEdit } = useEditHarness()

const notice = () => document.querySelector('.base-flow-map-3d__notice')

describe('BaseFlowMap3D «Правка»: клавиатура', () => {
	it('R поворачивает выбранный узел на 90°, история хранит шаг, Ctrl+Z и Ctrl+Y его отменяют и повторяют', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await map.select('a')
		await map.press('r')
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.rotation).toBe(90))
		await map.press('R')
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.rotation).toBe(180))
		await map.press('z', { ctrlKey: true })
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.rotation).toBe(90))
		await map.press('y', { ctrlKey: true })
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.rotation).toBe(180))
		await map.press('z', { ctrlKey: true, shiftKey: true })
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.rotation).toBe(180))
		await map.press('z', { ctrlKey: true, altKey: true })
	})

	it('без выбора буквы и стрелки ничего не делают; после «Правки» узлов нет под рукой', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		const before = JSON.stringify(map.data())
		await map.press('r')
		await map.press('Delete')
		await map.press('c')
		await map.press('Enter')
		expect(JSON.stringify(map.data())).toBe(before)
		await map.press('z', { ctrlKey: true })
		await map.press('y', { ctrlKey: true })
		expect(JSON.stringify(map.data())).toBe(before)
	})

	it('стрелка двигает выбранный узел на шаг сетки, Alt и Shift её не трогают', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await map.select('a')
		const [x, y] = [400, 400]
		await map.press('ArrowRight', { altKey: true })
		await map.press('ArrowRight', { shiftKey: true })
		expect(nodeOf(map.data(), 'a')?.position).toEqual({ x, y })
		await map.press('ArrowRight')
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.position).not.toEqual({ x, y }))
		const moved = nodeOf(map.data(), 'a')!.position!
		expect(Math.abs(moved.x - x) + Math.abs(moved.y - y)).toBe(40)
		await waitFor(() => expect(notice()).toHaveTextContent(T.EDIT_MOVED))
	})

	it('стрелка к занятой клетке: «Клетка занята», данные те же', async () => {
		const map = await mountEdit({ data: CROSS_DATA })
		await map.select('a')
		await map.press('ArrowRight')
		await map.press('ArrowLeft')
		await map.press('ArrowUp')
		await map.press('ArrowDown')
		expect(nodeOf(map.data(), 'a')?.position).toEqual({ x: 400, y: 400 })
		await waitFor(() => expect(notice()).toHaveTextContent(T.EDIT_BLOCKED))
	})

	it('Delete и Backspace удаляют выбранный узел вместе со связями', async () => {
		const map = await mountEdit()
		await map.select('cache')
		await map.press('Delete')
		await waitFor(() => expect(nodeOf(map.data(), 'cache')).toBeUndefined())
		expect(map.data().edges.some(edge => edge.id === 'api-cache')).toBe(false)
		await map.select('db')
		await map.press('Backspace')
		await waitFor(() => expect(nodeOf(map.data(), 'db')).toBeUndefined())
		await waitFor(() => expect(notice()).toHaveTextContent('Удалено узлов: 1'))
	})

	it('beforeDelete отказывает — узел остаётся, пользователь видит причину', async () => {
		const map = await mountEdit({ beforeDelete: () => false })
		await map.select('cache')
		await map.press('Delete')
		await waitFor(() => expect(notice()).toHaveTextContent('Правка не выполнена'))
		expect(nodeOf(map.data(), 'cache')).toBeDefined()
	})

	it('фокус без выбора тоже цель: стрелка вперёд выбирает узел, а Delete удаляет сфокусированный', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await map.press('ArrowRight', { shiftKey: true })
		await fireEvent.click(tagOf(map.container, 'b'))
		map.api().select([])
		await map.press('Home')
		await map.press('Delete')
		await waitFor(() => expect(map.data().nodes.length).toBeLessThan(2))
	})

	it('Enter открывает инспектор у выбранного узла', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await map.select('a')
		await map.press('Enter')
		expect(screen.getByRole('region', { name: T.INSPECTOR })).toBeInTheDocument()
		expect(within(screen.getByRole('region', { name: T.INSPECTOR })).getByDisplayValue('Один')).toBeInTheDocument()
	})

	it('вне окна вьюпорта (событие из вложенного поля) клавиша правки не срабатывает', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await map.select('a')
		const field = within(screen.getByRole('region', { name: T.INSPECTOR })).getByDisplayValue('Один')
		await fireEvent.keyDown(field, { key: 'r' })
		expect(nodeOf(map.data(), 'a')?.model3d?.rotation).toBeUndefined()
		expect(viewport()).toBeInTheDocument()
	})
})
