import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseDescriptions from '../ui/BaseDescriptions.vue'
import type { DescriptionsItem } from '../types/BaseDescriptions.types'
import { render, screen, waitFor, fireEvent } from '@testing-library/vue'

const ITEMS: DescriptionsItem[] = [
	{ key: 'name', label: 'Компания', value: 'ООО «Ромашка»' },
	{ key: 'inn', label: 'ИНН', value: 7707083893 },
	{ key: 'phone', label: 'Телефон', value: null },
	{ key: 'address', label: 'Адрес', value: 'Москва, ул. Тверская, 1', span: 'full' },
]

function terms(): string[] {
	return Array.from(document.querySelectorAll('dt')).map(node => node.textContent?.trim() ?? '')
}

function definitions(): string[] {
	return Array.from(document.querySelectorAll('dd')).map(node => node.textContent?.trim() ?? '')
}

describe('BaseDescriptions unit', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		vi.useRealTimers()
	})

	it('поля — пары dt и dd внутри dl, число — строкой, пустое значение — «—»', () => {
		const { container } = render(BaseDescriptions, { props: { items: ITEMS } })
		const list = container.querySelector('dl') as HTMLElement
		expect(list).toBeInTheDocument()
		expect(list.querySelectorAll(':scope > div > dt + dd')).toHaveLength(4)
		expect(terms()).toEqual(['Компания', 'ИНН', 'Телефон', 'Адрес'])
		expect(definitions()).toEqual(['ООО «Ромашка»', '7707083893', '—', 'Москва, ул. Тверская, 1'])
	})

	it('пустые значения: null, undefined и пустая строка — emptyValue; 0 — значение', () => {
		render(BaseDescriptions, {
			props: {
				emptyValue: 'не указано',
				items: [
					{ key: 'a', label: 'A', value: '' },
					{ key: 'b', label: 'B' },
					{ key: 'c', label: 'C', value: 0 },
				],
			},
		})
		expect(definitions()).toEqual(['не указано', 'не указано', '0'])
	})

	it('без полей — «Нет данных» вместо dl; emptyText и слот empty его заменяют', async () => {
		const { container, rerender } = render(BaseDescriptions)
		expect(container.querySelector('dl')).not.toBeInTheDocument()
		expect(screen.getByText('Нет данных')).toBeInTheDocument()
		await rerender({ emptyText: 'Заполните профиль' })
		expect(screen.getByText('Заполните профиль')).toBeInTheDocument()
		render(BaseDescriptions, { slots: { empty: 'Из слота' } })
		expect(screen.getByText('Из слота')).toBeInTheDocument()
	})

	it('заголовок title и слоты title, extra; без них шапки нет', () => {
		const { container } = render(BaseDescriptions, { props: { items: ITEMS } })
		expect(container.querySelector('.base-descriptions__header')).not.toBeInTheDocument()
		render(BaseDescriptions, { props: { items: ITEMS, title: 'Реквизиты' } })
		expect(screen.getByText('Реквизиты')).toHaveClass('base-descriptions__title')
		render(BaseDescriptions, {
			props: { items: ITEMS },
			slots: { title: () => h('h2', 'Из слота'), extra: () => h('button', 'Изменить') },
		})
		expect(screen.getByRole('heading', { level: 2, name: 'Из слота' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Изменить' })).toBeInTheDocument()
	})

	it('только слот extra — шапка без заголовка', () => {
		const { container } = render(BaseDescriptions, { props: { items: ITEMS }, slots: { extra: 'Действия' } })
		expect(container.querySelector('.base-descriptions__header')).toBeInTheDocument()
		expect(container.querySelector('.base-descriptions__title')).not.toBeInTheDocument()
	})

	it('слоты label и value — для всех полей, label-<key> и value-<key> важнее', () => {
		render(BaseDescriptions, {
			props: { items: ITEMS.slice(0, 2) },
			slots: {
				label: ({ item, index }: { item: DescriptionsItem; index: number }) => `${index + 1}. ${item.label}`,
				value: ({ item }: { item: DescriptionsItem }) => `[${item.value}]`,
				'label-inn': () => 'ИНН организации',
				'value-inn': ({ item }: { item: DescriptionsItem }) => h('a', { href: `#${item.value}` }, 'ссылка'),
			},
		})
		expect(terms()).toEqual(['1. Компания', 'ИНН организации'])
		expect(definitions()).toEqual(['[ООО «Ромашка»]', 'ссылка'])
	})

	it('раскладка — модификатор horizontal (по умолчанию) или vertical', async () => {
		const { container, rerender } = render(BaseDescriptions, { props: { items: ITEMS } })
		const root = container.querySelector('.base-descriptions') as HTMLElement
		expect(root).toHaveClass('base-descriptions--horizontal')
		await rerender({ layout: 'vertical' })
		expect(root).toHaveClass('base-descriptions--vertical')
	})

	it('колонки, ширина колонки и подписи — CSS-переменные списка', async () => {
		const { container, rerender } = render(BaseDescriptions, { props: { items: ITEMS } })
		const list = container.querySelector('dl') as HTMLElement
		expect(list.style.getPropertyValue('--base-descriptions-columns')).toBe('3')
		expect(list.style.getPropertyValue('--base-descriptions-min-item-width')).toBe('240px')
		expect(list.style.getPropertyValue('--base-descriptions-label-width')).toBe('')
		await rerender({ columns: 0, minItemWidth: 180, labelWidth: '12em' })
		expect(list.style.getPropertyValue('--base-descriptions-columns')).toBe('1')
		expect(list.style.getPropertyValue('--base-descriptions-min-item-width')).toBe('180px')
		expect(list.style.getPropertyValue('--base-descriptions-label-width')).toBe('12em')
	})

	it('span: full — вся строка, число — не больше колонок, что помещаются; 1 и без span — без стиля', () => {
		const { container } = render(BaseDescriptions, {
			props: {
				items: [
					{ key: 'a', label: 'A', value: '1', span: 'full' },
					{ key: 'b', label: 'B', value: '2', span: 2 },
					{ key: 'c', label: 'C', value: '3', span: 1 },
					{ key: 'd', label: 'D', value: '4' },
				],
			},
		})
		const items = Array.from(container.querySelectorAll<HTMLElement>('.base-descriptions__item'))
		expect(items.map(item => item.style.gridColumn)).toEqual(['1 / -1', 'span 1', '', ''])
		expect(items.map(item => item.style.getPropertyValue('--base-descriptions-span'))).toEqual(['1', '1', '', ''])
	})

	it('кнопка «Копировать: <подпись>» — у полей со значением при isCopyable; поле переопределяет', () => {
		render(BaseDescriptions, {
			props: {
				isCopyable: true,
				items: [...ITEMS, { key: 'secret', label: 'Пароль', value: '***', isCopyable: false }],
			},
		})
		const names = screen.getAllByRole('button').map(button => button.getAttribute('aria-label'))
		expect(names).toEqual(['Копировать: Компания', 'Копировать: ИНН', 'Копировать: Адрес'])
	})

	it('без isCopyable кнопок нет, кроме полей с isCopyable: true', () => {
		render(BaseDescriptions, { props: { items: [...ITEMS, { key: 'id', label: 'ID', value: 'a1', isCopyable: true }] } })
		expect(screen.getAllByRole('button')).toHaveLength(1)
		expect(screen.getByRole('button', { name: 'Копировать: ID' })).toBeInTheDocument()
	})

	it('копирование: copyText или значение, событие copy, статус, значок «готово» на 2 с', async () => {
		vi.useFakeTimers()
		const writeText = vi.fn().mockResolvedValue(undefined)
		vi.stubGlobal('navigator', { clipboard: { writeText } })
		const items: DescriptionsItem[] = [
			{ key: 'account', label: 'Счёт', value: '4081 7810 0999', copyText: '408178100999' },
			{ key: 'inn', label: 'ИНН', value: 7707083893 },
		]
		const { emitted, container } = render(BaseDescriptions, { props: { items, isCopyable: true } })
		const status = screen.getByRole('status')
		const icons = () => Array.from(container.querySelectorAll('.base-descriptions__copy')).map(button => button.innerHTML)
		const idle = icons()[1]
		expect(status).toHaveTextContent('')

		await fireEvent.click(screen.getByRole('button', { name: 'Копировать: Счёт' }))
		await vi.waitFor(() => expect(status).toHaveTextContent('Скопировано: Счёт'))
		expect(writeText).toHaveBeenCalledWith('408178100999')
		expect(emitted('copy')).toEqual([[{ item: items[0], text: '408178100999' }]])
		expect(icons()[0]).not.toBe(idle)

		await fireEvent.click(screen.getByRole('button', { name: 'Копировать: ИНН' }))
		await vi.waitFor(() => expect(status).toHaveTextContent('Скопировано: ИНН'))
		expect(writeText).toHaveBeenLastCalledWith('7707083893')
		expect(icons()[0]).toBe(idle)
		expect(icons()[1]).not.toBe(idle)
		vi.advanceTimersByTime(2000)
		await nextTick()
		expect(icons()).toEqual([idle, idle])
	})

	it('ошибка буфера или его нет — «Не удалось скопировать», события нет', async () => {
		vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
		const { emitted, unmount } = render(BaseDescriptions, { props: { items: ITEMS.slice(0, 1), isCopyable: true } })
		await fireEvent.click(screen.getByRole('button', { name: 'Копировать: Компания' }))
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Не удалось скопировать: Компания'))
		expect(emitted('copy')).toBeUndefined()
		unmount()

		vi.stubGlobal('navigator', {})
		render(BaseDescriptions, { props: { items: ITEMS.slice(0, 1), isCopyable: true } })
		await fireEvent.click(screen.getByRole('button', { name: 'Копировать: Компания' }))
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Не удалось скопировать: Компания'))
	})

	it('без navigator — «Не удалось скопировать»', async () => {
		vi.stubGlobal('navigator', undefined)
		render(BaseDescriptions, { props: { items: ITEMS.slice(0, 1), isCopyable: true } })
		await fireEvent.click(screen.getByRole('button', { name: 'Копировать: Компания' }))
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Не удалось скопировать: Компания'))
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseDescriptions, { props: { variant: 'soft' } })
		expect(container.querySelector('.base-descriptions')).toHaveClass('base-descriptions--soft')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseDescriptions, { props: { sizeScale: 125 } })
		expect((container.querySelector('.base-descriptions') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('customClass — корень, шапка и список', () => {
		const { container } = render(BaseDescriptions, {
			props: { items: ITEMS, title: 'Т', customClass: { root: 'my-root', header: 'my-header', list: 'my-list' } },
		})
		expect(container.querySelector('.base-descriptions')).toHaveClass('my-root')
		expect(container.querySelector('.base-descriptions__header')).toHaveClass('my-header')
		expect(container.querySelector('dl')).toHaveClass('my-list')
	})

	it('умолчания из настроек плагина: defaults.BaseDescriptions', () => {
		const { container } = render(BaseDescriptions, {
			props: { items: ITEMS },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseDescriptions: { layout: 'vertical', isCopyable: true } } })] },
		})
		expect(container.querySelector('.base-descriptions')).toHaveClass('base-descriptions--vertical')
		expect(screen.getAllByRole('button')).toHaveLength(3)
	})
})
