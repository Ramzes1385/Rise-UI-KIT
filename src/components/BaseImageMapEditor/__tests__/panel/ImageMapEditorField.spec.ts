import { nextTick } from 'vue'
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

	const COLOR: EditorField = {
		key: 'fill',
		kind: 'color',
		label: 'Заливка',
		value: 'var(--rise-primary)',
		options: [
			{ value: '', label: 'Свой цвет' },
			{ value: 'var(--rise-primary)', label: 'Основной' },
		],
	}

	it('color: выбор токена и ввод своего цвета; токен выбран, только если значение из палитры', async () => {
		const wrapper = mount(ImageMapEditorField, { props: { field: COLOR, isDisabled: false } })
		const select = wrapper.findComponent({ name: 'BaseSelect' })
		const input = wrapper.findComponent({ name: 'BaseInput' })
		expect(select.props('modelValue')).toBe('var(--rise-primary)')
		expect(select.props('label')).toBe('Заливка: из палитры')
		expect(input.props('modelValue')).toBe('var(--rise-primary)')
		select.vm.$emit('update:modelValue', 'var(--rise-primary)')
		select.vm.$emit('update:modelValue', '')
		input.vm.$emit('update:modelValue', '#ff0000')
		input.vm.$emit('update:modelValue', null)
		expect(wrapper.emitted('update')).toEqual([['var(--rise-primary)'], [''], ['#ff0000'], ['']])
		await wrapper.setProps({ field: { ...COLOR, value: '#ff0000' } })
		expect(select.props('modelValue')).toBe('')
		select.vm.$emit('update:modelValue', '')
		select.vm.$emit('update:modelValue', null)
		expect(wrapper.emitted('update')).toHaveLength(4)
		await wrapper.setProps({ field: { ...COLOR, value: 5, options: undefined } })
		expect(select.props('options')).toEqual([])
	})

	it('color: выбор цвета — BaseColorPicker с палитрой токенов кита, показывает значение поля или подсказку', async () => {
		const wrapper = mount(ImageMapEditorField, {
			props: { field: { ...COLOR, placeholder: 'var(--rise-primary)', value: '' }, isDisabled: true },
		})
		const picker = wrapper.findComponent({ name: 'BaseColorPicker' })

		expect(picker.props('modelValue')).toBe('var(--rise-primary)')
		expect(picker.props('ariaLabel')).toBe('Заливка')
		expect(picker.props('isDisabled')).toBe(true)
		expect(picker.props('palettes')).toEqual([expect.objectContaining({ label: 'Токены кита' })])
		picker.vm.$emit('update:modelValue', 'var(--rise-error)')
		expect(wrapper.emitted('update')).toEqual([['var(--rise-error)']])
		await wrapper.setProps({ field: { ...COLOR, value: '#ff0000', placeholder: undefined } })
		expect(picker.props('modelValue')).toBe('#ff0000')
		await wrapper.setProps({ field: { ...COLOR, value: '', placeholder: undefined } })
		expect(picker.props('modelValue')).toBe('')
	})

	it('trimOnBlur: пробелы по краям убираются, когда поле теряет фокус; без флага и без пробелов — нет', async () => {
		const field: EditorField = { key: 'name', kind: 'text', label: 'Имя', value: ' a b ', isTrimmedOnBlur: true }
		const wrapper = mount(ImageMapEditorField, { props: { field, isDisabled: false } })
		await wrapper.findComponent({ name: 'BaseInput' }).vm.$emit('blur', new FocusEvent('blur'))
		expect(wrapper.emitted('update')).toEqual([['a b']])
		await wrapper.setProps({ field: { ...field, value: 'a b' } })
		await wrapper.findComponent({ name: 'BaseInput' }).vm.$emit('blur', new FocusEvent('blur'))
		await wrapper.setProps({ field: { ...field, value: ' a ', isTrimmedOnBlur: false } })
		await wrapper.findComponent({ name: 'BaseInput' }).vm.$emit('blur', new FocusEvent('blur'))
		expect(wrapper.emitted('update')).toHaveLength(1)
		const color = mount(ImageMapEditorField, {
			props: { field: { ...COLOR, value: ' #fff ', isTrimmedOnBlur: true }, isDisabled: false },
		})
		await color.findComponent({ name: 'BaseInput' }).vm.$emit('blur', new FocusEvent('blur'))
		expect(color.emitted('update')).toEqual([['#fff']])
	})

	it('черновик: введённое значение держится в поле, пока документ не изменился; потеря фокуса возвращает значение документа', async () => {
		const field: EditorField = { key: 'title', kind: 'text', label: 'Название', value: 'Зал', error: 'Ошибка' }
		const wrapper = mount(ImageMapEditorField, { props: { field, isDisabled: false } })
		const input = wrapper.findComponent({ name: 'BaseInput' })
		input.vm.$emit('update:modelValue', '')
		await nextTick()
		expect(input.props('modelValue')).toBe('')
		input.vm.$emit('blur', new FocusEvent('blur'))
		await nextTick()
		expect(input.props('modelValue')).toBe('Зал')
		expect(wrapper.emitted('update')).toEqual([['']])
		input.vm.$emit('update:modelValue', 'Холл')
		await wrapper.setProps({ field: { ...field, value: 'Холл', error: '' } })
		expect(input.props('modelValue')).toBe('Холл')
	})
})
