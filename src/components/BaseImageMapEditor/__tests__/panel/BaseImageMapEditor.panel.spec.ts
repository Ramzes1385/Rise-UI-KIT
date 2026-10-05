import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { fireEvent, screen } from '@testing-library/vue'
import BaseImageMapEditor from '../../ui/BaseImageMapEditor.vue'
import ImageMapEditorField from '../../ui/ImageMapEditorField.vue'
import type { ImageMapData } from '@components/BaseImageMap/types/imageMapData.types'
import type { EditorField, EditorFieldValue } from '../../types/imageMapEditorInternal.types'
import { lastModel, makeMap, makeSvgMap, renderEditor, statusOf } from '../utils/editorTestUtils'

function modelObject(emitted: () => Record<string, unknown[][]>, id: string) {
	return lastModel(emitted)?.objects.find(object => object.id === id)
}

function mountEditor(props: Record<string, unknown> = {}) {
	return mount(BaseImageMapEditor, { props: { modelValue: makeMap(), ...props } })
}

function fields(wrapper: VueWrapper, key: string) {
	return wrapper.findAllComponents(ImageMapEditorField).filter(field => (field.props('field') as EditorField).key === key)
}

async function setField(wrapper: VueWrapper, key: string, value: EditorFieldValue): Promise<void> {
	const field = fields(wrapper, key)[0]
	if (!field) throw new Error(key)
	field.vm.$emit('update', value)
	await nextTick()
}

function lastWrapperModel(wrapper: VueWrapper): ImageMapData {
	return wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ImageMapData
}

describe('BaseImageMapEditor панель: объекты слоя', () => {
	it('показывает объекты текущего слоя с типом и отмечает выделенный', async () => {
		const { emitted } = renderEditor({ selected: 'r1' })
		expect(screen.getByRole('button', { name: /^Зал\s*Прямоугольник$/ })).toHaveAttribute('aria-current', 'true')
		expect(screen.getByRole('button', { name: /^Вход\s*Точка$/ })).not.toHaveAttribute('aria-current')
		expect(screen.getByRole('button', { name: /^Сквер\s*Многоугольник$/ })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: /Фонтан/ })).toBeNull()
		await fireEvent.click(screen.getByRole('button', { name: /^Вход\s*Точка$/ }))
		expect(emitted()['update:selected']).toEqual([['p1']])
		await fireEvent.click(screen.getByRole('button', { name: /^Вход\s*Точка$/ }))
		expect(emitted()['update:selected']).toHaveLength(1)
	})

	it('смена этажа снимает выделение объекта не с этого слоя', async () => {
		const { emitted } = renderEditor({ selected: 'r1' })
		await fireEvent.click(screen.getByRole('button', { name: 'Второй' }))
		expect(emitted()['update:layer']).toEqual([['l2']])
		expect(emitted()['update:selected']).toEqual([[null]])
		expect(screen.getByText('Выделите объект на холсте или в списке')).toBeInTheDocument()
		await fireEvent.click(screen.getByRole('button', { name: 'Второй' }))
		expect(emitted()['update:layer']).toHaveLength(1)
	})

	it('пустой слой — подсказка «На этом слое пока нет объектов»', () => {
		const map = makeMap()
		map.objects = []
		renderEditor({ modelValue: map })
		expect(screen.getByText('На этом слое пока нет объектов')).toBeInTheDocument()
		expect(screen.getByText('Выделите объект на холсте или в списке')).toBeInTheDocument()
	})

	it('выделение удалённого снаружи объекта снимается', async () => {
		const { emitted, rerender } = renderEditor({ selected: 'r1' })
		const map = makeMap()
		map.objects = map.objects.filter(object => object.id !== 'r1')
		await rerender({ modelValue: map })
		expect(emitted()['update:selected']).toEqual([[null]])
	})
})

describe('BaseImageMapEditor панель: свойства объекта', () => {
	it('разделы свойств — fieldset с легендами', () => {
		renderEditor({ selected: 'p1' })
		for (const name of ['Основное', 'Положение и размер, %', 'Действие', 'Оформление', 'Список и фильтры'])
			expect(screen.getByRole('group', { name })).toBeInTheDocument()
		expect(screen.getByLabelText('Подпись на карте')).toBeInTheDocument()
		expect(screen.getByLabelText('Размер, px')).toBeInTheDocument()
	})

	it('«Название» меняет строку списка; ввод подряд — один шаг истории', async () => {
		const { emitted } = renderEditor({ selected: 'r1' })
		await fireEvent.update(screen.getByLabelText('Название'), 'Зал А')
		await fireEvent.update(screen.getByLabelText('Название'), 'Зал Б')
		expect(screen.getByRole('button', { name: /^Зал Б\s*Прямоугольник$/ })).toBeInTheDocument()
		expect(modelObject(emitted, 'r1')).toMatchObject({ title: 'Зал Б' })
		await fireEvent.click(screen.getByRole('button', { name: 'Отменить (Ctrl+Z)' }))
		expect(modelObject(emitted, 'r1')).toMatchObject({ title: 'Зал' })
		expect(screen.getByRole('button', { name: 'Отменить (Ctrl+Z)' })).toHaveAttribute('aria-disabled', 'true')
	})

	it('id: пустой и занятый не применяются, новый — сохраняет выделение', async () => {
		const { emitted } = renderEditor({ selected: 'r1' })
		const id = screen.getByLabelText('Id')
		await fireEvent.update(id, '  ')
		expect(screen.getByText('Укажите id')).toBeInTheDocument()
		await fireEvent.update(id, 'p1')
		expect(screen.getByText('Такой id уже есть')).toBeInTheDocument()
		expect(emitted()['update:modelValue']).toBeUndefined()
		await fireEvent.update(id, ' hall ')
		expect(screen.queryByText('Такой id уже есть')).toBeNull()
		expect(modelObject(emitted, 'hall')).toMatchObject({ title: 'Зал' })
		expect(emitted()['update:selected']).toEqual([['hall']])
		expect(screen.getByRole('button', { name: /^Зал\s*Прямоугольник$/ })).toHaveAttribute('aria-current', 'true')
	})

	it('положение и размер — в процентах', async () => {
		const { emitted } = renderEditor({ selected: 'r1' })
		expect((screen.getByLabelText('Слева') as HTMLInputElement).value).toMatch(/^10([.,]0+)?$/)
		await fireEvent.update(screen.getByLabelText('Слева'), '50')
		await fireEvent.update(screen.getByLabelText('Высота'), '25')
		expect(modelObject(emitted, 'r1')).toMatchObject({ x: 0.5, height: 0.25 })
	})

	it('вершины многоугольника: строки «слева; сверху», ошибка при неверном вводе', async () => {
		const { emitted } = renderEditor({ selected: 'pg' })
		const points = screen.getByLabelText('Вершины: «слева; сверху» на строку')
		expect(points).toHaveValue('60; 60\n80; 60\n70; 80')
		await fireEvent.update(points, '10; 10\n20; 20')
		expect(screen.getByText('Нужно не меньше трёх строк вида «10; 20»')).toBeInTheDocument()
		await fireEvent.update(points, '10; 10\n20; 10\n15; 30')
		expect(modelObject(emitted, 'pg')).toMatchObject({
			points: [
				[0.1, 0.1],
				[0.2, 0.1],
				[0.15, 0.3],
			],
		})
	})

	it('svg-объект: id элемента не может быть пустым, поля этажа нет', async () => {
		const { emitted } = renderEditor({ modelValue: makeSvgMap(), selected: 's1' })
		const elementId = screen.getByLabelText('Id элемента SVG')
		await fireEvent.update(elementId, '')
		expect(screen.getByText('Укажите id')).toBeInTheDocument()
		await fireEvent.update(elementId, 'hall')
		expect(modelObject(emitted, 's1')).toMatchObject({ elementId: 'hall' })
		expect(screen.queryByText('Этаж', { selector: 'label' })).toBeNull()
	})

	it('действие «Ссылка» и «Переход на этаж» показывают свои поля', async () => {
		const wrapper = mountEditor({ selected: 'r1' })
		expect(fields(wrapper, 'link')).toHaveLength(0)
		await setField(wrapper, 'action', 'link')
		expect(fields(wrapper, 'link')).toHaveLength(1)
		expect(fields(wrapper, 'isLinkExternal')).toHaveLength(1)
		await setField(wrapper, 'isLinkExternal', true)
		await setField(wrapper, 'action', 'layer')
		expect(fields(wrapper, 'targetLayer')).toHaveLength(1)
		await setField(wrapper, 'targetLayer', 'l2')
		expect(lastWrapperModel(wrapper).objects[0]).toMatchObject({ action: 'layer', targetLayer: 'l2', isLinkExternal: true })
		await setField(wrapper, 'action', '')
		expect(lastWrapperModel(wrapper).objects[0]).not.toHaveProperty('action')
		wrapper.unmount()
	})

	it('группа, этаж, оформление и метки; пустое значение удаляет поле', async () => {
		const wrapper = mountEditor({ selected: 'r1' })
		await setField(wrapper, 'group', 'g1')
		await setField(wrapper, 'style.fill', 'red')
		await setField(wrapper, 'style.fillOpacity', 0.5)
		await setField(wrapper, 'tags', ['кафе'])
		await setField(wrapper, 'isDisabled', true)
		expect(lastWrapperModel(wrapper).objects[0]).toMatchObject({
			group: 'g1',
			style: { base: { fill: 'red', fillOpacity: 0.5 } },
			tags: ['кафе'],
			isDisabled: true,
		})
		await setField(wrapper, 'isDisabled', false)
		await setField(wrapper, 'tags', [])
		expect(lastWrapperModel(wrapper).objects[0]).not.toHaveProperty('isDisabled')
		expect(lastWrapperModel(wrapper).objects[0]).not.toHaveProperty('tags')
		await setField(wrapper, 'layer', 'l2')
		expect(lastWrapperModel(wrapper).objects[0]).toMatchObject({ layer: 'l2' })
		wrapper.unmount()
	})

	it('именованные стили — выбор стиля вместо цветов', async () => {
		const map = makeMap()
		map.styles = { accent: { base: { fill: 'gold' } } }
		const wrapper = mountEditor({ modelValue: map, selected: 'r1' })
		expect(fields(wrapper, 'style.fill')).toHaveLength(1)
		await setField(wrapper, 'styleName', 'accent')
		expect(lastWrapperModel(wrapper).objects[0]).toMatchObject({ style: 'accent' })
		expect(fields(wrapper, 'style.fill')).toHaveLength(0)
		wrapper.unmount()
	})

	it('смена выделения сбрасывает ошибки полей', async () => {
		const { rerender } = renderEditor({ selected: 'r1' })
		await fireEvent.update(screen.getByLabelText('Id'), '')
		expect(screen.getByText('Укажите id')).toBeInTheDocument()
		await rerender({ selected: 'p1' })
		expect(screen.queryByText('Укажите id')).toBeNull()
	})

	it('isDisabled: правки полей не применяются', async () => {
		const wrapper = mountEditor({ selected: 'r1', isDisabled: true })
		for (const field of fields(wrapper, 'title')) field.vm.$emit('update', 'Новое')
		await nextTick()
		expect(fields(wrapper, 'title')).toHaveLength(3)
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
		wrapper.unmount()
	})

	it('без выделения поле объекта не применяется', async () => {
		const wrapper = mountEditor({ selected: 'r1' })
		const field = fields(wrapper, 'title')[0]
		await wrapper.setProps({ selected: null })
		field?.vm.$emit('update', 'x')
		await nextTick()
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
		wrapper.unmount()
	})

	it('правка поля объекта, удалённого в той же правке, ничего не ломает', async () => {
		const wrapper = mountEditor({ selected: 'r1' })
		const field = fields(wrapper, 'title')[0]
		const map = makeMap()
		map.objects = map.objects.filter(object => object.id !== 'r1')
		await wrapper.setProps({ modelValue: map, selected: 'r1' })
		field?.vm.$emit('update', 'x')
		await nextTick()
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
		wrapper.unmount()
	})
})

describe('BaseImageMapEditor панель: объектные кнопки', () => {
	it('«Дублировать» копирует со сдвигом и выделяет копию; svg-объект не дублируется', async () => {
		const { emitted, rerender } = renderEditor({ selected: 'p1' })
		await fireEvent.click(screen.getByRole('button', { name: 'Дублировать (Ctrl+D)' }))
		expect(modelObject(emitted, 'point-1')).toMatchObject({ x: 0.52, y: 0.52, title: 'Вход' })
		expect(emitted()['update:selected']).toEqual([['point-1']])
		await rerender({ modelValue: makeSvgMap(), selected: 's1' })
		expect(screen.getByRole('button', { name: 'Дублировать (Ctrl+D)' })).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByRole('button', { name: 'Удалить (Delete)' })).toBeEnabled()
	})

	it('без выделения «Удалить» и «Дублировать» недоступны', () => {
		renderEditor()
		expect(screen.getByRole('button', { name: 'Дублировать (Ctrl+D)' })).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByRole('button', { name: 'Удалить (Delete)' })).toHaveAttribute('aria-disabled', 'true')
	})

	it('Ctrl+D без выделения и при isDisabled ничего не делает; deleteSelected при isDisabled — тоже', async () => {
		const wrapper = mountEditor()
		await wrapper.trigger('keydown', { key: 'd', ctrlKey: true })
		await wrapper.setProps({ selected: 'r1', isDisabled: true })
		;(wrapper.vm as unknown as { deleteSelected: () => void }).deleteSelected()
		await nextTick()
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
		await wrapper.setProps({ isDisabled: false, modelValue: makeSvgMap(), selected: 's1' })
		await wrapper.trigger('keydown', { key: 'd', ctrlKey: true })
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
		wrapper.unmount()
	})
})

describe('BaseImageMapEditor панель: этажи', () => {
	it('кнопки этажей: выбор, «Выше»/«Ниже» недоступны на краях', async () => {
		const { emitted } = renderEditor()
		expect(screen.getByRole('button', { name: 'Первый' })).toHaveAttribute('aria-current', 'true')
		expect(screen.getByRole('button', { name: 'Выше: «Первый»' })).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByRole('button', { name: 'Ниже: «Второй»' })).toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(screen.getByRole('button', { name: 'Ниже: «Первый»' }))
		const model = lastModel(emitted)
		expect(model.layers.map(layer => layer.id)).toEqual(['l2', 'l1'])
		expect(model.objects.find(object => object.id === 'r1')).toMatchObject({ layer: 'l1' })
		await fireEvent.click(screen.getByRole('button', { name: 'Выше: «Первый»' }))
		expect(lastModel(emitted).layers.map(layer => layer.id)).toEqual(['l1', 'l2'])
	})

	it('удаление этажа удаляет его объекты и показывает следующий', async () => {
		const { container, emitted } = renderEditor()
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить этаж «Первый»' }))
		await nextTick()
		const model = lastModel(emitted)
		expect(model.layers.map(layer => layer.id)).toEqual(['l2'])
		expect(model.objects.map(object => object.id)).toEqual(['e1'])
		expect(screen.getByRole('button', { name: 'Второй' })).toHaveAttribute('aria-current', 'true')
		expect(screen.getByRole('button', { name: /^Фонтан\s*Эллипс$/ })).toBeInTheDocument()
		expect(statusOf(container).textContent).not.toBe('')
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить этаж «Второй»' }))
		expect(screen.getByText('Откройте картинку или SVG — это будет первый этаж карты')).toBeInTheDocument()
	})

	it('поля этажа: название, подпись, размеры; неверный размер не применяется', async () => {
		const { emitted } = renderEditor()
		expect(screen.getByLabelText('Адрес картинки')).toHaveValue('https://example.com/1.png')
		await fireEvent.update(screen.getByLabelText('Название этажа'), 'Цоколь')
		expect(screen.getByRole('button', { name: 'Цоколь' })).toBeInTheDocument()
		await fireEvent.update(screen.getByLabelText('Короткая подпись'), '')
		expect(lastModel(emitted).layers[0]).not.toHaveProperty('shortTitle')
		await fireEvent.update(screen.getByLabelText('Ширина картинки'), '1200')
		expect(lastModel(emitted).layers[0]).toMatchObject({ width: 1200, title: 'Цоколь' })
		const before = emitted()['update:modelValue']?.length
		await fireEvent.update(screen.getByLabelText('Высота картинки'), '0')
		expect(emitted()['update:modelValue']).toHaveLength(before as number)
	})

	it('картинка data URL показывается пустым адресом; у SVG-слоя поля адреса нет, у svgUrl — есть', async () => {
		const map = makeMap()
		map.layers[0] = { ...map.layers[0], image: 'data:image/png;base64,AAAA' } as ImageMapData['layers'][number]
		const { rerender } = renderEditor({ modelValue: map })
		expect(screen.getByLabelText('Адрес картинки')).toHaveValue('')
		await rerender({ modelValue: makeSvgMap() })
		expect(screen.queryByLabelText('Адрес картинки')).toBeNull()
		const remote = makeSvgMap()
		remote.layers[0] = { id: 'f1', title: 'Этаж', svgUrl: 'https://example.com/plan.svg', width: 800, height: 400 }
		vi.stubGlobal(
			'fetch',
			vi.fn(() => new Promise(() => undefined)),
		)
		await rerender({ modelValue: remote })
		expect(screen.getByLabelText('Адрес SVG')).toHaveValue('https://example.com/plan.svg')
		expect(screen.getByRole('button', { name: 'Объекты из SVG' })).toBeInTheDocument()
		vi.unstubAllGlobals()
	})
})

describe('BaseImageMapEditor панель: группы', () => {
	it('добавление, переименование, цвет и удаление группы', async () => {
		const { emitted } = renderEditor()
		await fireEvent.click(screen.getByRole('button', { name: 'Добавить группу' }))
		expect(lastModel(emitted).groups?.[1]).toEqual({ id: 'group-1', title: 'Группа 2' })
		expect(screen.getByRole('group', { name: 'Группа 2' })).toBeInTheDocument()
		const titles = screen.getAllByLabelText('Название группы')
		await fireEvent.update(titles[1] as HTMLElement, 'Кафе')
		expect(screen.getByRole('group', { name: 'Кафе' })).toBeInTheDocument()
		const before = emitted()['update:modelValue']?.length
		await fireEvent.update(titles[1] as HTMLElement, '   ')
		expect(emitted()['update:modelValue']).toHaveLength(before as number)
		await fireEvent.update(screen.getAllByLabelText('Цвет')[1] as HTMLElement, 'red')
		expect(lastModel(emitted).groups?.[1]).toMatchObject({ color: 'red' })
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить группу «Магазины»' }))
		const model = lastModel(emitted)
		expect(model.groups?.map(group => group.id)).toEqual(['group-1'])
		expect(model.objects.find(object => object.id === 'p1')).not.toHaveProperty('group')
	})

	it('первая группа на карте без групп', async () => {
		const map = makeMap()
		delete map.groups
		const { emitted } = renderEditor({ modelValue: map })
		await fireEvent.click(screen.getByRole('button', { name: 'Добавить группу' }))
		expect(lastModel(emitted).groups).toEqual([{ id: 'group-1', title: 'Группа 1' }])
	})
})

describe('BaseImageMapEditor панель: маршруты', () => {
	it('смена id объекта переписывает узлы маршрутов', async () => {
		const map = makeMap()
		map.routes = { nodes: [{ id: 'n1', x: 0.1, y: 0.1, object: 'r1' }], edges: [] }
		const { emitted } = renderEditor({ modelValue: map, selected: 'r1' })
		await fireEvent.update(screen.getByLabelText('Id'), 'hall')
		expect(lastModel(emitted)?.routes?.nodes[0]?.object).toBe('hall')
		expect(modelObject(emitted, 'hall')).toBeDefined()
	})
})

function threeFloors(): ImageMapData {
	const map = makeMap()
	map.layers.push({ id: 'l3', title: 'Третий', image: 'https://example.com/3.png', width: 1000, height: 500 })
	map.groups?.push({ id: 'g2', title: 'Кафе' })
	return map
}

describe('BaseImageMapEditor панель: удаление этажа и группы', () => {
	it('удаление не текущего этажа текущий не меняет; фокус — на соседнюю строку', async () => {
		const { emitted } = renderEditor({ modelValue: threeFloors(), layer: 'l3', selected: 'e1' })
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить этаж «Второй»' }))
		expect(emitted()['update:layer']).toBeUndefined()
		await nextTick()
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Третий' }))
	})

	it('удаление текущего этажа показывает следующий, у последнего — предыдущий', async () => {
		const { emitted } = renderEditor({ modelValue: threeFloors(), layer: 'l2' })
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить этаж «Второй»' }))
		expect(emitted()['update:layer']).toEqual([['l3']])
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить этаж «Третий»' }))
		expect(emitted()['update:layer']).toEqual([['l3'], ['l1']])
		await nextTick()
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Первый' }))
	})

	it('после удаления последнего этажа фокус — на «Добавить этаж»', async () => {
		const map = makeMap()
		map.layers = map.layers.slice(0, 1)
		renderEditor({ modelValue: map })
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить этаж «Первый»' }))
		await nextTick()
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Добавить этаж' }))
	})

	it('удаление группы — фокус на соседнюю группу, после последней — на «Добавить группу»', async () => {
		renderEditor({ modelValue: threeFloors() })
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить группу «Магазины»' }))
		await nextTick()
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Удалить группу «Кафе»' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить группу «Кафе»' }))
		await nextTick()
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Добавить группу' }))
	})
})
