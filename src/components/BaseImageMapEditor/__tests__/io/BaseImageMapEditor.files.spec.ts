import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseImageMapEditor from '../../ui/BaseImageMapEditor.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import type { BaseImageMapEditorExpose } from '../../types/BaseImageMapEditor.types'
import { lastModel, makeMap, makeSvgMap, renderEditor, statusOf, SVG_MARKUP } from '../utils/editorTestUtils'

class LoadedImage {
	naturalWidth = 640
	naturalHeight = 480
	onload: (() => void) | null = null
	onerror: (() => void) | null = null
	set src(_value: string) {
		queueMicrotask(() => this.onload?.())
	}
}

class BrokenImage extends LoadedImage {
	override set src(_value: string) {
		queueMicrotask(() => this.onerror?.())
	}
}

function backgroundInput(container: Element): HTMLInputElement {
	return container.querySelector('input[accept="image/*,.svg"]') as HTMLInputElement
}

function jsonInput(container: Element): HTMLInputElement {
	return container.querySelector('input[accept=".json,application/json"]') as HTMLInputElement
}

async function chooseFile(input: HTMLInputElement, file?: File): Promise<void> {
	Object.defineProperty(input, 'files', { configurable: true, value: file ? [file] : [] })
	await fireEvent.change(input)
}

function pngFile(name = 'plan.png'): File {
	return new File([new Uint8Array([137, 80, 78, 71])], name, { type: 'image/png' })
}

afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe('BaseImageMapEditor файлы: картинка и SVG', () => {
	it('кнопки открывают скрытый выбор файла', async () => {
		const { container } = renderEditor()
		const input = backgroundInput(container)
		expect(input).toHaveAttribute('type', 'file')
		expect(input).toHaveAttribute('tabindex', '-1')
		expect(input).toHaveAttribute('aria-hidden', 'true')
		const click = vi.spyOn(input, 'click').mockImplementation(() => undefined)
		await fireEvent.click(screen.getByRole('button', { name: 'Заменить картинку' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Добавить этаж' }))
		expect(click).toHaveBeenCalledTimes(2)
		const jsonClick = vi.spyOn(jsonInput(container), 'click').mockImplementation(() => undefined)
		await fireEvent.click(screen.getByRole('button', { name: 'Импорт JSON' }))
		expect(jsonClick).toHaveBeenCalledOnce()
	})

	it('«Заменить картинку»: data URL и натуральный размер в текущем слое', async () => {
		vi.stubGlobal('Image', LoadedImage)
		const { container, emitted } = renderEditor()
		vi.spyOn(backgroundInput(container), 'click').mockImplementation(() => undefined)
		await fireEvent.click(screen.getByRole('button', { name: 'Заменить картинку' }))
		await chooseFile(backgroundInput(container), pngFile())
		await waitFor(() => expect(lastModel(emitted)?.layers[0]).toMatchObject({ width: 640, height: 480 }))
		expect(lastModel(emitted).layers[0]?.image).toMatch(/^data:image\/png;base64,/)
		expect(lastModel(emitted).layers).toHaveLength(2)
		expect(backgroundInput(container).value).toBe('')
		await nextTick()
		expect(statusOf(container)).toHaveTextContent('Картинка «plan.png» открыта')
	})

	it('«Добавить этаж»: новый слой с названием файла становится текущим', async () => {
		vi.stubGlobal('Image', LoadedImage)
		const { container, emitted } = renderEditor()
		vi.spyOn(backgroundInput(container), 'click').mockImplementation(() => undefined)
		await fireEvent.click(screen.getByRole('button', { name: 'Добавить этаж' }))
		await chooseFile(backgroundInput(container), new File([SVG_MARKUP], 'Третий.svg', { type: '' }))
		await waitFor(() => expect(lastModel(emitted)?.layers).toHaveLength(3))
		expect(lastModel(emitted).layers[2]).toEqual({ id: 'layer-1', title: 'Третий', svg: SVG_MARKUP, width: 800, height: 400 })
		expect(emitted()['update:layer']).toEqual([['layer-1']])
	})

	it('пустой редактор: первая картинка — первый этаж', async () => {
		vi.stubGlobal('Image', LoadedImage)
		const { container, emitted } = render(BaseImageMapEditor)
		vi.spyOn(backgroundInput(container), 'click').mockImplementation(() => undefined)
		await fireEvent.click(screen.getAllByRole('button', { name: 'Открыть картинку или SVG' })[0] as HTMLElement)
		await chooseFile(backgroundInput(container), pngFile('Цоколь.png'))
		await waitFor(() => expect(screen.getByRole('application')).toBeInTheDocument())
		expect(lastModel(emitted).layers[0]).toMatchObject({ id: 'layer-1', title: 'Цоколь', width: 640 })
	})

	it('замена картинки на SVG убирает адрес картинки', async () => {
		const { container, emitted } = renderEditor()
		await fireEvent.click(screen.getByRole('button', { name: 'Заменить картинку' }))
		await chooseFile(backgroundInput(container), new File([SVG_MARKUP], 'plan.svg', { type: 'image/svg+xml' }))
		await waitFor(() => expect(lastModel(emitted)?.layers[0]).toMatchObject({ svg: SVG_MARKUP, width: 800 }))
		expect(lastModel(emitted).layers[0]).not.toHaveProperty('image')
	})

	it('в слой уходит очищенный SVG: без скриптов и обработчиков', async () => {
		const { container, emitted } = renderEditor()
		const dirty = SVG_MARKUP.replace('<circle', '<script>alert(1)</script><circle onclick="x()"')
		await fireEvent.click(screen.getByRole('button', { name: 'Заменить картинку' }))
		await chooseFile(backgroundInput(container), new File([dirty], 'plan.svg', { type: 'image/svg+xml' }))
		await waitFor(() => expect(lastModel(emitted)?.layers[0]).toMatchObject({ svg: SVG_MARKUP }))
	})

	it('пустой SVG и битая картинка — «Не удалось открыть картинку» и import-error', async () => {
		vi.stubGlobal('Image', BrokenImage)
		const { container, emitted } = renderEditor()
		await chooseFile(backgroundInput(container), new File(['<p>нет</p>'], 'bad.svg', { type: 'image/svg+xml' }))
		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Не удалось открыть картинку'))
		expect(emitted()['import-error']).toEqual([['Не удалось открыть картинку']])
		await chooseFile(backgroundInput(container), pngFile())
		await waitFor(() => expect(emitted()['import-error']).toHaveLength(2))
		expect(emitted()['update:modelValue']).toBeUndefined()
	})

	it('выбор без файла ничего не делает', async () => {
		const { container, emitted } = renderEditor()
		await chooseFile(backgroundInput(container))
		await chooseFile(jsonInput(container))
		await nextTick()
		expect(emitted()['update:modelValue']).toBeUndefined()
		expect(emitted()['import-error']).toBeUndefined()
	})
})

describe('BaseImageMapEditor файлы: JSON', () => {
	it('«Импорт JSON» заменяет карту одним шагом истории и снимает выделение', async () => {
		const { container, emitted } = renderEditor({ selected: 'r1' })
		await chooseFile(jsonInput(container), new File([JSON.stringify(makeSvgMap())], 'map.json', { type: 'application/json' }))
		await waitFor(() => expect(lastModel(emitted)).toEqual(makeSvgMap()))
		expect(emitted()['update:selected']).toEqual([[null]])
		await nextTick()
		await waitFor(() => expect(statusOf(container)).toHaveTextContent('Карта загружена из JSON'))
		await fireEvent.click(screen.getByRole('button', { name: 'Отменить (Ctrl+Z)' }))
		expect(lastModel(emitted)).toEqual(makeMap())
	})

	it('не JSON карты — сообщение, import-error, карта не меняется; удачное действие убирает сообщение', async () => {
		const { container, emitted } = renderEditor({ selected: 'r1' })
		await chooseFile(jsonInput(container), new File(['{"layers": []}'], 'map.json'))
		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/Это не JSON карты/))
		expect(emitted()['import-error']).toHaveLength(1)
		expect(emitted()['update:modelValue']).toBeUndefined()
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить (Delete)' }))
		expect(screen.queryByRole('alert')).toBeNull()
	})

	it('объект без геометрии по типу — «Это не JSON карты», редактор остаётся', async () => {
		const { container, emitted } = renderEditor()
		const text = '{"layers":[{"id":"l","width":10,"height":10}],"objects":[{"id":"a","type":"polygon"}]}'
		await chooseFile(jsonInput(container), new File([text], 'map.json'))
		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/Это не JSON карты/))
		expect(emitted()['update:modelValue']).toBeUndefined()
		expect(screen.getByRole('button', { name: /^Зал\s*Прямоугольник$/ })).toBeInTheDocument()
	})

	it('импорт и экспорт JSON чистят SVG слоёв', () => {
		const map = makeSvgMap()
		map.layers[0]!.svg = SVG_MARKUP.replace('<circle', '<circle onclick="x()"')
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: map } })
		const api = wrapper.vm as unknown as BaseImageMapEditorExpose
		expect(JSON.parse(api.exportJson()).layers[0].svg).toBe(SVG_MARKUP)
		expect(api.importJson(JSON.stringify(map))).toBe(true)
		expect((wrapper.emitted('update:modelValue')?.at(-1)?.[0] as typeof map).layers[0]?.svg).toBe(SVG_MARKUP)
	})

	it('«Экспорт JSON» скачивает файл fileName', async () => {
		const createObjectURL = vi.fn(() => 'blob:map')
		const revokeObjectURL = vi.fn()
		vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
		renderEditor({ fileName: 'mall.json' })
		await fireEvent.click(screen.getByRole('button', { name: 'Экспорт JSON' }))
		const link = click.mock.instances[0] as unknown as HTMLAnchorElement
		expect(link.download).toBe('mall.json')
		expect(link.getAttribute('href')).toBe('blob:map')
		expect(createObjectURL).toHaveBeenCalledOnce()
		expect(revokeObjectURL).not.toHaveBeenCalled()
		await new Promise(resolve => setTimeout(resolve))
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:map')
	})
})

describe('BaseImageMapEditor файлы: объекты из SVG', () => {
	it('создаёт объекты svg для элементов с id без объекта и объявляет число', async () => {
		const map = makeSvgMap()
		map.objects.push({ type: 'point', id: 'shop', title: 'Точка магазина', x: 0.5, y: 0.5 })
		const { container, emitted } = renderEditor({ modelValue: map })
		await nextTick()
		await fireEvent.click(screen.getByRole('button', { name: 'Объекты из SVG' }))
		await nextTick()
		expect(lastModel(emitted).objects.slice(2)).toEqual([
			{ type: 'svg', id: 'hall', elementId: 'hall', title: 'Холл', layer: 'f1' },
			{ type: 'svg', id: 'svg-shop', elementId: 'shop', title: 'shop', layer: 'f1' },
		])
		expect(statusOf(container)).toHaveTextContent('Добавлено объектов из SVG: 2')
		expect(container.querySelectorAll('.base-image-map-editor__svg-object')).toHaveLength(3)
	})

	it('уже связанные элементы ищутся только на своём слое; id без повторов', async () => {
		const map = makeSvgMap()
		map.layers.push({ id: 'f2', title: 'Второй', svg: SVG_MARKUP, width: 800, height: 400 })
		map.objects.push(
			{ type: 'svg', id: 'hall', elementId: 'hall', title: 'Холл', layer: 'f2' },
			{ type: 'point', id: 'svg-hall', title: 'Занято', x: 0.5, y: 0.5, layer: 'f2' },
		)
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: map } })
		await nextTick()
		const api = wrapper.vm as unknown as BaseImageMapEditorExpose
		expect(api.importSvgObjects()).toBe(2)
		const created = (wrapper.emitted('update:modelValue')?.at(-1)?.[0] as typeof map).objects.slice(3)
		expect(created.map(object => object.id)).toEqual(['svg-hall-1', 'shop'])
	})

	it('importSvgObjects возвращает число новых объектов', async () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: makeSvgMap() } })
		const api = wrapper.vm as unknown as BaseImageMapEditorExpose
		expect(api.importSvgObjects()).toBe(0)
		await nextTick()
		expect(api.importSvgObjects()).toBe(2)
		expect(api.importSvgObjects()).toBe(0)
	})

	it('elementId с кавычкой не ломает холст', async () => {
		const map = makeSvgMap()
		map.objects.push({ type: 'svg', id: 'q', title: 'Кавычка', elementId: 'a"b' })
		const { container } = renderEditor({ modelValue: map })
		await nextTick()
		expect(container.querySelectorAll('.base-image-map-editor__svg-object')).toHaveLength(1)
		expect(screen.getByRole('application', { name: 'Холст карты' })).toBeInTheDocument()
	})

	it('у слоя-картинки кнопки «Объекты из SVG» нет', () => {
		renderEditor()
		expect(screen.queryByRole('button', { name: 'Объекты из SVG' })).toBeNull()
	})
})
