import { mount } from '@vue/test-utils'
import ImageMapEditorField from '../../ui/ImageMapEditorField.vue'
import type { EditorField } from '../../types/imageMapEditorInternal.types'

const CASES: { field: EditorField; child: string; values: [unknown, unknown][] }[] = [
	{
		field: { key: 'title', kind: 'text', label: 'Название', value: 'Зал', error: 'Ошибка' },
		child: 'BaseInput',
		values: [
			['Холл', 'Холл'],
			[null, ''],
		],
	},
	{
		field: { key: 'description', kind: 'textarea', label: 'Описание', value: '' },
		child: 'BaseTextarea',
		values: [
			['Текст', 'Текст'],
			[null, ''],
		],
	},
	{
		field: { key: 'action', kind: 'select', label: 'По щелчку', value: '', options: [{ value: 'link', label: 'Ссылка' }] },
		child: 'BaseSelect',
		values: [
			['link', 'link'],
			[null, ''],
		],
	},
	{
		field: { key: 'size', kind: 'number', label: 'Размер', value: 12, min: 8, max: 128 },
		child: 'BaseInputNumber',
		values: [
			[16, 16],
			[null, null],
		],
	},
	{
		field: { key: 'isPulsing', kind: 'switch', label: 'Пульсация', value: false },
		child: 'BaseSwitch',
		values: [
			[true, true],
			[undefined, false],
		],
	},
	{
		field: { key: 'tags', kind: 'tags', label: 'Метки', value: ['кафе'] },
		child: 'BaseInputTags',
		values: [
			[['бар'], ['бар']],
			[null, []],
		],
	},
]

describe('ImageMapEditorField', () => {
	for (const { field, child, values } of CASES) {
		it(`${field.kind} — ${child} с подписью, эмитит update с приведённым значением`, async () => {
			const wrapper = mount(ImageMapEditorField, { props: { field, isDisabled: true } })
			const control = wrapper.findComponent({ name: child })
			expect(control.exists()).toBe(true)
			expect(control.props('label')).toBe(field.label)
			expect(control.props('isDisabled')).toBe(true)
			for (const [input] of values) control.vm.$emit('update:modelValue', input)
			expect(wrapper.emitted('update')).toEqual(values.map(([, output]) => [output]))
		})
	}

	it('пустая ошибка поля не передаётся, число не числом — пустое, select без вариантов — пустой список', () => {
		const text = mount(ImageMapEditorField, {
			props: { field: { key: 'id', kind: 'text', label: 'Id', value: 'a', error: '' }, isDisabled: false },
		})
		expect(text.findComponent({ name: 'BaseInput' }).props('error')).toBeUndefined()
		const number = mount(ImageMapEditorField, {
			props: { field: { key: 'size', kind: 'number', label: 'Размер', value: null }, isDisabled: false },
		})
		expect(number.findComponent({ name: 'BaseInputNumber' }).props('modelValue')).toBeNull()
		expect(number.findComponent({ name: 'BaseInputNumber' }).props('precision')).toBe(2)
		const select = mount(ImageMapEditorField, {
			props: { field: { key: 'group', kind: 'select', label: 'Группа', value: '' }, isDisabled: false },
		})
		expect(select.findComponent({ name: 'BaseSelect' }).props('options')).toEqual([])
	})
})
