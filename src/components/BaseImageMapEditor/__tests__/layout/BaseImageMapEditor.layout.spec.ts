import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { makeMap, makeSvgMap, renderEditor } from '../utils/editorTestUtils'

vi.setConfig({ testTimeout: 60_000 })

const SECTIONS = ['Объекты слоя', 'Свойства объекта', 'Этажи', 'Фильтры', 'Стили', 'Группы']

let resizeCallback: (() => void) | undefined

function mockWidth(width: number): void {
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width)
}

async function renderAt(width: number, props: Parameters<typeof renderEditor>[0] = {}, options: Parameters<typeof renderEditor>[1] = {}) {
	mockWidth(width)
	const result = renderEditor(props, options)
	await nextTick()
	return result
}

beforeEach(() => {
	resizeCallback = undefined
	vi.stubGlobal(
		'ResizeObserver',
		class {
			constructor(callback: () => void) {
				resizeCallback = callback
			}
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	)
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('BaseImageMapEditor: широкая раскладка', () => {
	it('заголовки разделов — обычный текст, раскрывателей нет, все разделы открыты', async () => {
		const { container } = await renderAt(1000, { selected: 'r1' })

		for (const title of SECTIONS) expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
		expect(container.querySelector('.base-image-map-editor__toggle')).toBeNull()
		expect(container.querySelector('.base-image-map-editor__panel h3 [aria-expanded]')).toBeNull()
		expect(screen.getByRole('button', { name: /^Зал\s*Прямоугольник$/ })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Добавить фильтр' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Добавить группу' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Заменить картинку' })).toHaveTextContent('Заменить картинку')
		expect(screen.getByRole('radio', { name: 'Прямоугольник' }).closest('label')).toHaveTextContent('Прямоугольник')
	})
})

describe('BaseImageMapEditor: узкая раскладка, разделы панели', () => {
	it('заголовок раздела — кнопка с aria-expanded; открыт только первый раздел, остальные свёрнуты без содержимого', async () => {
		await renderAt(500)

		expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(SECTIONS.length)
		for (const title of SECTIONS) {
			const button = screen.getByRole('button', { name: title })
			expect(button).toHaveAttribute('aria-expanded', title === 'Объекты слоя' ? 'true' : 'false')
			expect(button.closest('h3')).not.toBeNull()
		}
		expect(screen.getByRole('button', { name: /^Зал\s*Прямоугольник$/ })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Добавить фильтр' })).toBeNull()
		expect(screen.queryByRole('button', { name: 'Добавить группу' })).toBeNull()
		expect(screen.queryByLabelText('Название')).toBeNull()
	})

	it('aria-controls указывает на существующую область только у раскрытого раздела', async () => {
		const { container } = await renderAt(500)
		const objects = screen.getByRole('button', { name: 'Объекты слоя' })
		const filters = screen.getByRole('button', { name: 'Фильтры' })

		const bodyId = objects.getAttribute('aria-controls')!
		expect(container.querySelector(`#${CSS.escape(bodyId)}`)).not.toBeNull()
		expect(filters).not.toHaveAttribute('aria-controls')

		await fireEvent.click(filters)
		expect(filters).toHaveAttribute('aria-expanded', 'true')
		expect(container.querySelector(`#${CSS.escape(filters.getAttribute('aria-controls')!)}`)).not.toBeNull()
	})

	it('клик, Enter и пробел раскрывают и сворачивают раздел', async () => {
		const user = userEvent.setup()
		await renderAt(500)
		const groups = screen.getByRole('button', { name: 'Группы' })

		await user.click(groups)
		expect(groups).toHaveAttribute('aria-expanded', 'true')
		expect(await screen.findByRole('button', { name: 'Добавить группу' })).toBeInTheDocument()

		groups.focus()
		await user.keyboard('{Enter}')
		expect(groups).toHaveAttribute('aria-expanded', 'false')
		await waitFor(() => expect(screen.queryByRole('button', { name: 'Добавить группу' })).toBeNull())
		expect(groups).toHaveFocus()

		await user.keyboard(' ')
		expect(groups).toHaveAttribute('aria-expanded', 'true')
		expect(await screen.findByRole('button', { name: 'Добавить группу' })).toBeInTheDocument()
	})

	it('Tab с раскрывателя идёт к первому элементу его раздела, а затем к следующему раскрывателю', async () => {
		const user = userEvent.setup()
		await renderAt(500, { modelValue: { ...makeMap(), objects: [] } })
		screen.getByRole('button', { name: 'Объекты слоя' }).focus()

		await user.tab()
		expect(screen.getByRole('button', { name: 'Свойства объекта' })).toHaveFocus()
		await user.tab()
		expect(screen.getByRole('button', { name: 'Этажи' })).toHaveFocus()
	})

	it('выделенный объект раскрывает «Свойства объекта»; свернуть их можно вручную', async () => {
		await renderAt(500, { selected: 'r1' })
		const properties = screen.getByRole('button', { name: 'Свойства объекта' })

		expect(properties).toHaveAttribute('aria-expanded', 'true')
		expect(screen.getByLabelText('Название')).toBeInTheDocument()
		await fireEvent.click(properties)
		expect(properties).toHaveAttribute('aria-expanded', 'false')
		await waitFor(() => expect(screen.queryByLabelText('Название')).toBeNull())
	})

	it('без этажа первым раскрыт раздел «Этажи»', async () => {
		await renderAt(500, { modelValue: { version: 1, layers: [], objects: [] } })

		expect(screen.getByRole('button', { name: 'Этажи' })).toHaveAttribute('aria-expanded', 'true')
		expect(screen.getByRole('button', { name: 'Фильтры' })).toHaveAttribute('aria-expanded', 'false')
	})

	it('раздел 3D при has3dFields сворачивается так же', async () => {
		await renderAt(500, { modelValue: makeSvgMap(), has3dFields: true })
		const scene = screen.getByRole('button', { name: '3D' })

		expect(scene).toHaveAttribute('aria-expanded', 'false')
		await fireEvent.click(scene)
		expect(scene).toHaveAttribute('aria-expanded', 'true')
		expect(await screen.findByRole('group', { name: 'Сцена' })).toBeInTheDocument()
	})

	it('изменение ширины переключает раскладку: на широкой раскрыватели исчезают, разделы открыты', async () => {
		const { container } = await renderAt(500)
		expect(container.querySelector('.base-image-map-editor__toggle')).not.toBeNull()

		vi.restoreAllMocks()
		mockWidth(1000)
		resizeCallback?.()
		await waitFor(() => expect(container.querySelector('.base-image-map-editor__toggle')).toBeNull())
		expect(screen.getByRole('button', { name: 'Добавить фильтр' })).toBeInTheDocument()
	})

	it('классы ui.toggle и модификатор раскрытого раздела', async () => {
		const { container } = await renderAt(500, { ui: { toggle: 'u-toggle' } })
		const toggles = container.querySelectorAll('.base-image-map-editor__toggle')

		expect(toggles).toHaveLength(SECTIONS.length)
		for (const element of toggles) expect(element).toHaveClass('u-toggle')
		expect(container.querySelectorAll('.base-image-map-editor__toggle--open')).toHaveLength(1)
	})

	it('работает с настройками плагина', async () => {
		await renderAt(500, { modelValue: makeMap() }, { global: { plugins: [createUiKitPlugin()] } })
		expect(screen.getByRole('button', { name: 'Этажи' })).toBeInTheDocument()
	})
})

describe('BaseImageMapEditor: узкая раскладка, панель инструментов', () => {
	it('инструменты — только иконки с доступным именем; подпись скрыта визуально, подсказка по наведению', async () => {
		const user = userEvent.setup()
		const { container } = await renderAt(500)
		const rect = screen.getByRole('radio', { name: 'Прямоугольник' })

		expect(container.querySelectorAll('.base-image-map-editor__tools .base-segmented__icon')).toHaveLength(5)
		expect(rect.closest('label')!.querySelector('.base-segmented__text')).toHaveClass('base-segmented__text--hidden')
		await user.hover(rect.closest('label')!)
		expect(await screen.findByRole('tooltip')).toHaveTextContent('Прямоугольник')
		await user.click(rect)
		expect(rect).toBeChecked()
	})

	it('кнопки файлов — иконки с именем и подсказкой, без видимой подписи; SVG-кнопка получает иконку', async () => {
		const user = userEvent.setup()
		const { container } = await renderAt(500, { modelValue: makeSvgMap() })
		const files = screen.getByRole('group', { name: 'Файлы' })

		for (const name of ['Заменить картинку', 'Объекты из SVG', 'Импорт JSON', 'Экспорт JSON']) {
			const button = screen.getByRole('button', { name })
			expect(files).toContainElement(button)
			expect(button.querySelector('svg, use')).not.toBeNull()
			expect(button.querySelector('.base-button__label')).toBeNull()
		}
		await user.hover(screen.getByRole('button', { name: 'Импорт JSON' }))
		expect(await screen.findByRole('tooltip')).toHaveTextContent('Импорт JSON')
		expect(container.querySelector('.base-image-map-editor__file[accept=".json,application/json"]')).not.toBeNull()
	})

	it('отключённый редактор: импорт недоступен, экспорт работает, как на широкой', async () => {
		await renderAt(500, { isDisabled: true })

		expect(screen.getByRole('button', { name: 'Импорт JSON' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Экспорт JSON' })).toBeEnabled()
	})
})
