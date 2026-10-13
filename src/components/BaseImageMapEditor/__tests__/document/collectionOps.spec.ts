import type { ImageMapData } from '../../../BaseImageMap/types/imageMapData.types'
import {
	addFilter,
	addFilterOption,
	addStyle,
	patchFilter,
	patchFilterOption,
	patchStyleBase,
	removeFilter,
	removeFilterOption,
	removeStyle,
	renameStyle,
} from '../../model/document/collectionOps'

function makeData(): ImageMapData {
	return {
		layers: [{ id: 'l1', title: 'Первый', width: 100, height: 100 }],
		objects: [
			{ type: 'point', id: 'p1', title: 'Вход', x: 0.1, y: 0.1, style: 'accent' },
			{ type: 'point', id: 'p2', title: 'Выход', x: 0.2, y: 0.2, style: { base: { fill: 'red' } } },
			{ type: 'point', id: 'p3', title: 'Касса', x: 0.3, y: 0.3 },
		],
		groups: [{ id: 'g1', title: 'Кафе', style: 'accent' }],
		styles: { accent: { base: { fill: 'red' } }, calm: { base: { stroke: 'blue' } } },
		filters: [
			{
				id: 'kind',
				title: 'Вид',
				options: [
					{ value: 'a', label: 'А' },
					{ value: 'b', label: 'Б' },
				],
				value: ['a', 'b'],
			},
		],
	}
}

describe('collectionOps: фильтры', () => {
	it('addFilter создаёт массив и свободный id', () => {
		const data: ImageMapData = { layers: [], objects: [] }
		expect(addFilter(data, 'Первый')).toEqual({ id: 'filter-1', title: 'Первый' })
		addFilter(data, 'Второй')
		expect(data.filters?.map(filter => filter.id)).toEqual(['filter-1', 'filter-2'])
	})

	it('patchFilter: ставит поля, пустое удаляет, open-now убирает варианты, чужой номер игнорируется', () => {
		const data = makeData()
		patchFilter(data, 0, { title: 'Тип', logic: 'and' })
		expect(data.filters?.[0]).toMatchObject({ title: 'Тип', logic: 'and' })
		patchFilter(data, 0, { logic: undefined })
		expect(data.filters?.[0]).not.toHaveProperty('logic')
		patchFilter(data, 0, { type: 'open-now' })
		expect(data.filters?.[0]).not.toHaveProperty('options')
		const before = JSON.stringify(data)
		patchFilter(data, 5, { title: 'x' })
		expect(JSON.stringify(data)).toBe(before)
	})

	it('removeFilter убирает фильтр, а пустой список — поле filters', () => {
		const data = makeData()
		removeFilter(data, 0)
		expect(data).not.toHaveProperty('filters')
		removeFilter(data, 0)
		expect(data).not.toHaveProperty('filters')
	})

	it('addFilterOption: значение свободное, подпись — переданная; чужой фильтр игнорируется', () => {
		const data = makeData()
		addFilterOption(data, 0, 'В')
		expect(data.filters?.[0]?.options?.at(-1)).toEqual({ value: 'option-1', label: 'В' })
		data.filters?.push({ id: 'free', title: 'Свободный' })
		addFilterOption(data, 1, 'Первый')
		expect(data.filters?.[1]?.options).toEqual([{ value: 'option-1', label: 'Первый' }])
		addFilterOption(data, 9, 'x')
		expect(data.filters).toHaveLength(2)
	})

	it('patchFilterOption: меняет подпись; новое значение переносится в выбранные; чужие номера игнорируются', () => {
		const data = makeData()
		patchFilterOption(data, { index: 0, child: 0 }, { label: 'Новая' })
		expect(data.filters?.[0]?.options?.[0]).toEqual({ value: 'a', label: 'Новая' })
		patchFilterOption(data, { index: 0, child: 0 }, { value: 'z' })
		expect(data.filters?.[0]?.value).toEqual(['z', 'b'])
		patchFilterOption(data, { index: 0, child: 1 }, { value: 'y' })
		expect(data.filters?.[0]?.value).toEqual(['z', 'y'])
		delete data.filters?.[0]?.value
		patchFilterOption(data, { index: 0, child: 0 }, { value: 'q' })
		expect(data.filters?.[0]).not.toHaveProperty('value')
		const before = JSON.stringify(data)
		patchFilterOption(data, { index: 0, child: 7 }, { label: 'x' })
		patchFilterOption(data, { index: 3, child: 0 }, { label: 'x' })
		expect(JSON.stringify(data)).toBe(before)
	})

	it('removeFilterOption: убирает вариант и из выбранных; без вариантов фильтр снова по группам', () => {
		const data = makeData()
		removeFilterOption(data, 0, 0)
		expect(data.filters?.[0]?.options).toEqual([{ value: 'b', label: 'Б' }])
		expect(data.filters?.[0]?.value).toEqual(['b'])
		removeFilterOption(data, 0, 0)
		expect(data.filters?.[0]).not.toHaveProperty('options')
		expect(data.filters?.[0]).not.toHaveProperty('value')
		removeFilterOption(data, 0, 0)
		removeFilterOption(data, 4, 0)
		expect(data.filters).toHaveLength(1)
	})
})

describe('collectionOps: стили', () => {
	it('addStyle создаёт styles и пустой base', () => {
		const data: ImageMapData = { layers: [], objects: [] }
		addStyle(data, 'one')
		expect(data.styles).toEqual({ one: { base: {} } })
	})

	it('patchStyleBase: ставит, удаляет пустое, пустой base убирается; hover остаётся; чужое имя игнорируется', () => {
		const data = makeData()
		const accent = data.styles?.accent
		if (accent) accent.hover = { fill: 'blue' }
		patchStyleBase(data, 'accent', { key: 'strokeWidth', value: 2 })
		expect(data.styles?.accent?.base).toEqual({ fill: 'red', strokeWidth: 2 })
		patchStyleBase(data, 'accent', { key: 'fill', value: '' })
		patchStyleBase(data, 'accent', { key: 'strokeWidth', value: null })
		expect(data.styles?.accent).toEqual({ hover: { fill: 'blue' } })
		patchStyleBase(data, 'nope', { key: 'fill', value: 'x' })
		expect(data.styles).not.toHaveProperty('nope')
	})

	it('renameStyle: сохраняет порядок и переносит ссылки объектов и групп', () => {
		const data = makeData()
		renameStyle(data, 'accent', 'main')
		expect(Object.keys(data.styles ?? {})).toEqual(['main', 'calm'])
		expect(data.objects[0]?.style).toBe('main')
		expect(data.objects[1]?.style).toEqual({ base: { fill: 'red' } })
		expect(data.groups?.[0]?.style).toBe('main')
		renameStyle(data, 'main', 'main')
		renameStyle(data, 'ghost', 'x')
		expect(Object.keys(data.styles ?? {})).toEqual(['main', 'calm'])
		renameStyle({ layers: [], objects: [] }, 'a', 'b')
	})

	it('removeStyle: снимает ссылки; последний стиль убирает поле styles', () => {
		const data = makeData()
		removeStyle(data, 'accent')
		expect(data.objects[0]).not.toHaveProperty('style')
		expect(data.groups?.[0]).not.toHaveProperty('style')
		removeStyle(data, 'calm')
		expect(data).not.toHaveProperty('styles')
		removeStyle(data, 'calm')
		expect(data).not.toHaveProperty('styles')
	})
})
