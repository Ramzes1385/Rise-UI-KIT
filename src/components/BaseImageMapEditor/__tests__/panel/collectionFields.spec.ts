import { UI_IMAGE_MAP_EDITOR } from '../../../../locales/messages'
import type { ImageMapData } from '../../../BaseImageMap/types/imageMapData.types'
import { filterIssue, filterRows, isStyleKey, optionIssue, styleIssue, styleName, styleRows } from '../../model/panel/collectionFields'

const t = UI_IMAGE_MAP_EDITOR

function makeData(): ImageMapData {
	return {
		layers: [],
		objects: [],
		styles: { accent: { base: { fill: 'var(--rise-primary)', strokeWidth: 2 } }, empty: {} },
		filters: [
			{
				id: 'kind',
				title: 'Вид',
				type: 'tags',
				logic: 'and',
				options: [
					{ value: 'a', label: 'А' },
					{ value: 'b', label: 'Б' },
				],
			},
			{ id: 'plain', title: 'По группам' },
			{ id: 'open', title: 'Сейчас', type: 'open-now' },
		],
	}
}

describe('collectionFields: фильтры', () => {
	it('строки: поля, варианты, подпись группы вариантов и пояснение', () => {
		const rows = filterRows(makeData(), { '0.id': 'ошибка', '0.1.label': 'ошибка варианта' })
		expect(rows).toHaveLength(3)
		const [kind, plain, open] = rows
		expect(kind?.title).toBe('Вид')
		expect(kind?.deleteLabel).toBe('Удалить фильтр «Вид»')
		expect(kind?.fields.map(field => field.key)).toEqual(['id', 'title', 'type', 'logic'])
		expect(kind?.fields[0]).toMatchObject({ value: 'kind', error: 'ошибка', isTrimmedOnBlur: true })
		expect(kind?.fields[2]).toMatchObject({ kind: 'select', value: 'tags' })
		expect(kind?.fields[3]).toMatchObject({ kind: 'select', value: 'and' })
		expect(kind?.childrenTitle).toBe('Варианты фильтра «Вид»')
		expect(kind?.addChildLabel).toBe(t.ADD_FILTER_OPTION)
		expect(kind?.hint).toBeUndefined()
		expect(kind?.children?.map(child => child.title)).toEqual(['А', 'Б'])
		expect(kind?.children?.[1]?.fields[1]).toMatchObject({ key: 'label', value: 'Б', error: 'ошибка варианта' })
		expect(plain?.fields[2]).toMatchObject({ value: 'checkbox' })
		expect(plain?.fields[3]).toMatchObject({ value: 'or' })
		expect(plain?.children).toEqual([])
		expect(plain?.hint).toBe(t.FILTER_BY_GROUPS)
		expect(open?.fields.map(field => field.key)).toEqual(['id', 'title', 'type'])
		expect(open?.children).toBeUndefined()
	})

	it('без фильтров — пустой список; подпись пустого варианта — его значение', () => {
		expect(filterRows({ layers: [], objects: [] }, {})).toEqual([])
		const data: ImageMapData = { layers: [], objects: [], filters: [{ id: 'f', title: 'F', options: [{ value: 'v', label: '' }] }] }
		expect(filterRows(data, {})[0]?.children?.[0]?.title).toBe('v')
	})

	it('filterIssue: пустые поля, занятый id; тип и сочетание не проверяются', () => {
		const data = makeData()
		expect(filterIssue(data, { index: 0, key: 'id' }, ' ')).toBe(t.ID_REQUIRED)
		expect(filterIssue(data, { index: 0, key: 'title' }, null)).toBe(t.FIELD_REQUIRED)
		expect(filterIssue(data, { index: 0, key: 'id' }, 'plain')).toBe(t.ID_TAKEN)
		expect(filterIssue(data, { index: 0, key: 'id' }, ' plain ')).toBe(t.ID_TAKEN)
		expect(filterIssue(data, { index: 0, key: 'id' }, 'kind')).toBeUndefined()
		expect(filterIssue(data, { index: 0, key: 'title' }, 'plain')).toBeUndefined()
		expect(filterIssue(data, { index: 0, key: 'type' }, '')).toBeUndefined()
		expect(filterIssue(data, { index: 0, key: 'logic' }, 'or')).toBeUndefined()
	})

	it('optionIssue: пустые значение и подпись, занятое значение', () => {
		const data = makeData()
		expect(optionIssue(data, { index: 0, child: 0, key: 'value' }, '')).toBe(t.FIELD_REQUIRED)
		expect(optionIssue(data, { index: 0, child: 0, key: 'label' }, ' ')).toBe(t.FIELD_REQUIRED)
		expect(optionIssue(data, { index: 0, child: 0, key: 'value' }, 'b')).toBe(t.VALUE_TAKEN)
		expect(optionIssue(data, { index: 0, child: 0, key: 'value' }, 'a')).toBeUndefined()
		expect(optionIssue(data, { index: 0, child: 0, key: 'label' }, 'Б')).toBeUndefined()
		expect(optionIssue(data, { index: 1, child: 0, key: 'value' }, 'x')).toBeUndefined()
	})
})

describe('collectionFields: стили', () => {
	it('строки: имя, цвета с палитрой токенов, обводка, непрозрачность', () => {
		const rows = styleRows(makeData(), { '0.name': 'ошибка' })
		expect(rows.map(row => row.title)).toEqual(['accent', 'empty'])
		expect(rows[0]?.deleteLabel).toBe('Удалить стиль «accent»')
		const [name, fill, stroke, width, opacity] = rows[0]?.fields ?? []
		expect(name).toMatchObject({ key: 'name', kind: 'text', value: 'accent', error: 'ошибка', isTrimmedOnBlur: true })
		expect(fill).toMatchObject({ key: 'fill', kind: 'color', value: 'var(--rise-primary)', placeholder: 'var(--rise-primary)' })
		expect(fill?.options?.[0]).toEqual({ value: '', label: t.COLOR_CUSTOM })
		expect(fill?.options?.map(option => option.value)).toContain('var(--rise-error)')
		expect(stroke).toMatchObject({ key: 'stroke', value: '' })
		expect(width).toMatchObject({ key: 'strokeWidth', kind: 'number', value: 2, min: 0 })
		expect(opacity).toMatchObject({ key: 'fillOpacity', value: null, min: 0, max: 1 })
		expect(rows[1]?.fields[1]?.value).toBe('')
		expect(styleRows({ layers: [], objects: [] }, {})).toEqual([])
	})

	it('styleIssue: имя обязательно и уникально; остальные поля не проверяются', () => {
		const data = makeData()
		expect(styleIssue(data, 'accent', { key: 'name', value: '' })).toBe(t.FIELD_REQUIRED)
		expect(styleIssue(data, 'accent', { key: 'name', value: 'empty' })).toBe(t.NAME_TAKEN)
		expect(styleIssue(data, 'accent', { key: 'name', value: 'accent ' })).toBeUndefined()
		expect(styleIssue(data, 'accent', { key: 'name', value: 'main' })).toBeUndefined()
		expect(styleIssue(data, 'accent', { key: 'name', value: 'constructor' })).toBeUndefined()
		expect(styleIssue(data, 'accent', { key: 'fill', value: '' })).toBeUndefined()
		expect(styleIssue({ layers: [], objects: [] }, 'a', { key: 'name', value: 'b' })).toBeUndefined()
	})

	it('styleName и isStyleKey', () => {
		expect(styleName(makeData(), 1)).toBe('empty')
		expect(styleName(makeData(), 5)).toBeUndefined()
		expect(styleName({ layers: [], objects: [] }, 0)).toBeUndefined()
		expect(isStyleKey('stroke')).toBe(true)
		expect(isStyleKey('name')).toBe(false)
	})
})
