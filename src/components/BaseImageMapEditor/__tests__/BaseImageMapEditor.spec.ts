import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createUiKitPlugin } from '@/plugin'
import BaseImageMapEditor from '../ui/BaseImageMapEditor.vue'
import { fireEvent, render, screen, within } from '@testing-library/vue'
import type { BaseImageMapEditorExpose } from '../types/BaseImageMapEditor.types'
import { confirmDelete, lastModel, makeMap, makeSvgMap, objectInList, pressKey, renderEditor } from './utils/editorTestUtils'

vi.setConfig({ testTimeout: 60_000 })

function zoomButton(name: string): HTMLElement {
	const toolbar = document.querySelector('.base-image-map-editor__toolbar') as HTMLElement
	return within(within(toolbar).getByRole('group', { name: 'Масштаб' })).getByRole('button', { name })
}

function deleteButton(): HTMLElement {
	return screen.getByRole('button', { name: 'Удалить (Delete)' })
}

describe('BaseImageMapEditor unit', () => {
	it('называет корень label, по умолчанию — «Редактор карты»', async () => {
		const { container, rerender } = renderEditor()
		const root = container.querySelector('.base-image-map-editor')
		expect(root).toHaveAttribute('aria-label', 'Редактор карты')
		await rerender({ label: 'План ТЦ' })
		expect(root).toHaveAttribute('aria-label', 'План ТЦ')
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = renderEditor({ variant: 'outline' })
		expect(container.querySelector('.base-image-map-editor')).toHaveClass('base-image-map-editor--outline')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = renderEditor({ sizeScale: 125 })
		expect((container.querySelector('.base-image-map-editor') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('раздаёт customClass по частям редактора', () => {
		const customClass = { root: 'c-root', toolbar: 'c-toolbar', canvas: 'c-canvas', panel: 'c-panel', error: 'c-error' }
		const { container } = renderEditor({ customClass, error: 'Ошибка' })
		expect(container.querySelector('.base-image-map-editor')).toHaveClass('c-root')
		expect(container.querySelector('.base-image-map-editor__toolbar')).toHaveClass('c-toolbar')
		expect(container.querySelector('.base-image-map-editor__viewport')).toHaveClass('c-canvas')
		expect(container.querySelector('.base-image-map-editor__panel')).toHaveClass('c-panel')
		expect(screen.getByText('Ошибка')).toHaveClass('c-error')
	})

	it('показывает ошибку под холстом и ставит модификатор --error', () => {
		const { container } = renderEditor({ error: 'Карта не сохранена' })
		expect(screen.getByText('Карта не сохранена')).toBeInTheDocument()
		expect(container.querySelector('.base-image-map-editor')).toHaveClass('base-image-map-editor--error')
	})

	it('задаёт высоту холста пропом height', () => {
		const { container } = renderEditor({ height: '320px' })
		expect((container.querySelector('.base-image-map-editor__viewport') as HTMLElement).style.height).toBe('320px')
	})

	it('без modelValue начинает с пустой карты: кнопка открыть картинку, инструменты недоступны', () => {
		const { container } = render(BaseImageMapEditor)
		expect(screen.getByText('Откройте картинку или SVG — это будет первый этаж карты')).toBeInTheDocument()
		expect(screen.getAllByRole('button', { name: 'Открыть картинку или SVG' })).toHaveLength(2)
		for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Просмотр' })).toBeDisabled()
		expect(container.querySelector('[role="application"]')).toBeNull()
		expect(screen.queryByText('Объекты слоя')).toBeNull()
	})

	it('кнопка в пустом редакторе открывает выбор картинки', async () => {
		const { container } = render(BaseImageMapEditor)
		const input = container.querySelector('input[accept="image/*,.svg"]') as HTMLInputElement
		const click = vi.spyOn(input, 'click').mockImplementation(() => undefined)
		const empty = container.querySelector('.base-image-map-editor__empty') as HTMLElement
		await fireEvent.click(within(empty).getByRole('button', { name: 'Открыть картинку или SVG' }))
		expect(click).toHaveBeenCalledOnce()
	})

	it('холст — application с именем и подсказкой по инструменту', async () => {
		const { rerender } = renderEditor()
		const canvas = screen.getByRole('application', { name: 'Холст карты' })
		expect(canvas).toHaveAttribute('tabindex', '0')
		expect(canvas).toHaveAccessibleDescription(/Щёлкните объект, чтобы выделить его/)
		await rerender({ tool: 'point' })
		expect(canvas).toHaveAccessibleDescription(/Щёлкните, чтобы поставить точку/)
		await rerender({ tool: 'rect' })
		expect(canvas).toHaveAccessibleDescription(/Протяните от угла до угла/)
		await rerender({ tool: 'ellipse' })
		expect(canvas).toHaveAccessibleDescription(/Протяните от угла до угла/)
		await rerender({ tool: 'polygon' })
		expect(canvas).toHaveAccessibleDescription(/Щёлкайте вершины/)
		await rerender({ isDisabled: true })
		expect(canvas).toHaveAccessibleDescription('Только просмотр: правка отключена.')
	})

	it('инструменты — радиогруппа: выбор эмитит update:tool, тот же инструмент — нет', async () => {
		const { emitted } = renderEditor()
		expect(screen.getByRole('radiogroup', { name: 'Инструменты' })).toBeInTheDocument()
		expect(screen.getByRole('radio', { name: 'Выбор' })).toBeChecked()
		await fireEvent.click(screen.getByRole('radio', { name: 'Прямоугольник' }))
		expect(emitted()['update:tool']).toEqual([['rect']])
		expect(screen.getByRole('radio', { name: 'Прямоугольник' })).toBeChecked()
		await fireEvent.click(screen.getByRole('radio', { name: 'Прямоугольник' }))
		expect(emitted()['update:tool']).toHaveLength(1)
	})

	it('проп tool переключает инструмент снаружи', async () => {
		const { rerender, container } = renderEditor()
		await rerender({ tool: 'ellipse' })
		expect(screen.getByRole('radio', { name: 'Эллипс' })).toBeChecked()
		expect(container.querySelector('.base-image-map-editor__stage')).toHaveClass('base-image-map-editor__stage--ellipse')
	})

	it('слот toolbar — в конце панели инструментов', () => {
		const { container } = renderEditor({}, { slots: { toolbar: '<button type="button">Сохранить</button>' } })
		const toolbar = container.querySelector('.base-image-map-editor__toolbar') as HTMLElement
		expect(toolbar.lastElementChild).toHaveTextContent('Сохранить')
	})

	it('live-регион пуст при монтировании', () => {
		renderEditor()
		expect(screen.getByRole('status')).toBeEmptyDOMElement()
	})

	it('isDisabled: инструменты, правка и файлы недоступны, экспорт — доступен', () => {
		const { container } = renderEditor({ isDisabled: true, selected: 'r1' })
		expect(container.querySelector('.base-image-map-editor')).toHaveClass('base-image-map-editor--disabled')
		for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled()
		expect(deleteButton()).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Дублировать (Ctrl+D)' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Заменить картинку' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Импорт JSON' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Экспорт JSON' })).toBeEnabled()
		expect(screen.getByRole('button', { name: 'Добавить этаж' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Добавить группу' })).toBeDisabled()
		expect(screen.getByLabelText('Название')).toBeDisabled()
	})
})

describe('BaseImageMapEditor v-model', () => {
	it('эмитит новый объект, а не изменяет modelValue', async () => {
		const value = makeMap()
		const { emitted } = renderEditor({ modelValue: value, selected: 'r1' })
		await fireEvent.click(deleteButton())
		await confirmDelete()
		const next = lastModel(emitted)
		expect(next).not.toBe(value)
		expect(next.objects.map(object => object.id)).toEqual(['p1', 'pg', 'e1'])
		expect(value.objects).toHaveLength(4)
	})

	it('тот же JSON снаружи (копия эмита) не сбрасывает историю', async () => {
		const { emitted, rerender } = renderEditor({ selected: 'r1' })
		await fireEvent.click(deleteButton())
		await confirmDelete()
		await rerender({ modelValue: JSON.parse(JSON.stringify(lastModel(emitted))) })
		expect(screen.getByRole('button', { name: 'Отменить (Ctrl+Z)' })).toBeEnabled()
	})

	it('тот же объект, что эмитнут, не сбрасывает историю', async () => {
		const { emitted, rerender } = renderEditor({ selected: 'r1' })
		await fireEvent.click(deleteButton())
		await confirmDelete()
		await rerender({ modelValue: lastModel(emitted) })
		expect(screen.getByRole('button', { name: 'Отменить (Ctrl+Z)' })).toBeEnabled()
	})

	it('другой JSON снаружи заменяет карту и очищает историю', async () => {
		const { rerender } = renderEditor({ selected: 'r1' })
		await fireEvent.click(deleteButton())
		await confirmDelete()
		await rerender({ modelValue: makeSvgMap() })
		expect(screen.getByRole('button', { name: 'Отменить (Ctrl+Z)' })).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByRole('button', { name: /Склад/ })).toBeInTheDocument()
		await rerender({ modelValue: undefined })
		expect(screen.getByText('Откройте картинку или SVG — это будет первый этаж карты')).toBeInTheDocument()
	})

	it('пропы layer и selected синхронизируются снаружи', async () => {
		const { rerender } = renderEditor()
		await rerender({ layer: 'l2' })
		expect(screen.getByRole('button', { name: 'Второй' })).toHaveAttribute('aria-current', 'true')
		await rerender({ selected: 'e1' })
		expect(screen.getByRole('button', { name: /Фонтан/ })).toHaveAttribute('aria-current', 'true')
	})
})

describe('BaseImageMapEditor история', () => {
	it('кнопки «Отменить» и «Повторить» следуют за историей и объявляют шаг', async () => {
		const { emitted, container } = renderEditor({ selected: 'r1' })
		const undo = screen.getByRole('button', { name: 'Отменить (Ctrl+Z)' })
		const redo = screen.getByRole('button', { name: 'Повторить (Ctrl+Shift+Z)' })
		expect(screen.getByRole('group', { name: 'История' })).toBeInTheDocument()
		expect(undo).toHaveAttribute('aria-disabled', 'true')
		expect(redo).toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(deleteButton())
		await confirmDelete()
		expect(objectInList(container, /Зал/)).toBeNull()
		await fireEvent.click(undo)
		await nextTick()
		expect(objectInList(container, /Зал/)).toBeInTheDocument()
		expect(screen.getByRole('status')).toHaveTextContent('Правка отменена')
		expect(redo).toBeEnabled()
		await fireEvent.click(redo)
		await nextTick()
		expect(objectInList(container, /Зал/)).toBeNull()
		expect(screen.getByRole('status')).toHaveTextContent('Правка повторена')
		expect(lastModel(emitted).objects).toHaveLength(3)
	})

	it('Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y и ⌘+Z на корне', async () => {
		const { container } = renderEditor({ selected: 'r1' })
		const root = container.querySelector('.base-image-map-editor') as HTMLElement
		await fireEvent.click(deleteButton())
		await confirmDelete()
		pressKey(root, { key: 'z', ctrlKey: true })
		await nextTick()
		expect(objectInList(container, /Зал/)).toBeInTheDocument()
		pressKey(root, { key: 'Z', ctrlKey: true, shiftKey: true })
		await nextTick()
		expect(objectInList(container, /Зал/)).toBeNull()
		pressKey(root, { key: 'z', metaKey: true })
		await nextTick()
		expect(objectInList(container, /Зал/)).toBeInTheDocument()
		pressKey(root, { key: 'y', ctrlKey: true })
		await nextTick()
		expect(objectInList(container, /Зал/)).toBeNull()
	})

	it('Ctrl+D дублирует выделенное; прочие сочетания и клавиши без Ctrl не перехватываются', async () => {
		const { container, emitted } = renderEditor({ selected: 'r1' })
		const root = container.querySelector('.base-image-map-editor') as HTMLElement
		expect(pressKey(root, { key: 'd', ctrlKey: true })).toBe(false)
		await nextTick()
		expect(lastModel(emitted).objects.find(object => object.id === 'rect-1')).toMatchObject({ x: 0.12, y: 0.12 })
		expect(emitted()['update:selected']?.at(-1)).toEqual(['rect-1'])
		expect(pressKey(root, { key: 'b', ctrlKey: true })).toBe(true)
		expect(pressKey(root, { key: 'z' })).toBe(true)
	})

	it('в полях ввода Ctrl+Z остаётся полю', async () => {
		const { emitted } = renderEditor({ selected: 'r1' })
		await fireEvent.click(deleteButton())
		await confirmDelete()
		const input = screen.getByLabelText('Название этажа')
		expect(pressKey(input, { key: 'z', ctrlKey: true })).toBe(true)
		expect(lastModel(emitted).objects).toHaveLength(3)
	})

	it('isDisabled: сочетания клавиш не работают', async () => {
		const { container, rerender, emitted } = renderEditor({ selected: 'r1' })
		await fireEvent.click(deleteButton())
		await confirmDelete()
		await rerender({ isDisabled: true })
		expect(pressKey(container.querySelector('.base-image-map-editor') as HTMLElement, { key: 'z', ctrlKey: true })).toBe(true)
		expect(lastModel(emitted).objects).toHaveLength(3)
	})
})

describe('BaseImageMapEditor просмотр и масштаб', () => {
	it('«Просмотр» показывает BaseImageMap вместо холста и отключает инструменты', async () => {
		const { container } = renderEditor()
		const preview = screen.getByRole('button', { name: 'Просмотр' })
		expect(preview).toHaveAttribute('aria-pressed', 'false')
		await fireEvent.click(preview)
		expect(preview).toHaveAttribute('aria-pressed', 'true')
		expect(container.querySelector('.base-image-map')).not.toBeNull()
		expect(screen.queryByRole('application')).toBeNull()
		for (const radio of within(screen.getByRole('radiogroup', { name: 'Инструменты' })).getAllByRole('radio'))
			expect(radio).toBeDisabled()
		expect(zoomButton('Увеличить')).toHaveAttribute('aria-disabled', 'true')
		expect(zoomButton('Уменьшить')).toHaveAttribute('aria-disabled', 'true')
		expect(container.querySelector('.base-image-map-editor__help')).toBeNull()
		await fireEvent.click(preview)
		expect(screen.getByRole('application')).toBeInTheDocument()
	})

	it('смена этажа в просмотре меняет слой редактора', async () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: makeMap() } })
		await wrapper.find('[aria-pressed]').trigger('click')
		wrapper.findComponent({ name: 'BaseImageMap' }).vm.$emit('update:layer', 'l2')
		await nextTick()
		expect(wrapper.emitted('update:layer')).toEqual([['l2']])
	})

	it('без hasPreview кнопки «Просмотр» нет', () => {
		renderEditor({ hasPreview: false })
		expect(screen.queryByRole('button', { name: 'Просмотр' })).toBeNull()
	})

	it('масштаб холста — от 100 до 400 %, шаг ×1,25', async () => {
		const { container } = renderEditor()
		const stage = container.querySelector('.base-image-map-editor__stage') as HTMLElement
		expect(stage.style.width).toBe('100%')
		expect(stage.style.aspectRatio).toBe('1000 / 500')
		expect(zoomButton('Уменьшить')).toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(zoomButton('Увеличить'))
		expect(stage.style.width).toBe('125%')
		for (let index = 0; index < 8; index++) await fireEvent.click(zoomButton('Увеличить'))
		expect(stage.style.width).toBe('400%')
		expect(zoomButton('Увеличить')).toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(zoomButton('Уменьшить'))
		expect(stage.style.width).toBe('320%')
		for (let index = 0; index < 8; index++) await fireEvent.click(zoomButton('Уменьшить'))
		expect(stage.style.width).toBe('100%')
	})
})

describe('BaseImageMapEditor expose и настройки плагина', () => {
	it('undo/redo возвращают false, когда шага нет, и true — когда есть', async () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: makeMap(), selected: 'r1' } })
		const api = wrapper.vm as unknown as BaseImageMapEditorExpose
		expect(api.undo()).toBe(false)
		expect(api.redo()).toBe(false)
		api.deleteSelected()
		expect(api.undo()).toBe(true)
		expect(api.redo()).toBe(true)
		await wrapper.setProps({ isDisabled: true })
		expect(api.undo()).toBe(false)
	})

	it('exportJson — JSON карты с отступом 2, importJson — замена карты', () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: makeMap() } })
		const api = wrapper.vm as unknown as BaseImageMapEditorExpose
		expect(api.exportJson()).toBe(JSON.stringify(makeMap(), null, 2))
		expect(api.importJson(JSON.stringify(makeSvgMap()))).toBe(true)
		expect(JSON.parse(api.exportJson())).toEqual(makeSvgMap())
		expect(api.importJson('{')).toBe(false)
		expect(wrapper.emitted('import-error')?.[0]?.[0]).toMatch(/Это не JSON карты/)
	})

	it('importSvgObjects на пустой карте возвращает 0', () => {
		const wrapper = mount(BaseImageMapEditor)
		expect((wrapper.vm as unknown as BaseImageMapEditorExpose).importSvgObjects()).toBe(0)
	})

	it('значения по умолчанию берутся из defaults плагина', () => {
		render(BaseImageMapEditor, {
			props: { modelValue: makeMap() },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseImageMapEditor: { hasPreview: false, tool: 'point' } } })] },
		})
		expect(screen.queryByRole('button', { name: 'Просмотр' })).toBeNull()
		expect(screen.getByRole('radio', { name: 'Точка' })).toBeChecked()
	})
})
