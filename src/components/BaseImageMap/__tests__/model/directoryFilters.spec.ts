import { effectScope, nextTick, reactive } from 'vue'
import { directoryData } from '../imageMapDirectory.test-utils'
import { useImageMapData } from '../../model/data/useImageMapData'
import type { ImageMapProps } from '../../types/BaseImageMap.types'
import type { ImageMapObject } from '../../types/imageMapData.types'
import { useImageMapFilters } from '../../model/directory/useImageMapFilters'

type MutableProps = { -readonly [K in keyof ImageMapProps]: ImageMapProps[K] }

function setup(overrides: Partial<ImageMapProps> = {}) {
	const props = reactive({ data: directoryData(), hasFilters: true, ...overrides }) as MutableProps
	const emit = vi.fn()
	const scope = effectScope()
	const filters = scope.run(() => useImageMapFilters(props, emit as never))!
	return { props, emit, filters }
}

const shop = { id: 's', type: 'point', title: 'Магазин', x: 0, y: 0, group: 'shops', tags: ['wifi'] } as ImageMapObject

describe('useImageMapFilters — поиск', () => {
	it('начинает с пропа search или пустой строки, следит за пропом', async () => {
		const { props, filters } = setup({ search: 'кафе' })
		expect(filters.search.value).toBe('кафе')
		props.search = 'зал'
		await nextTick()
		expect(filters.search.value).toBe('зал')
		props.search = undefined
		await nextTick()
		expect(filters.search.value).toBe('')
	})

	it('setSearch эмитит update:search только при изменении', () => {
		const { emit, filters } = setup()
		filters.setSearch('')
		expect(emit).not.toHaveBeenCalled()
		filters.setSearch('кофе')
		expect(filters.search.value).toBe('кофе')
		expect(emit).toHaveBeenCalledWith('update:search', 'кофе')
	})
})

describe('useImageMapFilters — значения', () => {
	it('начальный выбор — value фильтров, если нет пропа filters', () => {
		const data = directoryData()
		data.filters = data.filters!.map(filter => (filter.id === 'groups' ? { ...filter, value: ['food'] } : filter))
		expect(setup({ data }).filters.values.value).toEqual({ groups: ['food'] })
		expect(setup({ data, filters: { groups: ['shops'] } }).filters.values.value).toEqual({ groups: ['shops'] })
		expect(setup({ data: directoryData({ filters: undefined }) }).filters.values.value).toEqual({})
	})

	it('проп filters перекрывает выбор при изменении; undefined — оставляет', async () => {
		const { props, filters } = setup({ filters: { groups: ['food'] } })
		props.filters = { groups: ['shops'] }
		await nextTick()
		expect(filters.values.value).toEqual({ groups: ['shops'] })
		props.filters = undefined
		await nextTick()
		expect(filters.values.value).toEqual({ groups: ['shops'] })
	})

	it('setFilter и toggleFilter эмитят новый объект', () => {
		const { emit, filters } = setup()
		filters.setFilter('groups', ['food'])
		const first = emit.mock.calls[0]?.[1]
		expect(first).toEqual({ groups: ['food'] })
		filters.toggleFilter('amenities', 'wifi', true)
		filters.toggleFilter('amenities', 'parking', true)
		filters.toggleFilter('amenities', 'wifi', true)
		expect(filters.values.value).toEqual({ groups: ['food'], amenities: ['parking', 'wifi'] })
		filters.toggleFilter('amenities', 'parking', false)
		expect(emit).toHaveBeenLastCalledWith('update:filters', { groups: ['food'], amenities: ['wifi'] })
		expect(emit.mock.calls.at(-1)?.[1]).not.toBe(first)
	})

	it('hasSelection — есть хотя бы одно выбранное значение', () => {
		const { filters } = setup({ filters: { groups: [] } })
		expect(filters.hasSelection.value).toBe(false)
		filters.toggleFilter('groups', 'food', true)
		expect(filters.hasSelection.value).toBe(true)
	})

	it('clearFilters очищает поиск и выбор без лишних событий', () => {
		const empty = setup()
		empty.filters.clearFilters()
		expect(empty.emit).not.toHaveBeenCalled()
		const { emit, filters } = setup({ search: 'кафе', filters: { groups: [] } })
		filters.clearFilters()
		expect(emit.mock.calls).toEqual([
			['update:search', ''],
			['update:filters', {}],
		])
	})

	it('isShown учитывает фильтры только при hasFilters', () => {
		const { props, filters } = setup({ filters: { groups: ['food'] } })
		expect(filters.isShown(shop)).toBe(false)
		props.hasFilters = false
		expect(filters.isShown(shop)).toBe(true)
		props.hasFilters = true
		props.data = directoryData({ filters: undefined })
		expect(filters.isShown(shop)).toBe(true)
	})
})

describe('useImageMapData — предикат показа', () => {
	it('без предиката показывает все объекты слоя, скрытых нет', () => {
		const props = reactive({ data: directoryData(), defaultAction: 'popup' }) as ImageMapProps
		const data = effectScope().run(() => useImageMapData(props))!
		expect(data.view.value?.objects.map(item => item.object.id)).toEqual(['shop-10', 'shop-2', 'cafe', 'atm', 'secret', 'closed'])
		expect(data.view.value?.hidden).toEqual([])
	})

	it('предикат делит объекты слоя на видимые и скрытые', () => {
		const props = reactive({ data: directoryData(), defaultAction: 'popup' }) as ImageMapProps
		const data = effectScope().run(() => useImageMapData(props, object => object.group === 'food'))!
		expect(data.view.value?.objects.map(item => item.object.id)).toEqual(['cafe', 'closed'])
		expect(data.view.value?.hidden.map(item => item.object.id)).toEqual(['shop-10', 'shop-2', 'atm', 'secret'])
	})
})
