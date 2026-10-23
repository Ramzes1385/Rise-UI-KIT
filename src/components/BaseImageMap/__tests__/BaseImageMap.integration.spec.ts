import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import BaseImageMap from '../ui/BaseImageMap.vue'
import userEvent from '@testing-library/user-event'
import type { ImageMapData } from '../types/imageMapData.types'
import { IMAGE_MAP_FLOORS, IMAGE_MAP_HOTSPOTS } from '../stories/fixtures'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'
import { mockRects, mockViewport, objectElement, SIMPLE_DATA, stageTransform } from './imageMap.test-utils'

const data = IMAGE_MAP_HOTSPOTS
const BASE_PROPS = { hasZoomControls: false, hasFullscreen: false }

const HOTSPOT_RECTS = {
	peak: { left: 214, top: 225, width: 20, height: 20 },
	sun: { left: 566, top: 150, width: 20, height: 20 },
	lake: { left: 300, top: 410, width: 200, height: 60 },
	forest: { left: 30, top: 350, width: 160, height: 110 },
	ridge: { left: 416, top: 250, width: 352, height: 120 },
	closed: { left: 710, top: 300, width: 20, height: 20 },
}

function tooltip(): HTMLElement | null {
	return document.querySelector('.base-image-map__tooltip')
}

describe('BaseImageMap integration — клавиатура', () => {
	it('первый объект достижим по Tab, Enter выбирает его', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseImageMap, { props: { data, defaultAction: 'none', ...BASE_PROPS } })
		await user.tab()
		expect(screen.getByRole('button', { name: 'Вершина' })).toHaveFocus()
		await user.keyboard('{Enter}')
		expect(emitted().select).toHaveLength(1)
	})

	it('в карте одна точка Tab: следующий Tab уходит из карты', async () => {
		const user = userEvent.setup()
		render(BaseImageMap, { props: { data: SIMPLE_DATA, defaultAction: 'none', ...BASE_PROPS } })
		await user.tab()
		await user.tab()
		expect(document.body).toHaveFocus()
	})

	it('стрелки ведут к ближайшему объекту в направлении, Home/End — к первому и последнему доступному', async () => {
		mockRects(HOTSPOT_RECTS)
		const user = userEvent.setup()
		const { container } = render(BaseImageMap, { props: { data, defaultAction: 'none', ...BASE_PROPS } })
		await user.tab()
		await user.keyboard('{ArrowRight}')
		expect(screen.getByRole('button', { name: 'Солнце' })).toHaveFocus()
		expect(objectElement(container, 'sun')).toHaveAttribute('tabindex', '0')
		expect(objectElement(container, 'peak')).toHaveAttribute('tabindex', '-1')
		await user.keyboard('{ArrowLeft}')
		expect(screen.getByRole('button', { name: 'Вершина' })).toHaveFocus()
		await user.keyboard('{ArrowDown}')
		expect(screen.getByRole('button', { name: 'Лес' })).toHaveFocus()
		await user.keyboard('{ArrowUp}')
		expect(screen.getByRole('button', { name: 'Вершина' })).toHaveFocus()
		await user.keyboard('{End}')
		expect(screen.getByRole('link', { name: 'Хребет' })).toHaveFocus()
		await user.keyboard('{Home}')
		expect(screen.getByRole('button', { name: 'Вершина' })).toHaveFocus()
	})

	it('стрелка без объекта в направлении оставляет фокус; недоступный объект пропускается', async () => {
		mockRects(HOTSPOT_RECTS)
		const user = userEvent.setup()
		render(BaseImageMap, { props: { data, defaultAction: 'none', ...BASE_PROPS } })
		await user.tab()
		await user.keyboard('{End}{ArrowRight}')
		expect(screen.getByRole('link', { name: 'Хребет' })).toHaveFocus()
	})

	it('Enter и Space на фигуре активируют её; на недоступной — ничего', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseImageMap, { props: { data, defaultAction: 'none', ...BASE_PROPS } })
		screen.getByRole('button', { name: 'Лес' }).focus()
		await user.keyboard('{Enter}')
		await user.keyboard(' ')
		expect(emitted().select).toHaveLength(2)
		expect(emitted()['update:active']).toEqual([['forest']])
		screen.getByRole('button', { name: 'Закрытая трасса' }).focus()
		await user.keyboard('{Enter}')
		expect(emitted().select).toHaveLength(2)
	})

	it('Enter на нативной кнопке выбирает объект ровно один раз', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseImageMap, { props: { data, defaultAction: 'none', ...BASE_PROPS } })
		screen.getByRole('button', { name: 'Солнце' }).focus()
		await user.keyboard('{Enter}')
		expect(emitted().select).toHaveLength(1)
	})

	it('объект svg без элемента в разметке не участвует в Tab и Home/End', async () => {
		const missing: ImageMapData = {
			...SIMPLE_DATA,
			objects: [...SIMPLE_DATA.objects, { id: 'ghost', type: 'svg', title: 'Нет элемента', elementId: 'nope' }],
		}
		const user = userEvent.setup()
		const { container } = render(BaseImageMap, { props: { data: missing, ...BASE_PROPS } })
		await user.tab()
		expect(screen.getByRole('button', { name: 'Точка А' })).toHaveFocus()
		await user.keyboard('{End}')
		expect(screen.getByRole('button', { name: 'Точка Б' })).toHaveFocus()
		await user.keyboard('{Home}')
		expect(screen.getByRole('button', { name: 'Точка А' })).toHaveFocus()
		const stray = document.createElement('span')
		stray.setAttribute('data-image-map-object', 'stray')
		container.querySelector('.base-image-map__viewport')?.append(stray)
		await fireEvent.keyDown(stray, { key: 'ArrowRight' })
		expect(screen.getByRole('button', { name: 'Точка А' })).toHaveFocus()
	})
})

describe('BaseImageMap integration — подсказка и hover', () => {
	it('наведение мышью показывает подсказку и эмитит hover; уход — скрывает через 150 мс', async () => {
		vi.useFakeTimers()
		const { container, emitted } = render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		const stage = container.querySelector('.base-image-map__stage') as HTMLElement
		await fireEvent.pointerOver(objectElement(container, 'peak'), { pointerType: 'mouse' })
		expect(emitted().hover).toEqual([[expect.objectContaining({ id: 'peak' })]])
		expect(objectElement(container, 'peak')).toHaveClass('base-image-map__object--hover')
		const card = tooltip() as HTMLElement
		expect(within(card).getByText('Вершина')).toBeInTheDocument()
		expect(within(card).getByText('Сервис')).toBeInTheDocument()
		expect(within(card).getByText(/Смотровая площадка/)).toBeInTheDocument()
		expect(within(card).queryByRole('link')).toBeNull()
		await fireEvent.pointerLeave(stage)
		expect(emitted().hover[1]).toEqual([null])
		expect(tooltip()).not.toBeNull()
		await vi.advanceTimersByTimeAsync(150)
		expect(tooltip()).toBeNull()
		vi.useRealTimers()
	})

	it('наведение на подсказку отменяет скрытие, уход с неё — скрывает', async () => {
		vi.useFakeTimers()
		const { container } = render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		await fireEvent.pointerOver(objectElement(container, 'sun'), { pointerType: 'mouse' })
		await fireEvent.pointerLeave(container.querySelector('.base-image-map__stage') as HTMLElement)
		await fireEvent.mouseEnter(tooltip() as HTMLElement)
		await vi.advanceTimersByTimeAsync(300)
		expect(tooltip()).not.toBeNull()
		await fireEvent.mouseLeave(tooltip() as HTMLElement)
		await vi.advanceTimersByTimeAsync(150)
		expect(tooltip()).toBeNull()
		vi.useRealTimers()
	})

	it('касание пальцем не показывает подсказку; повторное наведение на тот же объект не эмитит hover', async () => {
		const { container, emitted } = render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		await fireEvent.pointerOver(objectElement(container, 'peak'), { pointerType: 'touch' })
		expect(emitted().hover).toBeUndefined()
		await fireEvent.pointerOver(objectElement(container, 'peak'), { pointerType: 'mouse' })
		await fireEvent.pointerOver(objectElement(container, 'peak'), { pointerType: 'mouse' })
		expect(emitted().hover).toHaveLength(1)
	})

	it('фокус показывает подсказку; уход фокуса на другой объект её не сбрасывает, за пределы карты — сбрасывает', async () => {
		const { container, emitted } = render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		await fireEvent.focusIn(objectElement(container, 'lake'))
		expect(within(tooltip() as HTMLElement).getByText('Прокат лодок')).toBeInTheDocument()
		await fireEvent.focusOut(objectElement(container, 'lake'), { relatedTarget: objectElement(container, 'sun') })
		expect(emitted().hover).toHaveLength(1)
		await fireEvent.focusOut(objectElement(container, 'lake'), { relatedTarget: document.body })
		expect(emitted().hover[1]).toEqual([null])
	})

	it('фокус на элементе карты без объекта не меняет hover', async () => {
		const { container, emitted } = render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		await fireEvent.focusIn(container.querySelector('.base-image-map__stage') as HTMLElement)
		expect(emitted().hover).toBeUndefined()
	})

	it('Escape закрывает подсказку', async () => {
		const user = userEvent.setup()
		render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		await user.tab()
		expect(tooltip()).not.toBeNull()
		await user.keyboard('{Escape}')
		expect(tooltip()).toBeNull()
	})

	it('hasTooltip=false и isTooltipHidden отключают подсказку, hover всё равно эмитится', async () => {
		const hidden: ImageMapData = { ...SIMPLE_DATA, objects: [{ ...SIMPLE_DATA.objects[0], isTooltipHidden: true }] }
		const { container, emitted, unmount } = render(BaseImageMap, { props: { data: hidden, ...BASE_PROPS } })
		await fireEvent.pointerOver(objectElement(container, 'a'), { pointerType: 'mouse' })
		expect(emitted().hover).toHaveLength(1)
		expect(tooltip()).toBeNull()
		unmount()
		const second = render(BaseImageMap, { props: { data, hasTooltip: false, ...BASE_PROPS } })
		await fireEvent.pointerOver(objectElement(second.container, 'peak'), { pointerType: 'mouse' })
		expect(tooltip()).toBeNull()
	})

	it('наведение на элемент с неизвестным id и на объект без разметки подсказку не показывает', async () => {
		const { container, emitted } = render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		const stage = container.querySelector('.base-image-map__stage') as HTMLElement
		await fireEvent.pointerOver(objectElement(container, 'peak'), { pointerType: 'mouse' })
		const stray = document.createElement('span')
		stray.setAttribute('data-image-map-object', 'stray')
		stage.append(stray)
		await fireEvent.pointerOver(stray, { pointerType: 'mouse' })
		expect(emitted().hover[1]).toEqual([null])
		expect(tooltip()).toBeNull()
		vi.spyOn(stage, 'querySelector').mockReturnValue(null)
		await fireEvent.pointerOver(objectElement(container, 'sun'), { pointerType: 'mouse' })
		expect(tooltip()).toBeNull()
	})

	it('слот tooltip получает объект и группу', async () => {
		const { container } = render(BaseImageMap, {
			props: { data, ...BASE_PROPS },
			slots: {
				tooltip: (props: { object: { title: string }; group?: { title: string } }) =>
					h('i', `${props.object.title} / ${props.group?.title}`),
			},
		})
		await fireEvent.pointerOver(objectElement(container, 'sun'), { pointerType: 'mouse' })
		expect(screen.getByText('Солнце / Кафе и рестораны')).toBeInTheDocument()
	})

	it('подсказка стоит над объектом: якорь по его прямоугольнику относительно карты', async () => {
		mockRects(HOTSPOT_RECTS)
		const { container } = render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		await fireEvent.pointerOver(objectElement(container, 'lake'), { pointerType: 'mouse' })
		const anchor = document.querySelector('.base-image-map__anchor') as HTMLElement
		expect(anchor.style).toMatchObject({ left: '300px', top: '410px', width: '200px', height: '60px' })
	})
})

describe('BaseImageMap integration — окно объекта', () => {
	it('клик открывает окно с заголовком и содержимым, Escape закрывает и возвращает фокус', async () => {
		const user = userEvent.setup()
		render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		const peak = screen.getByRole('button', { name: 'Вершина' })
		await user.click(peak)
		const dialog = await screen.findByRole('dialog', { name: 'Вершина' })
		expect(within(dialog).getByText('Сервис')).toBeInTheDocument()
		expect(within(dialog).getByText(/Подъёмник работает/)).toBeInTheDocument()
		expect(within(dialog).getByRole('link', { name: 'Расписание' })).toBeInTheDocument()
		expect(tooltip()).toBeNull()
		await user.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Вершина' })).toBeNull())
		await waitFor(() => expect(peak).toHaveFocus())
	})

	it('после закрытия окна фигуры фокус возвращается на SVG-элемент', async () => {
		const user = userEvent.setup()
		render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		const lake = screen.getByRole('button', { name: 'Озеро' })
		lake.focus()
		await user.keyboard('{Enter}')
		const dialog = await screen.findByRole('dialog', { name: 'Озеро' })
		await user.click(within(dialog).getByRole('button', { name: 'Закрыть' }))
		await waitFor(() => expect(lake).toHaveFocus())
	})

	it('закрытие окна, когда объекта уже нет на экране, не переносит фокус', async () => {
		const user = userEvent.setup()
		const { rerender } = render(BaseImageMap, { props: { data: IMAGE_MAP_FLOORS, hasFullscreen: false } })
		await user.click(await screen.findByRole('button', { name: 'Магазин 101' }))
		const dialog = await screen.findByRole('dialog', { name: 'Магазин 101' })
		await rerender({ data: IMAGE_MAP_FLOORS, hasFullscreen: false, layer: 'floor-2' })
		await user.click(within(dialog).getByRole('button', { name: 'Закрыть' }))
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Магазин 101' })).toBeNull())
		expect(screen.queryByRole('button', { name: 'Магазин 101' })).toBeNull()
	})

	it('содержимое окна: картинка, видео, внешние ссылки; неизвестная группа не выводится', async () => {
		const rich: ImageMapData = {
			...SIMPLE_DATA,
			objects: [
				{
					id: 'a',
					type: 'point',
					title: 'Музей',
					x: 0.1,
					y: 0.1,
					group: 'unknown',
					image: 'museum.png',
					imageAlt: 'Фасад',
					video: 'tour.mp4',
					links: [{ label: 'Сайт', href: 'https://example.com', isExternal: true }],
				},
			],
		}
		const user = userEvent.setup()
		render(BaseImageMap, { props: { data: rich, ...BASE_PROPS } })
		await user.click(screen.getByRole('button', { name: 'Музей' }))
		const dialog = await screen.findByRole('dialog', { name: 'Музей' })
		expect(within(dialog).getByRole('img', { name: 'Фасад' })).toHaveAttribute('src', 'museum.png')
		expect(dialog.querySelector('video')).toHaveAttribute('src', 'tour.mp4')
		expect(dialog.querySelector('video')).toHaveAttribute('controls')
		expect(within(dialog).getByRole('link', { name: /Сайт/ })).toHaveAttribute('target', '_blank')
		expect(dialog.querySelector('.base-image-map-card__group')).toBeNull()
		expect(dialog.querySelector('.base-image-map-card__title')).toBeNull()
	})

	it('в подсказке нет видео, но есть заголовок; картинка без imageAlt — декоративная', async () => {
		const rich: ImageMapData = {
			...SIMPLE_DATA,
			objects: [{ id: 'a', type: 'point', title: 'Музей', x: 0.1, y: 0.1, image: 'x.png', video: 'tour.mp4' }],
		}
		const { container } = render(BaseImageMap, { props: { data: rich, ...BASE_PROPS } })
		await fireEvent.pointerOver(objectElement(container, 'a'), { pointerType: 'mouse' })
		const card = tooltip() as HTMLElement
		expect(card.querySelector('video')).toBeNull()
		expect(card.querySelector('img')).toHaveAttribute('alt', '')
		expect(card.querySelector('.base-image-map-card__title')).toHaveTextContent('Музей')
		expect(card.querySelector('.base-image-map-card__links')).toBeNull()
	})

	it('узкий экран — нижняя панель вместо окна', async () => {
		const width = window.innerWidth
		window.innerWidth = 500
		const user = userEvent.setup()
		render(BaseImageMap, { props: { data, ...BASE_PROPS, customClass: { popup: 'my-popup' } } })
		await user.click(screen.getByRole('button', { name: 'Солнце' }))
		const dialog = await screen.findByRole('dialog', { name: 'Солнце' })
		expect(dialog.closest('[class*="base-drawer"]')).not.toBeNull()
		expect(document.querySelector('.my-popup')).not.toBeNull()
		window.innerWidth = width
	})

	it('sheetBreakpoint=0 — всегда обычное окно', async () => {
		const user = userEvent.setup()
		render(BaseImageMap, { props: { data, ...BASE_PROPS, sheetBreakpoint: 0 } })
		await user.click(screen.getByRole('button', { name: 'Солнце' }))
		const dialog = await screen.findByRole('dialog', { name: 'Солнце' })
		expect(dialog.closest('[class*="base-drawer"]')).toBeNull()
	})

	it('слот popup получает объект, группу и close', async () => {
		const user = userEvent.setup()
		render(BaseImageMap, {
			props: { data, ...BASE_PROPS },
			slots: {
				popup: (props: { object: { title: string }; group?: { title: string }; close: () => void }) =>
					h('button', { type: 'button', onClick: props.close }, `Закрыть ${props.object.title} (${props.group?.title})`),
			},
		})
		await user.click(screen.getByRole('button', { name: 'Солнце' }))
		await user.click(await screen.findByRole('button', { name: 'Закрыть Солнце (Кафе и рестораны)' }))
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Солнце' })).toBeNull())
	})
})

describe('BaseImageMap integration — действия и v-model', () => {
	it('select эмитится на каждый выбор, update:active — один раз на новый объект', async () => {
		const { emitted } = render(BaseImageMap, { props: { data, defaultAction: 'none', ...BASE_PROPS } })
		await fireEvent.click(screen.getByRole('button', { name: 'Солнце' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Солнце' }))
		expect(emitted().select).toEqual([[expect.objectContaining({ id: 'sun' })], [expect.objectContaining({ id: 'sun' })]])
		expect(emitted()['update:active']).toEqual([['sun']])
	})

	it('клик по недоступному объекту и по пустому месту ничего не выбирает', async () => {
		const { container, emitted } = render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		await fireEvent.click(screen.getByRole('button', { name: 'Закрытая трасса' }))
		await fireEvent.click(container.querySelector('.base-image-map__stage') as HTMLElement)
		expect(emitted().select).toBeUndefined()
		expect(screen.queryByRole('dialog')).toBeNull()
	})

	it('ссылка-фигура переходит по адресу, внешняя — открывает новую вкладку, точка-ссылка — нативно', async () => {
		const external: ImageMapData = {
			...SIMPLE_DATA,
			objects: [
				{
					id: 'r',
					type: 'rect',
					title: 'Партнёр',
					x: 0,
					y: 0,
					width: 0.1,
					height: 0.1,
					action: 'link',
					link: 'https://example.com',
					isLinkExternal: true,
				},
				{ id: 'p', type: 'point', title: 'Якорь', x: 0.5, y: 0.5, action: 'link', link: '#anchor' },
			],
		}
		const { unmount } = render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		await fireEvent.click(screen.getByRole('link', { name: 'Хребет' }))
		expect(window.location.hash).toBe('#ridge')
		unmount()
		render(BaseImageMap, { props: { data: external, ...BASE_PROPS } })
		await fireEvent.click(screen.getByRole('link', { name: 'Партнёр' }))
		expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer')
		vi.mocked(window.open).mockClear()
		const click = new MouseEvent('click', { bubbles: true, cancelable: true })
		screen.getByRole('link', { name: 'Якорь' }).dispatchEvent(click)
		expect(click.defaultPrevented).toBe(false)
		expect(window.open).not.toHaveBeenCalled()
	})

	it('опасная ссылка превращается в действие none', async () => {
		const unsafe: ImageMapData = {
			...SIMPLE_DATA,
			objects: [{ id: 'x', type: 'point', title: 'Опасная', x: 0, y: 0, action: 'link', link: 'javascript:alert(1)' }],
		}
		const { emitted } = render(BaseImageMap, { props: { data: unsafe, ...BASE_PROPS } })
		const target = screen.getByRole('button', { name: 'Опасная' })
		expect(target).not.toHaveAttribute('href')
		await fireEvent.click(target)
		expect(emitted().select).toHaveLength(1)
		expect(screen.queryByRole('dialog')).toBeNull()
	})

	it('объекты SVG этажа — кнопки; лифт переводит на следующий этаж', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseImageMap, { props: { data: IMAGE_MAP_FLOORS, hasFullscreen: false } })
		const lift = await screen.findByRole('button', { name: 'Лифт на этаж 2' })
		await user.click(lift)
		expect(emitted()['layer-change']).toEqual([['floor-2']])
		expect(emitted()['update:layer']).toEqual([['floor-2']])
		expect(await screen.findByRole('button', { name: 'Магазин 201' })).toBeInTheDocument()
		expect(screen.getByRole('radio', { name: '2' })).toBeChecked()
	})

	it('переключатель этажей меняет слой; проп layer управляет слоем, неизвестный — первый слой', async () => {
		const user = userEvent.setup()
		const { emitted, rerender } = render(BaseImageMap, { props: { data: IMAGE_MAP_FLOORS, hasFullscreen: false } })
		await user.click(screen.getByRole('radio', { name: '3' }))
		expect(emitted()['layer-change']).toEqual([['floor-3']])
		expect(await screen.findByRole('button', { name: 'Магазин 301' })).toBeInTheDocument()
		expect(screen.getByRole('region', { name: 'Этаж 3' })).toBeInTheDocument()
		await rerender({ data: IMAGE_MAP_FLOORS, hasFullscreen: false, layer: 'floor-2' })
		expect(await screen.findByRole('button', { name: 'Магазин 201' })).toBeInTheDocument()
		await rerender({ data: IMAGE_MAP_FLOORS, hasFullscreen: false, layer: 'cellar' })
		expect(screen.getByRole('region', { name: 'Этаж 1' })).toBeInTheDocument()
	})

	it('повторный выбор текущего этажа ничего не эмитит', async () => {
		const { emitted } = render(BaseImageMap, { props: { data: IMAGE_MAP_FLOORS, hasFullscreen: false } })
		await fireEvent.click(screen.getByRole('radio', { name: '1' }))
		expect(emitted()['layer-change']).toBeUndefined()
	})

	it('hasZoomToActive приближает к выбранному объекту', async () => {
		mockViewport()
		const { container } = render(BaseImageMap, { props: { data, defaultAction: 'none', hasZoomToActive: true, ...BASE_PROPS } })
		expect(stageTransform(container)).toBe('translate(0px, 0px) scale(1)')
		await fireEvent.click(screen.getByRole('button', { name: 'Солнце' }))
		await waitFor(() => expect(stageTransform(container)).toContain('scale(2)'))
		expect(container.querySelector('.base-image-map__stage')).toHaveClass('base-image-map__stage--animated')
	})

	it('hasZoomToActive не приближает при действии layer', async () => {
		mockViewport()
		const user = userEvent.setup()
		const { container } = render(BaseImageMap, { props: { data: IMAGE_MAP_FLOORS, hasZoomToActive: true, hasFullscreen: false } })
		await user.click(await screen.findByRole('button', { name: 'Лифт на этаж 2' }))
		expect(stageTransform(container)).toContain('scale(1)')
	})
})
