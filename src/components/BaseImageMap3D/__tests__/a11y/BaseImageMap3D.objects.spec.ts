import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import type { Mesh, MeshStandardMaterial } from 'three'
import { useMapEnvironment } from '../imageMap3d.test-utils'
import type { ImageMap3DData } from '../../types/imageMap3dData.types'
import { fireEvent, screen, waitFor, within } from '@testing-library/vue'

const DATA: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', width: 800, height: 400, elevation: 300 },
	],
	groups: [
		{ id: 'food', title: 'Еда' },
		{ id: 'shops', title: 'Магазины' },
	],
	filters: [{ id: 'kind', title: 'Тип' }],
	objects: [
		{ id: 'hall', type: 'rect', title: 'Зал', x: 0.3, y: 0.3, width: 0.4, height: 0.4, layer: 'f1', group: 'food', height3d: 30 },
		{ id: 'kiosk', type: 'point', title: 'Киоск', x: 0.9, y: 0.5, layer: 'f1', label: 'K', group: 'food' },
		{ id: 'off', type: 'rect', title: 'Закрыто', x: 0.85, y: 0.05, width: 0.1, height: 0.1, layer: 'f1', isDisabled: true },
		{ id: 'roof', type: 'rect', title: 'Крыша', x: 0.3, y: 0.3, width: 0.4, height: 0.4, layer: 'f2' },
	],
}

const LINKS: ImageMap3DData = {
	layers: [{ id: 'f1', title: 'Этаж 1', width: 800, height: 400 }],
	objects: [
		{ id: 'hall', type: 'rect', title: 'Зал', x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
		{
			id: 'site',
			type: 'rect',
			title: 'Сайт',
			x: 0.4,
			y: 0.1,
			width: 0.2,
			height: 0.2,
			action: 'link',
			link: 'https://example.com/shop',
			isLinkExternal: true,
		},
		{ id: 'page', type: 'rect', title: 'Страница', x: 0.7, y: 0.1, width: 0.2, height: 0.2, action: 'link', link: '/page' },
		{
			id: 'closed',
			type: 'rect',
			title: 'Закрыто',
			x: 0.1,
			y: 0.5,
			width: 0.2,
			height: 0.2,
			action: 'link',
			link: '/closed',
			isDisabled: true,
		},
	],
}

const env = useMapEnvironment()

const listOf = (name: string) => within(screen.getByRole('list', { name }))
const namesOf = (name: string) =>
	listOf(name)
		.getAllByRole('button')
		.map(button => button.textContent?.trim())

describe('BaseImageMap3D: список объектов для скринридера', () => {
	it('кнопки объектов текущего этажа по порядку данных; имя списка — этаж; другой этаж — свой список', async () => {
		const { exposed } = await env.renderMap({ data: DATA })
		expect(namesOf('Список объектов, Этаж 1')).toEqual(['Зал', 'Киоск', 'Закрыто'])
		exposed.value?.setLayer('f2')
		await waitFor(() => expect(namesOf('Список объектов, Этаж 2')).toEqual(['Крыша']))
		expect(screen.queryByRole('list', { name: 'Список объектов, Этаж 1' })).toBeNull()
	})

	it('фильтр убирает объекты из списка, как и из сцены', async () => {
		const { scene } = await env.renderMap({ data: DATA, filters: { kind: ['food'] } })
		expect(namesOf('Список объектов, Этаж 1')).toEqual(['Зал', 'Киоск'])
		expect(scene().getObjectByName('off')?.visible).toBe(false)
		expect(scene().getObjectByName('hall')?.visible).toBe(true)
	})

	it('список скрыт визуально, в порядок Tab не входит; отключённый объект — aria-disabled', async () => {
		await env.renderMap({ data: DATA })
		const list = screen.getByRole('list', { name: 'Список объектов, Этаж 1' })
		expect(list).toHaveClass('base-image-map-3d__objects')
		const buttons = within(list).getAllByRole('button')
		buttons.forEach(button => expect(button).toHaveAttribute('tabindex', '-1'))
		expect(within(list).getByRole('button', { name: 'Закрыто' })).toHaveAttribute('aria-disabled', 'true')
		expect(within(list).getByRole('button', { name: 'Зал' })).not.toHaveAttribute('aria-disabled')
	})

	it('нет списка: с каталогом, без объектов и в 2D-виде', async () => {
		const first = await env.renderMap({ data: DATA, hasDirectory: true })
		expect(first.container.querySelector('.base-image-map-3d__directory')).toBeInTheDocument()
		expect(first.container.querySelector('.base-image-map-3d__objects')).toBeNull()
		first.unmount()
		const second = await env.renderMap({ data: { layers: DATA.layers, objects: [] } })
		expect(second.container.querySelector('.base-image-map-3d__objects')).toBeNull()
		second.unmount()
		const third = await env.renderMap({ data: DATA, view: '2d' })
		expect(third.container.querySelector('.base-image-map-3d__objects')).toBeNull()
	})

	it('клик по кнопке: select, update:active и окно объекта; aria-current — у выбранного', async () => {
		const onSelect = vi.fn()
		const onUpdateActive = vi.fn()
		await env.renderMap({ data: DATA, onSelect, 'onUpdate:active': onUpdateActive })
		const hall = listOf('Список объектов, Этаж 1').getByRole('button', { name: 'Зал' })
		expect(hall).not.toHaveAttribute('aria-current')
		await fireEvent.click(hall)
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'hall' }))
		expect(onUpdateActive).toHaveBeenCalledWith('hall')
		expect(await screen.findByRole('dialog', { name: 'Зал' })).toBeInTheDocument()
		await waitFor(() => expect(hall).toHaveAttribute('aria-current', 'true'))
		expect(listOf('Список объектов, Этаж 1').getByRole('button', { name: 'Киоск' })).not.toHaveAttribute('aria-current')
	})

	it('выбранный снаружи (v-model:active) объект отмечен aria-current', async () => {
		await env.renderMap({ data: DATA, active: 'kiosk' })
		const list = listOf('Список объектов, Этаж 1')
		expect(list.getByRole('button', { name: 'Киоск' })).toHaveAttribute('aria-current', 'true')
		expect(list.getByRole('button', { name: 'Зал' })).not.toHaveAttribute('aria-current')
	})

	it('отключённый объект кнопкой не выбирается', async () => {
		const onSelect = vi.fn()
		await env.renderMap({ data: DATA, onSelect })
		await fireEvent.click(listOf('Список объектов, Этаж 1').getByRole('button', { name: 'Закрыто' }))
		expect(onSelect).not.toHaveBeenCalled()
		expect(screen.queryByRole('dialog')).toBeNull()
	})

	it('фокус на кнопке — наведение: событие hover, подсветка и карточка; между кнопками и за карту', async () => {
		const onHover = vi.fn()
		const { scene, container } = await env.renderMap({ data: DATA, onHover })
		const list = listOf('Список объектов, Этаж 1')
		const base = (scene().getObjectByName('hall') as Mesh<never, MeshStandardMaterial>).material.opacity
		list.getByRole('button', { name: 'Зал' }).focus()
		expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'hall' }))
		await nextTick()
		expect(container.querySelector('[role="tooltip"]')).toHaveTextContent('Зал')
		env.flushFrames()
		expect((scene().getObjectByName('hall') as Mesh<never, MeshStandardMaterial>).material.opacity).toBeGreaterThan(base)
		const kiosk = list.getByRole('button', { name: 'Киоск' })
		kiosk.focus()
		await fireEvent.focusOut(screen.getByRole('list'), { relatedTarget: kiosk })
		expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'kiosk' }))
		await fireEvent.focusOut(screen.getByRole('list'), { relatedTarget: document.body })
		expect(onHover).toHaveBeenLastCalledWith(null)
		await nextTick()
		expect(container.querySelector('[role="tooltip"]')).toBeNull()
	})

	it('Enter в области карты открывает объект, сфокусированный кнопкой списка', async () => {
		const { region } = await env.renderMap({ data: DATA })
		listOf('Список объектов, Этаж 1').getByRole('button', { name: 'Зал' }).focus()
		await nextTick()
		region().focus()
		await fireEvent.keyDown(region(), { key: 'Enter' })
		expect(await screen.findByRole('dialog', { name: 'Зал' })).toBeInTheDocument()
	})

	it('объект с адресом — ссылка (внешняя — target и rel), окно — aria-haspopup, отключённый — кнопка', async () => {
		await env.renderMap({ data: LINKS })
		const list = listOf('Список объектов, Этаж 1')
		const site = list.getByRole('link', { name: 'Сайт (откроется в новой вкладке)' })
		expect(site).toHaveAttribute('href', 'https://example.com/shop')
		expect(site).toHaveAttribute('target', '_blank')
		expect(site).toHaveAttribute('rel', 'noopener noreferrer')
		const page = list.getByRole('link', { name: 'Страница' })
		expect(page).toHaveAttribute('href', '/page')
		expect(page).not.toHaveAttribute('target')
		expect(page).not.toHaveAttribute('rel')
		const closed = list.getByRole('button', { name: 'Закрыто' })
		expect(closed).toHaveAttribute('aria-disabled', 'true')
		expect(closed).not.toHaveAttribute('href')
		expect(list.queryByRole('link', { name: 'Закрыто' })).toBeNull()
		expect(list.getByRole('button', { name: 'Зал' })).toHaveAttribute('aria-haspopup', 'dialog')
		expect(site).not.toHaveAttribute('aria-haspopup')
	})

	it('клик по ссылке списка выбирает объект, а переход выполняет браузер', async () => {
		const open = vi.spyOn(window, 'open').mockReturnValue(null)
		const stop = (event: Event) => event.preventDefault()
		document.addEventListener('click', stop)
		const onSelect = vi.fn()
		const onUpdateActive = vi.fn()
		await env.renderMap({ data: LINKS, onSelect, 'onUpdate:active': onUpdateActive })
		await fireEvent.click(listOf('Список объектов, Этаж 1').getByRole('link', { name: 'Сайт (откроется в новой вкладке)' }))
		document.removeEventListener('click', stop)
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'site' }))
		expect(onUpdateActive).toHaveBeenCalledWith('site')
		expect(open).not.toHaveBeenCalled()
	})

	it('перерисовка списка не теряет фокус: объект с action layer, смена этажа и фильтр переводят его на область карты', async () => {
		const data: ImageMap3DData = {
			...DATA,
			objects: [
				...DATA.objects,
				{
					id: 'stairs',
					type: 'rect',
					title: 'Лестница',
					x: 0.1,
					y: 0.1,
					width: 0.1,
					height: 0.1,
					layer: 'f1',
					action: 'layer',
					targetLayer: 'f2',
				},
			],
		}
		const { region, exposed, rerender } = await env.renderMap({ data })
		listOf('Список объектов, Этаж 1').getByRole('button', { name: 'Лестница' }).focus()
		await fireEvent.click(listOf('Список объектов, Этаж 1').getByRole('button', { name: 'Лестница' }))
		await waitFor(() => expect(namesOf('Список объектов, Этаж 2')).toEqual(['Крыша']))
		await waitFor(() => expect(document.activeElement).toBe(region()))
		listOf('Список объектов, Этаж 2').getByRole('button', { name: 'Крыша' }).focus()
		exposed.value?.setLayer('f1')
		await waitFor(() => expect(document.activeElement).toBe(region()))
		listOf('Список объектов, Этаж 1').getByRole('button', { name: 'Закрыто' }).focus()
		await rerender({ data, filters: { kind: ['food'] } })
		await waitFor(() => expect(namesOf('Список объектов, Этаж 1')).toEqual(['Зал', 'Киоск']))
		expect(document.activeElement).toBe(region())
	})

	it('фокус вне списка и уцелевшая кнопка не трогаются при перерисовке', async () => {
		const { exposed, rerender } = await env.renderMap({ data: DATA })
		const outside = document.createElement('button')
		document.body.append(outside)
		outside.focus()
		exposed.value?.setLayer('f2')
		await waitFor(() => expect(namesOf('Список объектов, Этаж 2')).toEqual(['Крыша']))
		expect(document.activeElement).toBe(outside)
		outside.remove()
		exposed.value?.setLayer('f1')
		await waitFor(() => expect(namesOf('Список объектов, Этаж 1')).toHaveLength(3))
		const hall = listOf('Список объектов, Этаж 1').getByRole('button', { name: 'Зал' })
		hall.focus()
		await rerender({ data: DATA, filters: { kind: ['food'] } })
		await waitFor(() => expect(namesOf('Список объектов, Этаж 1')).toEqual(['Зал', 'Киоск']))
		expect(document.activeElement).toBe(hall)
	})

	it('те же объекты в 2D и в 3D: названия кнопок списка и областей 2D совпадают, выбор сохраняется', async () => {
		const { container } = await env.renderMap({ data: DATA, has2dToggle: true, defaultAction: 'none' })
		const names3d = namesOf('Список объектов, Этаж 1')
		await fireEvent.click(listOf('Список объектов, Этаж 1').getByRole('button', { name: 'Зал' }))
		await fireEvent.click(within(screen.getByRole('radiogroup', { name: 'Вид карты' })).getByRole('radio', { name: '2D' }))
		const map = container.querySelector('.base-image-map') as HTMLElement
		const names2d = [...map.querySelectorAll('[data-image-map-object]')].map(
			element => element.getAttribute('aria-label') ?? element.textContent?.trim(),
		)
		expect([...names2d].sort()).toEqual([...names3d].sort())
		expect(map.querySelector('[data-image-map-object="hall"]')).toHaveClass('base-image-map__object--active')
	})
})
