import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseJsonViewer from '../ui/BaseJsonViewer.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const VALUE = { id: 1052, customer: { name: 'Павел', tags: ['vip'] }, total: 2400.5, isGift: false, coupon: null }

const treeitem = (name: string) => screen.getByRole('treeitem', { name })

describe('BaseJsonViewer', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('дерево с именем, ключи и значения по типам, верхний уровень раскрыт', () => {
		const { container } = render(BaseJsonViewer, { props: { value: VALUE, label: 'Заказ' } })

		expect(screen.getByRole('tree', { name: 'Заказ' })).toBeInTheDocument()
		expect(treeitem('customer: 2 ключа')).toHaveAttribute('aria-expanded', 'true')
		expect(treeitem('tags: 1 элемент')).toHaveAttribute('aria-expanded', 'false')
		expect(container.querySelector('.base-json-viewer__value--number')).toHaveTextContent('1052')
		expect(container.querySelector('.base-json-viewer__value--null')).toHaveTextContent('null')
		expect(container.querySelector('.base-json-viewer__value--boolean')).toHaveTextContent('false')
	})

	it('«Развернуть всё» и «Свернуть всё»; смена expandDepth раскрывает заново', async () => {
		const { rerender } = render(BaseJsonViewer, { props: { value: VALUE, label: 'Заказ' } })

		await fireEvent.click(screen.getByRole('button', { name: 'Развернуть всё' }))
		expect(treeitem('tags: 1 элемент')).toHaveAttribute('aria-expanded', 'true')
		await fireEvent.click(screen.getByRole('button', { name: 'Свернуть всё' }))
		expect(treeitem('customer: 2 ключа')).toHaveAttribute('aria-expanded', 'false')
		await rerender({ expandDepth: 2 })
		expect(treeitem('tags: 1 элемент')).toHaveAttribute('aria-expanded', 'true')
	})

	it('«Копировать JSON»: текст с отступом, событие copy и статус; ошибка буфера — «Не удалось скопировать»', async () => {
		const writeText = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('denied'))
		vi.stubGlobal('navigator', { clipboard: { writeText } })
		const { emitted } = render(BaseJsonViewer, { props: { value: { a: 1 }, label: 'Данные' } })
		const copy = screen.getByRole('button', { name: 'Копировать JSON' })

		await fireEvent.click(copy)
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('JSON скопирован'))
		expect(writeText).toHaveBeenCalledWith('{\n  "a": 1\n}')
		expect(emitted('copy')).toEqual([['{\n  "a": 1\n}']])
		await fireEvent.click(copy)
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Не удалось скопировать'))
		expect(emitted('copy')).toHaveLength(1)
	})

	it('без Clipboard API и со значением вне JSON — «Не удалось скопировать»', async () => {
		vi.stubGlobal('navigator', {})
		render(BaseJsonViewer, { props: { value: undefined, label: 'Пусто' } })

		expect(treeitem('null')).toBeInTheDocument()
		await fireEvent.click(screen.getByRole('button', { name: 'Копировать JSON' }))
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Не удалось скопировать'))
	})

	it('без панели, свои кнопки в слоте actions, вариант, размер и customClass', async () => {
		const { container, rerender } = render(BaseJsonViewer, {
			props: { value: [1], label: 'Список', hasToolbar: false, variant: 'soft', customClass: { tree: 'tree-x' } },
			slots: { actions: '<button type="button">Скачать</button>' },
		})

		expect(screen.queryByRole('button', { name: 'Скачать' })).toBeNull()
		expect(container.querySelector('.base-json-viewer')).toHaveClass('base-json-viewer--soft')
		expect(container.querySelector('.base-json-viewer__tree')).toHaveClass('tree-x')
		await rerender({ hasToolbar: true })
		await nextTick()
		expect(screen.getByRole('button', { name: 'Скачать' })).toBeInTheDocument()
	})
})
