import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { setLocale } from '@/locales/state'
import BaseEmojiPicker from '../ui/BaseEmojiPicker.vue'
import type { EmojiPickerItem } from '../types/BaseEmojiPicker.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const EMOJIS: EmojiPickerItem[] = [
	{ emoji: '😀', label: 'широко улыбается', category: 'smileys' },
	{ emoji: '😂', label: 'слёзы радости', category: 'smileys' },
	{ emoji: '👋', label: 'машет рукой', category: 'people' },
	{ emoji: '🐱', label: 'морда кошки', category: 'nature' },
]

const emojiButton = (name: string) => screen.getByRole('button', { name })

describe('BaseEmojiPicker', () => {
	afterEach(() => setLocale('ru'))

	it('разделы с заголовками, вкладки разделов и один эмодзи в порядке Tab', () => {
		const { container } = render(BaseEmojiPicker, { props: { emojis: EMOJIS } })

		expect(screen.getByRole('group', { name: 'Эмодзи' })).not.toHaveAttribute('aria-busy')
		expect(screen.getByRole('group', { name: 'Смайлы и эмоции' })).toContainElement(emojiButton('широко улыбается'))
		expect(screen.getByRole('group', { name: 'Разделы' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Смайлы и эмоции' })).toHaveAttribute('aria-current', 'true')
		expect(emojiButton('широко улыбается')).toHaveAttribute('tabindex', '0')
		expect(emojiButton('машет рукой')).toHaveAttribute('tabindex', '-1')
		expect(container.querySelector('.base-emoji-picker__preview-label')).toHaveTextContent('Эмодзи')
		expect(container.querySelector('.base-emoji-picker')).toHaveStyle({ '--emoji-columns': '8' })
	})

	it('выбор: событие select и недавние первыми, без повторов и не больше max-recent', async () => {
		const { emitted } = render(BaseEmojiPicker, { props: { emojis: EMOJIS, recent: ['🐱', '😂'], maxRecent: 2 } })

		expect(screen.getByRole('group', { name: 'Недавние' })).toBeInTheDocument()
		await fireEvent.click(screen.getAllByRole('button', { name: 'слёзы радости' })[0])
		await fireEvent.click(emojiButton('машет рукой'))
		expect(emitted('select')).toEqual([[EMOJIS[1]], [EMOJIS[2]]])
		expect(emitted('update:recent')).toEqual([[['😂', '🐱']], [['👋', '😂']]])
	})

	it('недавние не перестраиваются от своего же выбора, но меняются снаружи', async () => {
		const { rerender } = render(BaseEmojiPicker, { props: { emojis: EMOJIS } })

		await fireEvent.click(emojiButton('машет рукой'))
		expect(screen.queryByRole('group', { name: 'Недавние' })).toBeNull()
		await rerender({ recent: ['🐱', 'нет такого'] })
		expect(screen.getByRole('group', { name: 'Недавние' })).toHaveTextContent('🐱')
		await rerender({ recent: undefined })
		expect(screen.queryByRole('group', { name: 'Недавние' })).toBeNull()
	})

	it('поиск по названию (ё как е) и по самому эмодзи; пусто — «Ничего не нашлось»', async () => {
		render(BaseEmojiPicker, { props: { emojis: EMOJIS } })
		const search = screen.getByRole('searchbox', { name: 'Поиск эмодзи' })

		await fireEvent.update(search, 'СЛЕЗЫ')
		expect(screen.getByRole('group', { name: 'Поиск эмодзи' })).toHaveTextContent('😂')
		expect(screen.queryByRole('group', { name: 'Разделы' })).toBeNull()
		await fireEvent.update(search, '🐱')
		expect(emojiButton('морда кошки')).toHaveAttribute('tabindex', '0')
		await fireEvent.update(search, 'дракон')
		expect(screen.getByRole('status')).toHaveTextContent('Ничего не нашлось')
	})

	it('Enter в поиске выбирает первый результат, стрелка вниз переводит фокус в сетку', async () => {
		const { emitted } = render(BaseEmojiPicker, { props: { emojis: EMOJIS } })
		const search = screen.getByRole('searchbox')

		await fireEvent.update(search, 'рук')
		await fireEvent.keyDown(search, { key: 'ArrowDown' })
		await waitFor(() => expect(emojiButton('машет рукой')).toHaveFocus())
		await fireEvent.keyDown(search, { key: 'Enter' })
		expect(emitted('select')).toEqual([[EMOJIS[2]]])
		await fireEvent.keyDown(search, { key: 'a' })
		await fireEvent.update(search, 'дракон')
		await fireEvent.keyDown(search, { key: 'Enter' })
		expect(emitted('select')).toHaveLength(1)
	})

	it('стрелки двигают фокус по сетке, остальные клавиши — нет', async () => {
		render(BaseEmojiPicker, { props: { emojis: EMOJIS, columns: 2 } })
		const first = emojiButton('широко улыбается')

		first.focus()
		await fireEvent.keyDown(first, { key: 'ArrowRight' })
		await waitFor(() => expect(emojiButton('слёзы радости')).toHaveFocus())
		await fireEvent.keyDown(first, { key: 'ArrowDown' })
		await waitFor(() => expect(emojiButton('машет рукой')).toHaveFocus())
		expect(emojiButton('машет рукой')).toHaveAttribute('tabindex', '0')
		await fireEvent.keyDown(first, { key: 'x' })
		expect(emojiButton('машет рукой')).toHaveFocus()
	})

	it('предпросмотр — наведённый или в фокусе эмодзи', async () => {
		const { container } = render(BaseEmojiPicker, { props: { emojis: EMOJIS } })

		await fireEvent.mouseEnter(emojiButton('морда кошки'))
		expect(container.querySelector('.base-emoji-picker__preview')).toHaveTextContent('🐱морда кошки')
		await fireEvent.focus(emojiButton('машет рукой'))
		expect(container.querySelector('.base-emoji-picker__preview')).toHaveTextContent('👋машет рукой')
	})

	it('вкладка раздела прокручивает к нему, прокрутка меняет текущую вкладку', async () => {
		const { container } = render(BaseEmojiPicker, { props: { emojis: EMOJIS } })
		const grid = container.querySelector('.base-emoji-picker__grid') as HTMLElement
		const nature = container.querySelector('[data-section="nature"]') as HTMLElement
		const people = container.querySelector('[data-section="people"]') as HTMLElement
		Object.defineProperty(people, 'offsetTop', { configurable: true, value: 60 })
		Object.defineProperty(nature, 'offsetTop', { configurable: true, value: 120 })

		await fireEvent.click(screen.getByRole('button', { name: 'Животные и природа' }))
		expect(grid.scrollTop).toBe(120)
		expect(screen.getByRole('button', { name: 'Животные и природа' })).toHaveAttribute('aria-current', 'true')
		grid.scrollTop = 0
		await fireEvent.scroll(grid)
		expect(screen.getByRole('button', { name: 'Смайлы и эмоции' })).toHaveAttribute('aria-current', 'true')
	})

	it('недавние и поиск по самому эмодзи не зависят от селектора варианта U+FE0F', async () => {
		const items: EmojiPickerItem[] = [{ emoji: '👍\uFE0F', label: 'нравится', category: 'people' }]
		const { emitted } = render(BaseEmojiPicker, { props: { emojis: items, recent: ['👍'] } })

		expect(screen.getByRole('group', { name: 'Недавние' })).toHaveTextContent('👍')
		await fireEvent.update(screen.getByRole('searchbox'), '👍')
		await fireEvent.click(emojiButton('нравится'))
		expect(emitted('update:recent')).toEqual([[['👍\uFE0F']]])
	})

	it('без поиска и предпросмотра; is-disabled отключает всё', () => {
		const { container } = render(BaseEmojiPicker, {
			props: { emojis: EMOJIS, hasSearch: false, hasPreview: false, isDisabled: true },
		})

		expect(screen.queryByRole('searchbox')).toBeNull()
		expect(container.querySelector('.base-emoji-picker__preview')).toBeNull()
		expect(emojiButton('морда кошки')).toBeDisabled()
		expect(container.querySelector('.base-emoji-picker__grid')).toHaveAttribute('tabindex', '0')
		expect(container.querySelector('.base-emoji-picker')).toHaveClass('base-emoji-picker--disabled')
	})

	it('встроенный набор загружается на языке кита', async () => {
		const { container, rerender } = render(BaseEmojiPicker)
		const root = container.querySelector('.base-emoji-picker') as HTMLElement
		const button = (label: string) => container.querySelector(`button[aria-label="${label}"]`)

		expect(root).toHaveAttribute('aria-busy', 'true')
		expect(container.querySelector('[role="status"]')).toBeEmptyDOMElement()
		await waitFor(() => expect(button('широко улыбается')).toHaveTextContent('😀'))
		expect(root).not.toHaveAttribute('aria-busy')
		setLocale('en')
		await nextTick()
		setLocale('ru')
		await new Promise(resolve => setTimeout(resolve, 50))
		expect(button('широко улыбается')).toBeInTheDocument()
		setLocale('en')
		await waitFor(() => expect(button('grinning face')).toBeInTheDocument())
		await rerender({ emojis: EMOJIS.slice(3) })
		expect(container.querySelectorAll('.base-emoji-picker__emoji')).toHaveLength(1)
	})

	it('вариант, масштаб и customClass', () => {
		const { container } = render(BaseEmojiPicker, {
			props: {
				emojis: EMOJIS,
				variant: 'soft',
				sizeScale: 125,
				columns: 6,
				customClass: { root: 'r', search: 's', nav: 'n', grid: 'g', preview: 'p' },
			},
		})
		const root = container.querySelector('.base-emoji-picker') as HTMLElement

		expect(root).toHaveClass('base-emoji-picker--soft', 'r')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(root.style.getPropertyValue('--emoji-columns')).toBe('6')
		for (const [part, name] of [
			['search', 's'],
			['nav', 'n'],
			['grid', 'g'],
			['preview', 'p'],
		])
			expect(container.querySelector(`.base-emoji-picker__${part}`)).toHaveClass(name)
	})
})
