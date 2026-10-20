import '@testing-library/jest-dom/vitest'
import { Group } from 'three'
import { fireEvent, screen, waitFor, within } from '@testing-library/vue'
import { LONE_DATA, T, nodeOf, tagOf, useEditHarness, viewport } from '../helpers/editHarness.test-utils'

const { env, mountEdit } = useEditHarness()

const notice = () => document.querySelector('.base-flow-map-3d__notice')
const inspector = () => screen.getByRole('region', { name: T.INSPECTOR })
const palette = () => screen.getByRole('dialog', { name: T.PALETTE_TITLE })
const swap = () => screen.getByRole('button', { name: new RegExp(T.EDIT_SWAP) })
const openPalette = async (): Promise<void> => {
	await fireEvent.click(swap())
	await screen.findByRole('dialog', { name: T.PALETTE_TITLE })
}

describe('BaseFlowMap3D «Правка»: панель инструментов', () => {
	it('кнопки недоступны без выбора и работают с выбранным узлом', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		expect(screen.getByRole('button', { name: new RegExp(T.EDIT_ROTATE) })).toBeDisabled()
		await map.select('a')
		await fireEvent.click(screen.getByRole('button', { name: new RegExp(T.EDIT_ROTATE) }))
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.rotation).toBe(90))
		await waitFor(() => expect(notice()).toHaveTextContent('Узел повёрнут: 90°'))
		await fireEvent.click(screen.getByRole('button', { name: new RegExp(T.EDIT_REMOVE) }))
		await waitFor(() => expect(nodeOf(map.data(), 'a')).toBeUndefined())
	})

	it('несколько узлов: имя «Узлов: 2», поворот одним шагом истории', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await map.select('a', 'b')
		expect(document.querySelector('.base-flow-map-3d__edit-name')).toHaveTextContent('Узлов: 2')
		await map.press('r')
		await waitFor(() => expect(nodeOf(map.data(), 'b')?.model3d?.rotation).toBe(90))
		expect(nodeOf(map.data(), 'a')?.model3d?.rotation).toBe(90)
		await waitFor(() => expect(within(inspector()).getByRole('button', { name: T.UNDO })).toBeEnabled())
		await fireEvent.click(within(inspector()).getByRole('button', { name: T.UNDO }))
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.rotation).toBeUndefined())
		expect(nodeOf(map.data(), 'b')?.model3d?.rotation).toBeUndefined()
		await waitFor(() => expect(within(inspector()).getByRole('button', { name: T.REDO })).toBeEnabled())
		await fireEvent.click(within(inspector()).getByRole('button', { name: T.REDO }))
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.rotation).toBe(90))
	})
})

describe('BaseFlowMap3D «Правка»: замена модели', () => {
	it('палитра открывается кнопкой, выбор ключа заменяет модель и закрывает палитру', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await map.select('a')
		await openPalette()
		expect(swap()).toHaveAttribute('aria-expanded', 'true')
		const cells = within(palette()).getAllByRole('button', { pressed: false })
		const cell = cells.find(item => item.className.includes('palette-cell'))!
		await fireEvent.click(cell)
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.model).toBeTruthy())
		await waitFor(() => expect(screen.queryByRole('dialog', { name: T.PALETTE_TITLE })).toBeNull())
		await waitFor(() => expect(notice()).toHaveTextContent('Модель заменена'))
	})

	it('Escape закрывает палитру, крестик тоже', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await map.select('a')
		await openPalette()
		await map.press('Escape')
		expect(screen.queryByRole('dialog', { name: T.PALETTE_TITLE })).toBeNull()
		await openPalette()
		await fireEvent.click(within(palette()).getByRole('button', { name: T.PALETTE_CLOSE }))
		expect(screen.queryByRole('dialog', { name: T.PALETTE_TITLE })).toBeNull()
		await openPalette()
		await fireEvent.keyDown(palette(), { key: 'Escape' })
		expect(screen.queryByRole('dialog', { name: T.PALETTE_TITLE })).toBeNull()
		await map.press('Escape')
	})

	it('свой GLB: адрес принимается, узел получает `url`; неверный адрес — предупреждение', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await map.select('a')
		await openPalette()
		const field = within(palette()).getByLabelText(T.PALETTE_URL)
		await fireEvent.update(field, 'ftp://x.example/model.glb')
		await fireEvent.click(within(palette()).getByRole('button', { name: T.PALETTE_LOAD }))
		await waitFor(() => expect(notice()).toHaveTextContent(T.PALETTE_URL_INVALID))
		await fireEvent.update(field, '')
		await fireEvent.click(within(palette()).getByRole('button', { name: T.PALETTE_LOAD }))
		await fireEvent.update(field, '  https://cdn.example.ru/own.glb ')
		await fireEvent.click(within(palette()).getByRole('button', { name: T.PALETTE_LOAD }))
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.url).toBe('https://cdn.example.ru/own.glb'))
	})

	it('палитра перечисляет модели схемы и «ещё в реестре» с текущей отметкой', async () => {
		const map = await mountEdit({ data: LONE_DATA, models: { custom: { create: () => new Group() } } as never })
		await map.select('a')
		await openPalette()
		expect(within(palette()).getByText(T.PALETTE_SCHEME)).toBeInTheDocument()
		expect(within(palette()).getByText(T.PALETTE_MORE)).toBeInTheDocument()
		expect(within(palette()).getAllByRole('button', { pressed: true }).length).toBeGreaterThan(0)
	})
})

describe('BaseFlowMap3D «Правка»: свойства узла', () => {
	it('название, статус и акцент меняют данные узла', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await map.select('a')
		const name = within(inspector()).getByDisplayValue('Один')
		await fireEvent.update(name, 'Новое имя')
		await fireEvent.change(name)
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.label).toBe('Новое имя'))
		await fireEvent.update(name, 'Новое имя')
		await fireEvent.change(name)
		await fireEvent.update(name, '   ')
		await fireEvent.change(name)
		expect(nodeOf(map.data(), 'a')?.label).toBe('Новое имя')
		await fireEvent.click(within(inspector()).getByRole('radio', { name: T.STATUS_WARNING }))
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.status).toBe('warning'))
		const swatch = within(inspector()).getByRole('radio', { name: 'Цвет 2' })
		await fireEvent.click(swatch)
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.tint).toBe('var(--rise-chart-2)'))
		await fireEvent.click(within(inspector()).getByRole('radio', { name: 'Цвет 2' }))
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.tint).toBeUndefined())
	})

	it('масштаб и подъём меняют положение; нулевой масштаб и отрицательный подъём отвергаются', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await map.select('a')
		const scale = within(inspector()).getByLabelText(T.FIELD_SCALE)
		await fireEvent.update(scale, '2')
		await fireEvent.blur(scale)
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.scale).toBe(2))
		const lift = within(inspector()).getByLabelText(T.FIELD_ELEVATION)
		await fireEvent.update(lift, '1.5')
		await fireEvent.blur(lift)
		await waitFor(() => expect(nodeOf(map.data(), 'a')?.model3d?.elevation).toBe(1.5))
		await fireEvent.update(scale, '0')
		await fireEvent.blur(scale)
		await fireEvent.update(lift, '')
		await fireEvent.blur(lift)
		expect(nodeOf(map.data(), 'a')?.model3d?.scale).not.toBe(0)
	})

	it('пустой выбор — подсказка «Выберите узел»; кнопка «Повернуть» в разделе 3D тоже работает', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		expect(within(inspector()).getByText(T.INSPECTOR_EMPTY)).toBeInTheDocument()
		await map.select('b')
		await fireEvent.click(within(inspector()).getByRole('button', { name: T.POSITION_ROTATE }))
		await waitFor(() => expect(nodeOf(map.data(), 'b')?.model3d?.rotation).toBe(90))
		await fireEvent.click(within(inspector()).getByRole('button', { name: T.MODEL_REPLACE }))
		expect(await screen.findByRole('dialog', { name: T.PALETTE_TITLE })).toBeInTheDocument()
	})

	it('выделение, снятое при выходе из «Правки», убирает панели; кнопка «Правка» в панели режимов их возвращает', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await map.select('a')
		await openPalette()
		await fireEvent.click(screen.getByRole('button', { name: T.EDIT, pressed: true }))
		await waitFor(() => expect(screen.queryByRole('toolbar', { name: T.EDIT_TOOLBAR })).toBeNull())
		expect(screen.queryByRole('dialog', { name: T.PALETTE_TITLE })).toBeNull()
		await fireEvent.click(screen.getByRole('button', { name: T.EDIT }))
		await waitFor(() => expect(screen.getByRole('toolbar', { name: T.EDIT_TOOLBAR })).toBeInTheDocument())
		expect(tagOf(map.container, 'a')).toBeInTheDocument()
	})
})

describe('BaseFlowMap3D «Правка»: порог 768 px и 2D-правка', () => {
	it('на 768 px и шире — правка в 3D; уже — в 2D со вставкой «3D» в инспекторе', async () => {
		const wide = await mountEdit({ data: LONE_DATA })
		expect(screen.getByRole('toolbar', { name: T.EDIT_TOOLBAR })).toBeInTheDocument()
		wide.unmount()
		env.size.width = 700
		const map = await env.renderMap({ data: LONE_DATA, mode: 'edit', modes: ['view', 'edit'] }, {}, { isRenderer: false })
		await waitFor(() => expect(map.container.querySelector('.base-flow-map')).toBeInTheDocument(), { timeout: 8000 })
		expect(screen.queryByRole('toolbar', { name: T.EDIT_TOOLBAR })).toBeNull()
		map.api().select(['a'])
		await waitFor(() => expect(screen.getAllByText(T.SECTION_3D).length).toBeGreaterThan(0), { timeout: 8000 })
		await waitFor(() => expect(screen.getAllByRole('button', { name: T.POSITION_ROTATE }).length).toBeGreaterThan(0), { timeout: 8000 })
		await fireEvent.click(screen.getAllByRole('button', { name: T.POSITION_ROTATE })[0])
		await waitFor(() => expect(nodeOf(map.api().getData(), 'a')?.model3d?.rotation).toBe(90))
		const lift = screen.getAllByLabelText(T.FIELD_ELEVATION)[0]
		await fireEvent.update(lift, '2')
		await fireEvent.blur(lift)
		await waitFor(() => expect(nodeOf(map.api().getData(), 'a')?.model3d?.elevation).toBe(2))
		const scale = screen.getAllByLabelText(T.FIELD_SCALE)[0]
		await fireEvent.update(scale, '3')
		await fireEvent.blur(scale)
		await waitFor(() => expect(nodeOf(map.api().getData(), 'a')?.model3d?.scale).toBe(3))
		await fireEvent.click(screen.getAllByRole('radio', { name: 'Цвет 1' })[0])
		await waitFor(() => expect(nodeOf(map.api().getData(), 'a')?.model3d?.tint).toBe('var(--rise-chart-1)'))
	}, 30_000)
	it('клики и нажатия по панелям правки не доходят до сцены', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await map.select('a')
		await openPalette()
		const targets = [palette(), inspector(), document.querySelector('.base-flow-map-3d__panels'), swap()] as HTMLElement[]
		const reach = vi.fn()
		const host = viewport()
		host.addEventListener('click', reach)
		host.addEventListener('pointerdown', reach)
		for (const target of targets) {
			await fireEvent.pointerDown(target)
			await fireEvent.click(target)
		}
		expect(reach).not.toHaveBeenCalled()
	})
})
