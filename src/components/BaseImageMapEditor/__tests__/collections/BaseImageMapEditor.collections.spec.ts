import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { fireEvent, screen } from '@testing-library/vue'
import BaseImageMapEditor from '../../ui/BaseImageMapEditor.vue'
import ImageMapEditorRows from '../../ui/ImageMapEditorRows.vue'
import ImageMapEditorField from '../../ui/ImageMapEditorField.vue'
import { makeMap, makeSvgMap, renderEditor } from '../utils/editorTestUtils'
import type { ImageMapData } from '@components/BaseImageMap/types/imageMapData.types'
import type { EditorField, EditorFieldValue } from '../../types/imageMapEditorInternal.types'
import type { ImageMap3DData, ImageMap3DObject } from '@components/BaseImageMap3D/types/imageMap3dData.types'

function collectionMap(): ImageMapData {
	const map = makeMap()
	map.filters = [
		{
			id: 'kind',
			title: 'Вид',
			options: [
				{ value: 'a', label: 'А' },
				{ value: 'b', label: 'Б' },
			],
			value: ['a'],
		},
		{ id: 'plain', title: 'По группам' },
	]
	map.styles = { accent: { base: { fill: 'red' } }, calm: { base: { stroke: 'blue' } } }
	map.objects[0] = { ...map.objects[0]!, style: 'accent' } as ImageMapData['objects'][number]
	map.groups = [{ id: 'g1', title: 'Магазины', style: 'calm' }]
	return map
}

function mountEditor(props: Record<string, unknown> = {}) {
	return mount(BaseImageMapEditor, { props: { modelValue: collectionMap(), ...props } })
}

function rows(wrapper: VueWrapper, index: number) {
	return wrapper.findAllComponents(ImageMapEditorRows)[index]!
}

function last(wrapper: VueWrapper): ImageMapData {
	return wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ImageMapData
}

async function edit(wrapper: VueWrapper, at: { label: string; row: number; key: string }, value: EditorFieldValue): Promise<void> {
	const { label, row, key } = at
	const target = rows(wrapper, row)
		.findAllComponents(ImageMapEditorField)
		.find(item => (item.props('field') as EditorField).key === key && (item.props('field') as EditorField).label === label)
	if (!target) throw new Error(`${label}/${key}`)
	target.vm.$emit('update', value)
	await nextTick()
}

describe('BaseImageMapEditor: фильтры', () => {
	it('показывает фильтры карты: поля, варианты и пояснение для фильтра по группам', () => {
		renderEditor({ modelValue: collectionMap() })
		expect(screen.getByRole('heading', { name: 'Фильтры' })).toBeInTheDocument()
		expect(screen.getByRole('group', { name: 'Вид' })).toBeInTheDocument()
		expect(screen.getByRole('group', { name: 'Варианты фильтра «Вид»' })).toBeInTheDocument()
		expect(screen.getAllByLabelText('Название фильтра').map(input => (input as HTMLInputElement).value)).toEqual(['Вид', 'По группам'])
		expect(screen.getByText('Без вариантов фильтр работает по группам объектов')).toBeInTheDocument()
	})

	it('без фильтров — подсказка; добавление создаёт фильтр с уникальным id', async () => {
		const wrapper = mountEditor({ modelValue: makeMap() })
		expect(wrapper.text()).toContain('Фильтров пока нет')
		await rows(wrapper, 0).findAll('button').at(-1)?.trigger('click')
		await rows(wrapper, 0).findAll('button').at(-1)?.trigger('click')
		expect(last(wrapper).filters).toEqual([
			{ id: 'filter-1', title: 'Фильтр 1' },
			{ id: 'filter-2', title: 'Фильтр 2' },
		])
	})

	it('правка полей: название, вид и сочетание попадают в JSON', async () => {
		const wrapper = mountEditor()
		await edit(wrapper, { label: 'Название фильтра', row: 0, key: 'title' }, 'Тип зала')
		await edit(wrapper, { label: 'Вид фильтра', row: 0, key: 'type' }, 'tags')
		await edit(wrapper, { label: 'Сочетание вариантов', row: 0, key: 'logic' }, 'and')
		expect(last(wrapper).filters?.[0]).toMatchObject({ title: 'Тип зала', type: 'tags', logic: 'and' })
	})

	it('пробел внутри названия сохраняется, пустое название и занятый id — ошибка поля без правки JSON', async () => {
		const wrapper = mountEditor()
		await edit(wrapper, { label: 'Название фильтра', row: 0, key: 'title' }, 'Тип ')
		expect(last(wrapper).filters?.[0]?.title).toBe('Тип ')
		const count = wrapper.emitted('update:modelValue')?.length
		await edit(wrapper, { label: 'Название фильтра', row: 0, key: 'title' }, '  ')
		await edit(wrapper, { label: 'Id фильтра', row: 0, key: 'id' }, 'plain')
		expect(wrapper.emitted('update:modelValue')).toHaveLength(count ?? 0)
		const errors = rows(wrapper, 0)
			.findAllComponents(ImageMapEditorField)
			.map(item => (item.props('field') as EditorField).error)
			.filter(Boolean)
		expect(errors).toEqual(['Такой id уже есть', 'Заполните поле'])
		await edit(wrapper, { label: 'Id фильтра', row: 0, key: 'id' }, 'free')
		expect(last(wrapper).filters?.[0]?.id).toBe('free')
	})

	it('варианты: добавить, переименовать, значение переносится в выбранные, удалить', async () => {
		const wrapper = mountEditor()
		await rows(wrapper, 0).find('[role="group"]').findAll('button').at(-1)?.trigger('click')
		expect(last(wrapper).filters?.[0]?.options?.at(-1)).toEqual({ value: 'option-1', label: 'Вариант 3' })
		const option = rows(wrapper, 0).findAllComponents(ImageMapEditorField)
		const valueField = option.find(item => (item.props('field') as EditorField).label === 'Значение (метка объекта)')
		valueField?.vm.$emit('update', 'zal')
		await nextTick()
		expect(last(wrapper).filters?.[0]?.options?.[0]?.value).toBe('zal')
		expect(last(wrapper).filters?.[0]?.value).toEqual(['zal'])
		const count = wrapper.emitted('update:modelValue')?.length
		valueField?.vm.$emit('update', 'b')
		await nextTick()
		expect(wrapper.emitted('update:modelValue')).toHaveLength(count ?? 0)
		expect(wrapper.text()).toContain('Такое значение уже есть')
	})

	it('удаление фильтра и варианта переводит фокус на ближайшую строку или кнопку добавления', async () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: collectionMap() }, attachTo: document.body })
		const buttons = (): HTMLElement[] =>
			Array.from(
				(wrapper.element as HTMLElement)
					.querySelectorAll<HTMLElement>('.base-image-map-editor__rows')[0]!
					.querySelectorAll('button'),
			)
		const deleteOption = buttons().find(button => button.textContent?.includes('Удалить вариант «А»'))
		await deleteOption?.click()
		await nextTick()
		await nextTick()
		expect(document.activeElement?.textContent).toContain('Удалить вариант «Б»')
		await buttons()
			.find(button => button.textContent?.includes('Удалить вариант «Б»'))
			?.click()
		await nextTick()
		await nextTick()
		expect(document.activeElement?.textContent).toContain('Добавить вариант')
		expect(last(wrapper).filters?.[0]).not.toHaveProperty('options')
		await buttons()
			.find(button => button.textContent?.includes('Удалить фильтр «Вид»'))
			?.click()
		await nextTick()
		await nextTick()
		expect(document.activeElement?.textContent).toContain('Удалить фильтр «По группам»')
		await buttons()
			.find(button => button.textContent?.includes('Удалить фильтр «По группам»'))
			?.click()
		await nextTick()
		await nextTick()
		expect(document.activeElement?.textContent).toContain('Добавить фильтр')
		expect(last(wrapper)).not.toHaveProperty('filters')
		wrapper.unmount()
	})

	it('isDisabled: правка фильтров не проходит', async () => {
		const wrapper = mountEditor({ isDisabled: true })
		const list = rows(wrapper, 0)
		list.vm.$emit('add')
		list.vm.$emit('remove', 0)
		list.vm.$emit('update', 0, 'title', 'x')
		list.vm.$emit('add-child', 0)
		list.vm.$emit('remove-child', 0, 0)
		list.vm.$emit('update-child', { index: 0, child: 0 }, 'label', 'x')
		await nextTick()
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
	})

	it('ошибки сбрасываются после замены карты', async () => {
		const wrapper = mountEditor()
		await edit(wrapper, { label: 'Название фильтра', row: 0, key: 'title' }, ' ')
		expect(wrapper.text()).toContain('Заполните поле')
		await wrapper.setProps({ modelValue: makeMap() })
		await nextTick()
		expect(wrapper.text()).not.toContain('Заполните поле')
	})
})

describe('BaseImageMapEditor: именованные стили', () => {
	it('показывает стили: имя, цвета с палитрой токенов, обводка, непрозрачность', () => {
		renderEditor({ modelValue: collectionMap() })
		expect(screen.getByRole('heading', { name: 'Стили' })).toBeInTheDocument()
		expect(screen.getByRole('group', { name: 'accent' })).toBeInTheDocument()
		expect(screen.getAllByLabelText('Имя стиля').map(input => (input as HTMLInputElement).value)).toEqual(['accent', 'calm'])
		expect(screen.getAllByLabelText('Заливка')).toHaveLength(2)
		expect(screen.getAllByLabelText('Заливка: из палитры')).toHaveLength(2)
	})

	it('добавление создаёт стиль со свободным именем; правка цвета, обводки и прозрачности', async () => {
		const wrapper = mountEditor()
		await rows(wrapper, 1).findAll('button').at(-1)?.trigger('click')
		expect(Object.keys(last(wrapper).styles ?? {})).toEqual(['accent', 'calm', 'style-1'])
		await edit(wrapper, { label: 'Заливка', row: 1, key: 'fill' }, 'var(--rise-success)')
		await edit(wrapper, { label: 'Обводка', row: 1, key: 'stroke' }, '#00ff00')
		await edit(wrapper, { label: 'Толщина обводки, px', row: 1, key: 'strokeWidth' }, 2.5)
		await edit(wrapper, { label: 'Непрозрачность заливки, 0–1', row: 1, key: 'fillOpacity' }, 0.4)
		expect(last(wrapper).styles?.accent?.base).toEqual({
			fill: 'var(--rise-success)',
			stroke: '#00ff00',
			strokeWidth: 2.5,
			fillOpacity: 0.4,
		})
		await edit(wrapper, { label: 'Заливка', row: 1, key: 'fill' }, '')
		expect(last(wrapper).styles?.accent?.base).not.toHaveProperty('fill')
	})

	it('переименование переносит ссылки; пустое и занятое имя — ошибка без правки', async () => {
		const wrapper = mountEditor()
		await edit(wrapper, { label: 'Имя стиля', row: 1, key: 'name' }, 'main')
		expect(Object.keys(last(wrapper).styles ?? {})).toEqual(['main', 'calm'])
		expect(last(wrapper).objects[0]?.style).toBe('main')
		const count = wrapper.emitted('update:modelValue')?.length
		await edit(wrapper, { label: 'Имя стиля', row: 1, key: 'name' }, 'calm')
		expect(wrapper.text()).toContain('Такое имя уже есть')
		await edit(wrapper, { label: 'Имя стиля', row: 1, key: 'name' }, '')
		expect(wrapper.emitted('update:modelValue')).toHaveLength(count ?? 0)
		expect(wrapper.text()).toContain('Заполните поле')
	})

	it('удаление снимает ссылки объектов и групп; фокус — на ближайшую строку', async () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: collectionMap() }, attachTo: document.body })
		const remove = (name: string) =>
			Array.from(
				(wrapper.element as HTMLElement)
					.querySelectorAll<HTMLElement>('.base-image-map-editor__rows')[1]!
					.querySelectorAll('button'),
			).find(button => button.textContent?.includes(name))
		remove('Удалить стиль «accent»')?.click()
		await nextTick()
		await nextTick()
		expect(last(wrapper).objects[0]).not.toHaveProperty('style')
		expect(document.activeElement?.textContent).toContain('Удалить стиль «calm»')
		remove('Удалить стиль «calm»')?.click()
		await nextTick()
		await nextTick()
		expect(last(wrapper)).not.toHaveProperty('styles')
		expect(last(wrapper).groups?.[0]).not.toHaveProperty('style')
		expect(document.activeElement?.textContent).toContain('Добавить стиль')
		wrapper.unmount()
	})

	it('isDisabled и чужой номер: стили не меняются', async () => {
		const wrapper = mountEditor({ isDisabled: true })
		const list = rows(wrapper, 1)
		list.vm.$emit('add')
		list.vm.$emit('remove', 0)
		list.vm.$emit('update', 0, 'fill', 'x')
		await nextTick()
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
		const enabled = mountEditor()
		const enabledList = rows(enabled, 1)
		enabledList.vm.$emit('remove', 9)
		enabledList.vm.$emit('update', 9, 'fill', 'x')
		enabledList.vm.$emit('update', 0, 'name', 'x')
		enabledList.vm.$emit('update', 0, 'unknown', 'x')
		await nextTick()
		expect(Object.keys(last(enabled).styles ?? {})).toEqual(['x', 'calm'])
		expect(enabled.emitted('update:modelValue')).toHaveLength(1)
	})

	it('группа выбирает стиль из списка', async () => {
		const wrapper = mountEditor()
		const field = wrapper
			.findAllComponents(ImageMapEditorField)
			.find(item => (item.props('field') as EditorField).key === 'style' && (item.props('field') as EditorField).label === 'Стиль')
		expect(field?.props('field')).toMatchObject({ kind: 'select', value: 'calm' })
		field?.vm.$emit('update', 'accent')
		await nextTick()
		expect(last(wrapper).groups?.[0]?.style).toBe('accent')
		field?.vm.$emit('update', '')
		await nextTick()
		expect(last(wrapper).groups?.[0]).not.toHaveProperty('style')
	})

	it('Undo возвращает удалённый стиль', async () => {
		const wrapper = mountEditor()
		rows(wrapper, 1).vm.$emit('remove', 0)
		await nextTick()
		expect(last(wrapper).styles).not.toHaveProperty('accent')
		;(wrapper.vm as unknown as { undo: () => boolean }).undo()
		await nextTick()
		expect(last(wrapper).styles).toHaveProperty('accent')
	})
})

function svgMap(): ImageMap3DData {
	const map = makeSvgMap() as ImageMap3DData
	map.scene3d = { bevel: 2 }
	return map
}

function mountSvg(props: Record<string, unknown> = {}) {
	return mount(BaseImageMapEditor, { props: { modelValue: svgMap(), has3dFields: true, selected: 's1', ...props } })
}

function partsRows(wrapper: VueWrapper) {
	return wrapper.findAllComponents(ImageMapEditorRows)[0]!
}

function partsOf(wrapper: VueWrapper): ImageMap3DObject['parts'] {
	return (last(wrapper).objects[0] as ImageMap3DObject).parts
}

describe('BaseImageMapEditor: части объекта и сцена в 3D', () => {
	it('части видны только у объекта svg при has3dFields', () => {
		renderEditor({ modelValue: svgMap(), has3dFields: true, selected: 's1' })
		expect(screen.getByRole('group', { name: 'Части объекта' })).toBeInTheDocument()
		expect(screen.getByText('Без частей тело объекта строится по его элементу SVG')).toBeInTheDocument()
		expect(screen.getByLabelText('Скос кромок')).toBeInTheDocument()
		expect(screen.getByRole('switch', { name: 'Контур по рёбрам' })).toBeChecked()
	})

	it('у объекта другого вида и без has3dFields частей нет', () => {
		renderEditor({ modelValue: makeMap(), has3dFields: true, selected: 'r1' })
		expect(screen.queryByRole('group', { name: 'Части объекта' })).toBeNull()
		expect(screen.getByLabelText('Скос кромок')).toBeInTheDocument()
	})

	it('добавление, правка и удаление частей', async () => {
		const wrapper = mountSvg()
		partsRows(wrapper).vm.$emit('add')
		partsRows(wrapper).vm.$emit('add')
		await nextTick()
		expect(partsOf(wrapper)).toEqual([{ elementId: 's1' }, { elementId: 's1' }])
		partsRows(wrapper).vm.$emit('update', 1, 'elementId', 'roof')
		partsRows(wrapper).vm.$emit('update', 1, 'height3d', 12)
		partsRows(wrapper).vm.$emit('update', 1, 'base3d', 4)
		await nextTick()
		expect(partsOf(wrapper)?.[1]).toEqual({ elementId: 'roof', height3d: 12, base3d: 4 })
		expect(wrapper.text()).toContain('Часть 2: roof')
		partsRows(wrapper).vm.$emit('update', 1, 'base3d', null)
		partsRows(wrapper).vm.$emit('remove', 0)
		partsRows(wrapper).vm.$emit('remove', 0)
		await nextTick()
		expect(last(wrapper).objects[0]).not.toHaveProperty('parts')
	})

	it('ошибки частей: пустой id и отрицательная высота — ошибка поля, JSON не меняется; смена выделения сбрасывает', async () => {
		const wrapper = mountSvg()
		partsRows(wrapper).vm.$emit('add')
		await nextTick()
		const count = wrapper.emitted('update:modelValue')?.length
		partsRows(wrapper).vm.$emit('update', 0, 'elementId', '  ')
		partsRows(wrapper).vm.$emit('update', 0, 'height3d', -3)
		await nextTick()
		expect(wrapper.emitted('update:modelValue')).toHaveLength(count ?? 0)
		expect(wrapper.text()).toContain('Ожидается непустая строка')
		expect(wrapper.text()).toContain('Ожидается число не меньше 0')
		await wrapper.setProps({ selected: undefined })
		await nextTick()
		await wrapper.setProps({ selected: 's1' })
		expect(wrapper.text()).not.toContain('Ожидается непустая строка')
	})

	it('части: без выделения и при isDisabled правка не проходит', async () => {
		const wrapper = mountSvg()
		const rowsList = partsRows(wrapper)
		await wrapper.setProps({ isDisabled: true })
		rowsList.vm.$emit('add')
		rowsList.vm.$emit('update', 0, 'elementId', 'x')
		await nextTick()
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
		await wrapper.setProps({ isDisabled: false, selected: undefined })
		const fieldsCount = wrapper.findAllComponents(ImageMapEditorRows).length
		expect(fieldsCount).toBe(2)
	})

	it('скос и контур сцены: значения попадают в scene3d, умолчание контура не хранится', async () => {
		const wrapper = mountSvg()
		const field = (key: string) =>
			wrapper.findAllComponents(ImageMapEditorField).find(item => (item.props('field') as EditorField).key === key)
		field('bevel')?.vm.$emit('update', 0.5)
		await nextTick()
		expect((last(wrapper) as ImageMap3DData).scene3d).toEqual({ bevel: 0.5 })
		field('outline')?.vm.$emit('update', false)
		await nextTick()
		expect((last(wrapper) as ImageMap3DData).scene3d).toEqual({ bevel: 0.5, outline: false })
		field('outline')?.vm.$emit('update', true)
		await nextTick()
		expect((last(wrapper) as ImageMap3DData).scene3d).toEqual({ bevel: 0.5 })
		field('bevel')?.vm.$emit('update', -1)
		await nextTick()
		expect(field('bevel')?.props('field')).toMatchObject({ error: 'Ожидается число не меньше 0' })
	})
})

describe('BaseImageMapEditor: адрес модели обрезается при потере фокуса', () => {
	it('пробел внутри адреса набирается, края убираются на blur', async () => {
		const map = makeMap() as ImageMap3DData
		const { emitted } = renderEditor({ modelValue: map, has3dFields: true })
		const input = screen.getByLabelText('Модель этажа (GLB)') as HTMLInputElement
		await fireEvent.update(input, ' /maps/my floor.glb ')
		const models = (): string[] =>
			(emitted()['update:modelValue'] as ImageMap3DData[][]).map(call => call[0]?.layers[0]?.model?.url ?? '')
		expect(models().at(-1)).toBe(' /maps/my floor.glb ')
		await fireEvent.blur(input)
		expect(models().at(-1)).toBe('/maps/my floor.glb')
	})
})
