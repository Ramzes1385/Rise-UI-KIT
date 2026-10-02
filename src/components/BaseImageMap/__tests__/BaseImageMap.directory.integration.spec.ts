import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import BaseImageMap from '../ui/BaseImageMap.vue'
import userEvent from '@testing-library/user-event'
import { getLocale, pluralize } from '@/locales/state'
import { IMAGE_MAP_HOTSPOTS } from '../stories/fixtures'
import { UI_IMAGE_MAP, UI_TEXT } from '@/locales/messages'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'
import { DIRECTORY_PROPS, directoryData, entryIds, entryOf, objectOf } from './imageMapDirectory.test-utils'

function renderMap(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
	return render(BaseImageMap, { props: { data: directoryData(), ...DIRECTORY_PROPS, ...props }, slots })
}

function directory(): HTMLElement {
	return screen.getByRole('complementary', { name: UI_IMAGE_MAP.DIRECTORY })
}

function found(count: number): string {
	return pluralize(getLocale().plural.SEARCH_RESULTS, count)
}

function status(): HTMLElement {
	return within(directory()).getByRole('status')
}

describe('BaseImageMap directory — список', () => {
	it('без hasDirectory списка нет, старый формат данных работает', async () => {
		const { container } = render(BaseImageMap, { props: { data: IMAGE_MAP_HOTSPOTS, hasZoomControls: false, hasFullscreen: false } })
		expect(screen.queryByRole('complementary')).toBeNull()
		expect(screen.queryByRole('list', { name: UI_IMAGE_MAP.LEGEND })).toBeNull()
		expect(container.querySelector('.base-image-map__layout')).not.toHaveClass('base-image-map__layout--with-directory')
		expect(screen.getByRole('button', { name: 'Вершина' })).toBeInTheDocument()
		expect(container.querySelector('.base-image-map__object--filtered')).toBeNull()
	})

	it('разделы по группам, строки с подписью «группа · этаж», скрытые из списка не показаны', () => {
		const { container } = renderMap()
		const lists = within(directory()).getAllByRole('list')
		expect(lists.map(list => list.getAttribute('aria-label'))).toEqual(['Кафе', 'Магазины', UI_IMAGE_MAP.OTHER_GROUP])
		expect(entryIds(container)).toEqual(['cafe', 'closed', 'hall', 'room', 'shop-2', 'shop-10', 'atm', 'site'])
		expect(entryOf(container, 'shop-10')).toHaveTextContent('Магазин 10Магазины · 1 эт.')
		expect(entryOf(container, 'hall')).toHaveTextContent('ЗалКафе · Второй этаж')
		expect(entryOf(container, 'atm')).toHaveTextContent('Банкомат1 эт.')
		expect(entryOf(container, 'secret')).toBeNull()
		expect(container.querySelector('.base-image-map__layout')).toHaveClass('base-image-map__layout--with-directory')
	})

	it('строки — кнопки и ссылки с состоянием для скринридера', () => {
		const { container } = renderMap({ active: 'shop-2' })
		const shop = entryOf(container, 'shop-2')
		expect(shop.tagName).toBe('BUTTON')
		expect(shop).toHaveAttribute('type', 'button')
		expect(shop).toHaveAttribute('aria-current', 'true')
		expect(shop).toHaveAttribute('aria-haspopup', 'dialog')
		expect(shop).toHaveClass('base-image-map__entry--active')
		expect(entryOf(container, 'atm')).not.toHaveAttribute('aria-haspopup')
		expect(entryOf(container, 'closed')).toHaveAttribute('aria-disabled', 'true')
		expect(entryOf(container, 'closed')).toHaveClass('base-image-map__entry--disabled')
		const site = within(directory()).getByRole('link', { name: /Сайт/ })
		expect(site).toHaveAttribute('href', 'https://example.com')
		expect(site).toHaveAttribute('target', '_blank')
		expect(site).toHaveAttribute('rel', 'noopener noreferrer')
		expect(site).not.toHaveAttribute('type')
	})

	it('недоступная ссылка — кнопка без href; внутренняя ссылка — без target', () => {
		const data = directoryData({
			objects: [
				{ id: 'in', type: 'point', layer: 'f1', title: 'Внутри', x: 0, y: 0, action: 'link', link: '/page' },
				{ id: 'off', type: 'point', layer: 'f1', title: 'Выкл', x: 1, y: 1, action: 'link', link: '/off', isDisabled: true },
			],
		})
		const { container } = renderMap({ data })
		expect(entryOf(container, 'in')).not.toHaveAttribute('target')
		expect(entryOf(container, 'in')).not.toHaveAttribute('rel')
		expect(entryOf(container, 'off').tagName).toBe('BUTTON')
		expect(entryOf(container, 'off')).not.toHaveAttribute('href')
	})

	it('кружок группы с цветом и значком; без цвета — без стиля', () => {
		const { container } = renderMap()
		const cafeSwatch = entryOf(container, 'cafe').querySelector('.base-image-map__swatch') as HTMLElement
		expect(cafeSwatch.style.getPropertyValue('--im-swatch')).toBe('var(--rise-warning)')
		expect(cafeSwatch.querySelector('svg, .base-icon')).not.toBeNull()
		const atmSwatch = entryOf(container, 'atm').querySelector('.base-image-map__swatch') as HTMLElement
		expect(atmSwatch.getAttribute('style')).toBeNull()
	})

	it('группировка alpha и none, вид grid с миниатюрой, позиция end', () => {
		const data = directoryData({
			objects: [
				{ id: 'p', type: 'point', layer: 'f1', title: 'Пекарня', x: 0, y: 0, image: 'bread.png' },
				{ id: 'a', type: 'point', layer: 'f1', title: 'Аптека', x: 1, y: 1 },
			],
		})
		const { container, rerender } = renderMap({ data, directoryGroupBy: 'alpha', directoryView: 'grid', directoryPosition: 'end' })
		expect(
			within(directory())
				.getAllByRole('list')
				.map(list => list.getAttribute('aria-label')),
		).toEqual(['А', 'П'])
		expect(entryOf(container, 'p').querySelector('img.base-image-map__thumb')).toHaveAttribute('src', 'bread.png')
		expect(entryOf(container, 'a').querySelector('img')).toBeNull()
		expect(container.querySelector('.base-image-map__list')).toHaveClass('base-image-map__list--grid')
		expect(container.querySelector('.base-image-map__layout')).toHaveClass('base-image-map__layout--end')
		return rerender({ data, ...DIRECTORY_PROPS, directoryGroupBy: 'none' }).then(() => {
			const lists = within(directory()).getAllByRole('list')
			expect(lists).toHaveLength(1)
			expect(lists[0]).toHaveAttribute('aria-label', UI_IMAGE_MAP.DIRECTORY)
			expect(container.querySelector('.base-image-map__section-title')).toBeNull()
		})
	})

	it('directoryScope layer: только объекты текущего этажа, без подписи этажа; смена этажа меняет список', async () => {
		const { container, rerender } = renderMap({ directoryScope: 'layer' })
		expect(entryIds(container)).toEqual(['cafe', 'closed', 'shop-2', 'shop-10', 'atm'])
		expect(entryOf(container, 'atm')).not.toHaveTextContent('1 эт.')
		await rerender({ data: directoryData(), ...DIRECTORY_PROPS, directoryScope: 'layer', layer: 'f2' })
		await waitFor(() => expect(entryIds(container)).toEqual(['hall', 'room', 'site']))
	})

	it('слот directory-item заменяет содержимое строки', () => {
		const { container } = renderMap(
			{},
			{
				'directory-item': (props: { object: { title: string }; group?: { title: string }; isActive: boolean }) =>
					h('b', { class: 'own' }, `${props.object.title}/${props.group?.title ?? '-'}/${props.isActive}`),
			},
		)
		expect(entryOf(container, 'cafe')).toHaveTextContent('Ёлка/Кафе/false')
		expect(entryOf(container, 'atm')).toHaveTextContent('Банкомат/-/false')
		expect(container.querySelector('.base-image-map__entry-title')).toBeNull()
	})

	it('customClass для списка, фильтров и легенды', () => {
		const { container } = renderMap({
			hasLegend: true,
			customClass: { directory: 'my-dir', filters: 'my-filters', legend: 'my-legend' },
		})
		expect(directory()).toHaveClass('my-dir')
		expect(container.querySelector('.base-image-map__filters')).toHaveClass('my-filters')
		expect(container.querySelector('.base-image-map__legend')).toHaveClass('my-legend')
	})
})

describe('BaseImageMap directory — легенда', () => {
	it('показывает все группы с цветом и значком', () => {
		renderMap({ hasLegend: true, hasDirectory: false })
		const legend = screen.getByRole('list', { name: UI_IMAGE_MAP.LEGEND })
		const items = within(legend).getAllByRole('listitem')
		expect(items.map(item => item.textContent?.trim())).toEqual(['Кафе', 'Магазины'])
		const [food, shops] = items.map(item => item.querySelector('.base-image-map__swatch') as HTMLElement)
		expect(food?.style.getPropertyValue('--im-swatch')).toBe('var(--rise-warning)')
		expect(food?.querySelector('svg, .base-icon')).not.toBeNull()
		expect(shops?.querySelector('svg, .base-icon')).toBeNull()
	})

	it('группа без цвета — кружок без стиля', () => {
		const { container } = renderMap({ hasLegend: true, data: directoryData({ groups: [{ id: 'plain', title: 'Прочее' }] }) })
		expect(container.querySelector('.base-image-map__legend .base-image-map__swatch')?.getAttribute('style')).toBeNull()
	})

	it('без групп легенды нет', () => {
		renderMap({ hasLegend: true, data: directoryData({ groups: undefined }) })
		expect(screen.queryByRole('list', { name: UI_IMAGE_MAP.LEGEND })).toBeNull()
	})
})

describe('BaseImageMap directory — поиск', () => {
	it('поле поиска с именем и подсказкой; ввод сужает список, но не карту', async () => {
		const user = userEvent.setup()
		const { container, emitted } = renderMap()
		const input = within(directory()).getByRole('textbox', { name: UI_IMAGE_MAP.SEARCH })
		expect(input).toHaveAttribute('placeholder', UI_IMAGE_MAP.SEARCH_PLACEHOLDER)
		expect(status()).toHaveTextContent('')
		await user.type(input, 'магазин')
		expect(entryIds(container)).toEqual(['room', 'shop-2', 'shop-10'])
		expect(status()).toHaveTextContent(found(3))
		expect(emitted()['update:search']?.at(-1)).toEqual(['магазин'])
		expect(objectOf(container, 'atm')).not.toBeNull()
	})

	it('поиск по описанию, keywords и ё; несколько слов — все должны найтись', async () => {
		const user = userEvent.setup()
		const { container } = renderMap()
		const input = within(directory()).getByRole('textbox', { name: UI_IMAGE_MAP.SEARCH })
		await user.type(input, 'ЕЛКА кофе')
		expect(entryIds(container)).toEqual(['cafe'])
		expect(status()).toHaveTextContent(found(1))
		await user.clear(input)
		await user.type(input, 'одежда 10')
		expect(entryIds(container)).toEqual(['shop-10'])
	})

	it('пусто — «Ничего не найдено» в статусе и в списке; «Сбросить фильтры» возвращает всё', async () => {
		const user = userEvent.setup()
		const { container, emitted } = renderMap()
		await user.type(within(directory()).getByRole('textbox', { name: UI_IMAGE_MAP.SEARCH }), 'нет такого')
		expect(entryIds(container)).toEqual([])
		expect(status()).toHaveTextContent(UI_TEXT.NO_RESULTS)
		expect(container.querySelector('.base-image-map__list-empty')).toHaveTextContent(UI_TEXT.NO_RESULTS)
		await user.click(within(directory()).getByRole('button', { name: UI_IMAGE_MAP.CLEAR_FILTERS }))
		expect(emitted()['update:search']?.at(-1)).toEqual([''])
		expect(emitted()['update:filters']).toBeUndefined()
		expect(entryIds(container)).toHaveLength(8)
		expect(status()).toHaveTextContent('')
		expect(within(directory()).queryByRole('button', { name: UI_IMAGE_MAP.CLEAR_FILTERS })).toBeNull()
	})

	it('слот directory-empty заменяет текст пустого списка', () => {
		renderMap({ search: 'нет такого' }, { 'directory-empty': () => h('p', 'Пусто') })
		expect(within(directory()).getByText('Пусто')).toBeInTheDocument()
		expect(status()).toHaveTextContent(UI_TEXT.NO_RESULTS)
	})

	it('v-model search: проп задаёт запрос; hasSearch=false убирает поле', async () => {
		const { container, rerender } = renderMap({ search: 'зал' })
		expect(within(directory()).getByRole('textbox', { name: UI_IMAGE_MAP.SEARCH })).toHaveValue('зал')
		expect(entryIds(container)).toEqual(['hall'])
		await rerender({ data: directoryData(), ...DIRECTORY_PROPS, search: '', hasSearch: false })
		expect(within(directory()).queryByRole('textbox')).toBeNull()
		expect(entryIds(container)).toHaveLength(8)
	})
})

describe('BaseImageMap directory — фильтры', () => {
	it('четыре вида фильтров в группе «Фильтры»', () => {
		renderMap()
		const group = within(directory()).getByRole('group', { name: UI_IMAGE_MAP.FILTERS })
		expect(within(group).getByRole('checkbox', { name: 'Кафе' })).not.toBeChecked()
		expect(within(group).getByRole('button', { name: 'Wi-Fi' })).toHaveAttribute('aria-pressed', 'false')
		expect(within(group).getByRole('group', { name: 'Удобства' })).toBeInTheDocument()
		expect(within(group).getByRole('switch', { name: 'Открыто' })).toBeInTheDocument()
		expect(within(group).getByRole('combobox', { name: 'Бренд' })).toBeInTheDocument()
	})

	it('checkbox по группе: список и точки карты сужаются, статус и сброс появляются', async () => {
		const user = userEvent.setup()
		const { container, emitted } = renderMap()
		await user.click(screen.getByRole('checkbox', { name: 'Магазины' }))
		expect(emitted()['update:filters']?.at(-1)).toEqual([{ groups: ['shops'] }])
		expect(entryIds(container)).toEqual(['room', 'shop-2', 'shop-10'])
		expect(status()).toHaveTextContent(found(3))
		expect(objectOf(container, 'cafe')).toBeNull()
		expect(objectOf(container, 'atm')).toBeNull()
		expect(objectOf(container, 'shop-2')).not.toBeNull()
		await user.click(screen.getByRole('checkbox', { name: 'Магазины' }))
		expect(emitted()['update:filters']?.at(-1)).toEqual([{ groups: [] }])
		expect(objectOf(container, 'cafe')).not.toBeNull()
	})

	it('tags с logic and: aria-pressed, нужны все выбранные метки', async () => {
		const user = userEvent.setup()
		const { container } = renderMap()
		const wifi = screen.getByRole('button', { name: 'Wi-Fi' })
		await user.click(wifi)
		expect(wifi).toHaveAttribute('aria-pressed', 'true')
		expect(wifi).toHaveClass('base-image-map__tag--on')
		expect(entryIds(container)).toEqual(['hall', 'shop-2', 'shop-10'])
		await user.click(screen.getByRole('button', { name: 'Парковка' }))
		expect(entryIds(container)).toEqual(['shop-10'])
		await user.click(wifi)
		expect(wifi).toHaveAttribute('aria-pressed', 'false')
		expect(entryIds(container)).toEqual(['cafe', 'room', 'shop-10'])
	})

	it('switch включает и выключает вариант', async () => {
		const user = userEvent.setup()
		const { container } = renderMap()
		const open = screen.getByRole('switch', { name: 'Открыто' })
		await user.click(open)
		expect(entryIds(container)).toEqual(['shop-10'])
		await user.click(open)
		expect(entryIds(container)).toHaveLength(8)
	})

	it('select: вариант «Все» снимает выбор', async () => {
		const user = userEvent.setup()
		const { container, emitted } = renderMap()
		await user.click(screen.getByRole('combobox', { name: 'Бренд' }))
		await user.click(await screen.findByRole('option', { name: 'Альфа' }))
		expect(emitted()['update:filters']?.at(-1)).toEqual([{ brand: ['alpha'] }])
		expect(entryIds(container)).toEqual(['cafe'])
		await user.click(screen.getByRole('combobox', { name: 'Бренд' }))
		await user.click(await screen.findByRole('option', { name: UI_IMAGE_MAP.ALL }))
		expect(emitted()['update:filters']?.at(-1)).toEqual([{ brand: [] }])
		expect(entryIds(container)).toHaveLength(8)
	})

	it('скрытые SVG-объекты бледнеют и перестают быть кнопками; снятие фильтра возвращает атрибуты', async () => {
		const { container, rerender } = renderMap({ layer: 'f2' })
		const room = await screen.findByRole('button', { name: 'Комната' })
		expect(room).toHaveAttribute('tabindex')
		await rerender({ data: directoryData(), ...DIRECTORY_PROPS, layer: 'f2', filters: { groups: ['food'] } })
		const hidden = container.querySelector('rect#' + CSS.escape(room.id)) as Element
		await waitFor(() => expect(hidden).toHaveClass('base-image-map__object--filtered'))
		expect(hidden).toHaveAttribute('aria-hidden', 'true')
		expect(hidden).not.toHaveAttribute('role')
		expect(hidden).not.toHaveAttribute('tabindex')
		expect(hidden).not.toHaveAttribute('aria-label')
		expect(hidden).not.toHaveAttribute('data-image-map-object')
		expect(screen.queryByRole('button', { name: 'Комната' })).toBeNull()
		await fireEvent.click(hidden)
		expect(screen.queryByRole('dialog')).toBeNull()
		await rerender({ data: directoryData(), ...DIRECTORY_PROPS, layer: 'f2', filters: {} })
		await waitFor(() => expect(screen.getByRole('button', { name: 'Комната' })).not.toHaveClass('base-image-map__object--filtered'))
		expect(screen.getByRole('button', { name: 'Комната' })).not.toHaveAttribute('aria-hidden')
	})

	it('начальный выбор из value фильтра; hasFilters=false — фильтров нет и они не действуют', async () => {
		const data = directoryData()
		data.filters = data.filters!.map(filter => (filter.id === 'groups' ? { ...filter, value: ['food'] } : filter))
		const { container, rerender } = renderMap({ data })
		expect(screen.getByRole('checkbox', { name: 'Кафе' })).toBeChecked()
		expect(entryIds(container)).toEqual(['cafe', 'closed', 'hall'])
		await rerender({ data, ...DIRECTORY_PROPS, hasFilters: false })
		expect(within(directory()).queryByRole('group', { name: UI_IMAGE_MAP.FILTERS })).toBeNull()
		expect(entryIds(container)).toHaveLength(8)
		expect(status()).toHaveTextContent(found(8))
	})

	it('expose clearFilters очищает запрос и фильтры', async () => {
		let api: { clearFilters: () => void } | undefined
		const { container } = render({
			setup: () => () =>
				h(BaseImageMap, {
					data: directoryData(),
					...DIRECTORY_PROPS,
					search: 'магазин',
					filters: { groups: ['shops'] },
					ref: (value: unknown) => {
						api = value as typeof api
					},
				}),
		})
		expect(entryIds(container)).toEqual(['room', 'shop-2', 'shop-10'])
		api?.clearFilters()
		await waitFor(() => expect(entryIds(container)).toHaveLength(8))
	})
})

describe('BaseImageMap directory — связь списка и карты', () => {
	it('выбор строки другого этажа переключает этаж, выбирает объект и открывает окно; Escape возвращает фокус в строку', async () => {
		const user = userEvent.setup()
		const { container, emitted } = renderMap()
		await user.click(entryOf(container, 'room'))
		const dialog = await screen.findByRole('dialog', { name: 'Комната' })
		expect(dialog).toBeInTheDocument()
		expect(emitted()['update:layer']?.at(-1)).toEqual(['f2'])
		expect(emitted()['update:active']?.at(-1)).toEqual(['room'])
		expect(emitted().select).toHaveLength(1)
		await user.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
		await waitFor(() => expect(entryOf(container, 'room')).toHaveFocus())
		expect(entryOf(container, 'room')).toHaveAttribute('aria-current', 'true')
	})

	it('клавиатура: Tab до строки, Enter открывает окно', async () => {
		const user = userEvent.setup()
		const { container } = renderMap({ data: directoryData({ filters: undefined }), hasSearch: false })
		entryOf(container, 'cafe').focus()
		await user.keyboard('{Enter}')
		expect(await screen.findByRole('dialog', { name: 'Ёлка' })).toBeInTheDocument()
	})

	it('недоступная строка ничего не делает', async () => {
		const user = userEvent.setup()
		const { container, emitted } = renderMap({ layer: 'f2' })
		await user.click(entryOf(container, 'closed'))
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(emitted()['update:layer']).toBeUndefined()
		expect(emitted()['update:active']).toBeUndefined()
	})

	it('наведение и фокус строки подсвечивают объект и эмитят hover без подсказки', async () => {
		const { container, emitted } = renderMap()
		const entry = entryOf(container, 'shop-2')
		await fireEvent.pointerEnter(entry)
		expect(objectOf(container, 'shop-2')).toHaveClass('base-image-map__object--hover')
		expect(entry).toHaveClass('base-image-map__entry--hover')
		expect((emitted().hover?.at(-1) as [{ id: string }])[0].id).toBe('shop-2')
		expect(document.querySelector('[role="tooltip"]')).toBeNull()
		await fireEvent.focus(entry)
		expect(emitted().hover).toHaveLength(1)
		await fireEvent.pointerLeave(entry)
		expect(emitted().hover?.at(-1)).toEqual([null])
		expect(objectOf(container, 'shop-2')).not.toHaveClass('base-image-map__object--hover')
		await fireEvent.focus(entryOf(container, 'cafe'))
		expect(objectOf(container, 'cafe')).toHaveClass('base-image-map__object--hover')
		await fireEvent.blur(entryOf(container, 'cafe'))
		expect(emitted().hover?.at(-1)).toEqual([null])
	})

	it('наведение на объект карты подсвечивает строку', async () => {
		const { container } = renderMap()
		await fireEvent.pointerOver(objectOf(container, 'shop-10') as Element, { pointerType: 'mouse' })
		await waitFor(() => expect(entryOf(container, 'shop-10')).toHaveClass('base-image-map__entry--hover'))
	})
})

describe('BaseImageMap directory — ссылка на объект', () => {
	afterEach(() => {
		window.history.replaceState(null, '', '/')
	})

	it('читает параметр: этаж объекта, выбор и окно; новый выбор пишет параметр, сохраняя history.state', async () => {
		window.history.replaceState({ keep: 1 }, '', '/?location=room&x=1')
		const user = userEvent.setup()
		const { container, emitted } = renderMap({ hasDeepLinking: true })
		expect(await screen.findByRole('dialog', { name: 'Комната' })).toBeInTheDocument()
		expect(emitted()['update:layer']?.at(-1)).toEqual(['f2'])
		expect(emitted()['update:active']?.at(-1)).toEqual(['room'])
		expect(entryOf(container, 'room')).toHaveAttribute('aria-current', 'true')
		await user.keyboard('{Escape}')
		await user.click(entryOf(container, 'shop-2'))
		await waitFor(() => expect(window.location.search).toBe('?location=shop-2&x=1'))
		expect(window.history.state).toEqual({ keep: 1 })
	})

	it('свой параметр, приближение и действие без окна', async () => {
		window.history.replaceState(null, '', '/?place=atm')
		const replace = vi.spyOn(window.history, 'replaceState')
		const { emitted, rerender } = renderMap({ hasDeepLinking: true, deepLinkParam: 'place', hasZoomToActive: true })
		await waitFor(() => expect(emitted()['update:active']?.at(-1)).toEqual(['atm']))
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(replace).not.toHaveBeenCalled()
		const props = { data: directoryData(), ...DIRECTORY_PROPS, hasDeepLinking: true, deepLinkParam: 'place' }
		await rerender({ ...props, active: 'shop-2' })
		await waitFor(() => expect(window.location.search).toBe('?place=shop-2'))
		await rerender({ ...props, active: null })
		await waitFor(() => expect(window.location.search).toBe(''))
		replace.mockRestore()
	})

	it('неизвестный и недоступный id игнорируются', async () => {
		window.history.replaceState(null, '', '/?location=closed')
		const first = renderMap({ hasDeepLinking: true })
		await Promise.resolve()
		expect(first.emitted()['update:active']).toBeUndefined()
		first.unmount()
		window.history.replaceState(null, '', '/?location=missing')
		const second = renderMap({ hasDeepLinking: true })
		await Promise.resolve()
		expect(second.emitted()['update:active']).toBeUndefined()
		second.unmount()
		window.history.replaceState(null, '', '/?other=1')
		const third = renderMap({ hasDeepLinking: true })
		await Promise.resolve()
		expect(third.emitted()['update:active']).toBeUndefined()
	})

	it('объект без слоя (данные без слоёв) выбирается без смены слоя', async () => {
		window.history.replaceState(null, '', '/?location=lone')
		const data = { layers: [], objects: [{ id: 'lone', type: 'point' as const, title: 'Один', x: 0, y: 0 }] }
		const { emitted } = renderMap({ data, hasDeepLinking: true })
		await waitFor(() => expect(emitted()['update:active']?.at(-1)).toEqual(['lone']))
		expect(emitted()['update:layer']).toBeUndefined()
	})

	it('без hasDeepLinking адрес не читается и не пишется', async () => {
		window.history.replaceState(null, '', '/?location=room')
		const user = userEvent.setup()
		const { container, emitted } = renderMap()
		expect(emitted()['update:active']).toBeUndefined()
		await user.click(entryOf(container, 'atm'))
		expect(emitted()['update:active']?.at(-1)).toEqual(['atm'])
		expect(window.location.search).toBe('?location=room')
	})
})
