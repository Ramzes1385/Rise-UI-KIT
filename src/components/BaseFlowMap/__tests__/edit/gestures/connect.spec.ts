import '@testing-library/jest-dom/vitest'
import { fireEvent } from '@testing-library/vue'
import { guardConsole } from '../../helpers/consoleGuard.test-utils'
import { editData, flush, liveText, mountEdit, screen, settle, waitFor, type EditMap } from '../editHarness'

const guard = guardConsole()

const port = (map: EditMap, id: string) => map.container.querySelector(`circle[data-edit-port="${id}|"]`) as SVGElement
const edges = (map: EditMap) => map.data().edges
const notices = () => screen.getByRole('status', { name: 'Уведомления правки' })

async function select(map: EditMap, ...ids: string[]) {
	map.controller.select(ids)
	await settle()
}

describe('соединение мышью', () => {
	it('порты видны у выделенного узла; тянем из порта — призрак, отпустили на узле — связь одним шагом', async () => {
		const map = await mountEdit({ data: editData() })
		expect(map.container.querySelectorAll('circle[data-edit-port]')).toHaveLength(0)
		await select(map, 'gw')
		expect(map.container.querySelectorAll('circle[data-edit-port="gw|"]')).toHaveLength(4)
		map.pointer('pointerdown', port(map, 'gw'), map.at(160, 28))
		map.pointer('pointermove', window, map.at(480, 188))
		await settle()
		expect(map.container.querySelector('.base-flow-map__edit-link')).toHaveAttribute('data-verdict', 'ok')
		expect(map.container.querySelector('.base-flow-map__edit-ring')).not.toBeNull()
		map.pointer('pointerup', window, map.at(480, 188))
		await flush()
		await settle()
		expect(edges(map)).toHaveLength(3)
		expect(edges(map)[2]).toMatchObject({ source: 'gw', target: 's2' })
		expect(map.container.querySelector('.base-flow-map__edit-link')).toBeNull()
		expect(map.controller.getHistory().undoLabel).toBeTruthy()
		await map.press('z', { ctrlKey: true })
		expect(edges(map)).toHaveLength(2)
	})

	it('правило нотации: красное кольцо, при отпускании — «Нельзя: …», озвучка причины, связи нет', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 'db')
		map.pointer('pointerdown', port(map, 'db'), map.at(800, 28))
		map.pointer('pointermove', window, map.at(480, 28))
		await settle()
		expect(map.container.querySelector('.base-flow-map__edit-link')).toHaveAttribute('data-verdict', 'no')
		map.pointer('pointerup', window, map.at(480, 28))
		await flush()
		await settle()
		expect(edges(map)).toHaveLength(2)
		expect(notices().textContent).toMatch(/^Нельзя: /)
		expect(await liveText(map)).toBe(notices().textContent?.replace('Нельзя: ', ''))
	})

	it('отпустили на пустом месте или щёлкнули по порту — ничего не меняется и призрака нет', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 'gw')
		await map.drag(port(map, 'gw'), [
			[160, 28],
			[300, 300],
		])
		expect(edges(map)).toHaveLength(2)
		expect(map.container.querySelector('.base-flow-map__edit-link')).toBeNull()
		await map.drag(port(map, 'gw'), [[160, 28]])
		expect(edges(map)).toHaveLength(2)
		expect(notices().textContent).toBe('')
	})

	it('инструмент «Связь»: тянем прямо от узла', async () => {
		const map = await mountEdit({ data: editData() })
		await fireEvent.click(screen.getByRole('button', { name: 'Связь, C' }))
		await map.drag(map.node('gw'), [
			[20, 28],
			[480, 188],
		])
		expect(edges(map).at(-1)).toMatchObject({ source: 'gw', target: 's2' })
	})

	it('цель — порт другого узла; порт того же узла цель не даёт', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 'gw', 's2')
		map.pointer('pointerdown', port(map, 'gw'), map.at(160, 28))
		map.pointer('pointermove', port(map, 'gw'), map.at(100, 28))
		await settle()
		expect(map.container.querySelector('.base-flow-map__edit-link')).toHaveAttribute('data-verdict', 'none')
		map.pointer('pointermove', port(map, 's2'), map.at(480, 160))
		await settle()
		expect(map.container.querySelector('.base-flow-map__edit-port--hot')).not.toBeNull()
		map.pointer('pointerup', port(map, 's2'), map.at(480, 160))
		await flush()
		await settle()
		expect(edges(map).at(-1)).toMatchObject({ source: 'gw', target: 's2' })
	})

	it('асинхронный beforeConnect: пока ждём — загрузка «Ждём ответ приложения», потом связь', async () => {
		let answer!: (value: boolean) => void
		const beforeConnect = vi.fn(() => new Promise<boolean>(resolve => (answer = resolve)))
		const map = await mountEdit({ data: editData(), beforeConnect })
		await select(map, 'gw')
		map.pointer('pointerdown', port(map, 'gw'), map.at(160, 28))
		map.pointer('pointermove', window, map.at(480, 188))
		map.pointer('pointerup', window, map.at(480, 188))
		await settle()
		await waitFor(() => expect(screen.getByLabelText('Ждём ответ приложения')).toBeInTheDocument())
		expect(edges(map)).toHaveLength(2)
		answer(true)
		await waitFor(() => expect(edges(map)).toHaveLength(3))
		await waitFor(() => expect(screen.queryByLabelText('Ждём ответ приложения')).toBeNull())
		expect(beforeConnect).toHaveBeenCalledTimes(1)
	})

	it('отказ beforeConnect: уведомление и озвучка, связи нет', async () => {
		const map = await mountEdit({ data: editData(), beforeConnect: () => false })
		await select(map, 'gw')
		await map.drag(port(map, 'gw'), [
			[160, 28],
			[480, 188],
		])
		expect(edges(map)).toHaveLength(2)
		expect(notices().textContent).toMatch(/^Нельзя: /)
		expect((await liveText(map)).length).toBeGreaterThan(0)
	})
})

describe('соединение с клавиатуры', () => {
	it('C на выделенном узле открывает список целей; недопустимые неактивны с причиной; выбор создаёт связь', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 'gw')
		await map.press('c')
		const box = await screen.findByRole('combobox', { name: 'Соединить с…' })
		await fireEvent.focus(box)
		await fireEvent.click(box)
		const note = await screen.findByRole('option', { name: /Заметка/ })
		expect(note).toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(await screen.findByRole('option', { name: /Оплата/ }))
		await waitFor(() => expect(edges(map).at(-1)).toMatchObject({ source: 'gw', target: 's2' }))
		await waitFor(() => expect(screen.queryByRole('combobox', { name: 'Соединить с…' })).toBeNull())
	})

	it('Escape закрывает список, не создавая связь; без выделения и фокуса C ничего не открывает', async () => {
		const map = await mountEdit({ data: editData() })
		await map.press('c')
		expect(screen.queryByRole('combobox', { name: 'Соединить с…' })).toBeNull()
		await select(map, 'gw')
		await map.press('c')
		await screen.findByRole('combobox', { name: 'Соединить с…' })
		await fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
		await waitFor(() => expect(screen.queryByRole('combobox', { name: 'Соединить с…' })).toBeNull())
		expect(edges(map)).toHaveLength(2)
	})
	describe('асинхронный beforeConnect при выборе цели из списка', () => {
		async function choose(map: EditMap) {
			await select(map, 'gw')
			await map.press('c')
			const box = await screen.findByRole('combobox', { name: 'Соединить с…' })
			await fireEvent.focus(box)
			await fireEvent.click(box)
			await fireEvent.click(await screen.findByRole('option', { name: /Оплата/ }))
		}

		it('пока ждём ответ — индикатор и объявление, после ответа — сброс и связь', async () => {
			let answer!: (value: boolean) => void
			const beforeConnect = vi.fn(() => new Promise<boolean>(resolve => (answer = resolve)))
			const map = await mountEdit({ data: editData(), beforeConnect })
			await choose(map)
			await waitFor(() => expect(screen.getByLabelText('Ждём ответ приложения')).toBeInTheDocument())
			expect(map.container.querySelector('.base-flow-map__edit-link')).toHaveAttribute('data-verdict', 'pending')
			expect(await liveText(map)).toContain('Ждём ответ приложения')
			expect(edges(map)).toHaveLength(2)
			answer(true)
			await waitFor(() => expect(edges(map)).toHaveLength(3))
			await waitFor(() => expect(screen.queryByLabelText('Ждём ответ приложения')).toBeNull())
			expect(map.container.querySelector('.base-flow-map__edit-link')).toBeNull()
		})

		it('отказ приложения сбрасывает индикатор, связи нет', async () => {
			let answer!: (value: boolean) => void
			const map = await mountEdit({ data: editData(), beforeConnect: () => new Promise<boolean>(resolve => (answer = resolve)) })
			await choose(map)
			await waitFor(() => expect(screen.getByLabelText('Ждём ответ приложения')).toBeInTheDocument())
			answer(false)
			await waitFor(() => expect(screen.queryByLabelText('Ждём ответ приложения')).toBeNull())
			expect(edges(map)).toHaveLength(2)
		})

		it('отклонённый промис хука сбрасывает индикатор', async () => {
			let fail!: (reason: unknown) => void
			const map = await mountEdit({
				data: editData(),
				beforeConnect: () => new Promise<boolean>((_, reject) => (fail = reject)),
			})
			await choose(map)
			await waitFor(() => expect(screen.getByLabelText('Ждём ответ приложения')).toBeInTheDocument())
			fail(new Error('сбой'))
			await waitFor(() => expect(screen.queryByLabelText('Ждём ответ приложения')).toBeNull())
			expect(edges(map)).toHaveLength(2)
			const logged = [guard.warn(), guard.error()]
			expect(
				logged
					.flatMap(spy => spy.mock.calls)
					.flat()
					.join(),
			).toContain('beforeConnect')
			logged.forEach(spy => spy.mockClear())
		})
	})
})
