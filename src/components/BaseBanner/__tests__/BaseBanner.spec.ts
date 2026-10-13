import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import { createUiKitPlugin } from '@/plugin'
import BaseBanner from '../ui/BaseBanner.vue'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { UI_ARIA, UI_BANNER } from '@/locales/messages'
import { fireEvent, render, screen } from '@testing-library/vue'

const STORAGE_NAME = 'rise-banner:promo'
const icon = (container: Element) => container.querySelector('use')?.getAttribute('href')

describe('BaseBanner unit', () => {
	beforeEach(() => {
		localStorage.clear()
		setLocale('ru')
	})

	afterEach(() => {
		vi.restoreAllMocks()
		setLocale('ru')
	})

	describe('рендер', () => {
		it('корень — область с именем из словаря', () => {
			render(BaseBanner)

			expect(screen.getByRole('region', { name: UI_BANNER.LABEL })).toBeInTheDocument()
		})

		it('свой label переопределяет имя', () => {
			render(BaseBanner, { props: { label: 'Акция' } })

			expect(screen.getByRole('region', { name: 'Акция' })).toBeInTheDocument()
		})

		it('в английской локали имя из английского словаря', () => {
			setLocale('en')
			render(BaseBanner)

			expect(screen.getByRole('region', { name: 'Announcement' })).toBeInTheDocument()
		})

		it('text выводится текстом', () => {
			render(BaseBanner, { props: { text: 'Скидка 20%' } })

			expect(screen.getByText('Скидка 20%')).toBeInTheDocument()
		})

		it('слот default заменяет text', () => {
			render(BaseBanner, { props: { text: 'Скидка' }, slots: { default: 'Из слота' } })

			expect(screen.getByText('Из слота')).toBeInTheDocument()
			expect(screen.queryByText('Скидка')).not.toBeInTheDocument()
		})

		it('без text и слота текстового блока нет', () => {
			const { container } = render(BaseBanner)

			expect(container.querySelector('.base-banner__text')).not.toBeInTheDocument()
		})
	})

	describe('иконка', () => {
		const icons = { primary: 'bell', info: 'info', success: 'check-circle', warning: 'alert-triangle', error: 'x-circle' } as const

		Object.entries(icons).forEach(([type, name]) => {
			it(`тип ${type} — иконка ${name}`, () => {
				const { container } = render(BaseBanner, { props: { type: type as keyof typeof icons } })

				expect(icon(container)).toBe(`icons.svg#${name}`)
				expect(container.querySelector('.base-banner')).toHaveClass(`base-banner--${type}`)
			})
		})

		it('проп icon заменяет иконку типа', () => {
			const { container } = render(BaseBanner, { props: { icon: 'star' } })

			expect(icon(container)).toBe('icons.svg#star')
		})

		it('hasIcon=false убирает иконку', () => {
			const { container } = render(BaseBanner, { props: { hasIcon: false } })

			expect(container.querySelector('.base-banner__icon-wrapper')).not.toBeInTheDocument()
			expect(container.querySelector('use')).not.toBeInTheDocument()
		})

		it('слот icon заменяет иконку', () => {
			const { container } = render(BaseBanner, { slots: { icon: '<span data-testid="own-icon">*</span>' } })

			expect(screen.getByTestId('own-icon')).toBeInTheDocument()
			expect(container.querySelector('use')).not.toBeInTheDocument()
		})
	})

	describe('действие и модификаторы', () => {
		it('слот action рендерится в .base-banner__action', () => {
			const { container } = render(BaseBanner, { slots: { action: '<a href="#more">Подробнее</a>' } })

			expect(container.querySelector('.base-banner__action')).toContainElement(screen.getByRole('link', { name: 'Подробнее' }))
		})

		it('без слота action блока нет', () => {
			const { container } = render(BaseBanner)

			expect(container.querySelector('.base-banner__action')).not.toBeInTheDocument()
		})

		it('по умолчанию тип primary и положение static', () => {
			const { container } = render(BaseBanner)

			expect(container.querySelector('.base-banner')).toHaveClass('base-banner--primary', 'base-banner--static')
		})

		it('sticky и variant добавляют классы', () => {
			const { container } = render(BaseBanner, { props: { position: 'sticky', variant: 'soft' } })

			expect(container.querySelector('.base-banner')).toHaveClass('base-banner--sticky', 'base-banner--soft')
		})

		it('sizeScale 125 пишет --size-scale', () => {
			const { container } = render(BaseBanner, { props: { sizeScale: 125 } })

			expect((container.querySelector('.base-banner') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
		})

		it('customClass добавляет класс к корню', () => {
			const { container } = render(BaseBanner, { props: { customClass: { root: 'my-root' } } })

			expect(container.querySelector('.base-banner')).toHaveClass('my-root')
		})
	})

	describe('проп ui и плагин', () => {
		it('ui добавляет классы частям', () => {
			const { container } = render(BaseBanner, {
				props: { text: 'Текст', isClosable: true, ui: { root: 'own-root', text: 'own-text', close: 'own-close' } },
			})

			expect(container.querySelector('.base-banner')).toHaveClass('own-root')
			expect(container.querySelector('.base-banner__text')).toHaveClass('own-text')
			expect(container.querySelector('.base-banner__close')).toHaveClass('own-close')
		})

		it('defaults плагина задают тип и классы, склеиваясь с ui экземпляра', () => {
			const { container } = render(BaseBanner, {
				props: { ui: { root: 'own-root' } },
				global: { plugins: [createUiKitPlugin({ defaults: { BaseBanner: { type: 'warning', ui: { root: 'app-root' } } } })] },
			})

			expect(container.querySelector('.base-banner')).toHaveClass('base-banner--warning', 'app-root', 'own-root')
			expect(icon(container)).toBe('icons.svg#alert-triangle')
		})
	})

	describe('закрытие', () => {
		it('без isClosable кнопки нет', () => {
			render(BaseBanner)

			expect(screen.queryByRole('button', { name: UI_ARIA.CLOSE })).not.toBeInTheDocument()
		})

		it('клик по «Закрыть» шлёт update:isOpen false и close и скрывает баннер', async () => {
			const { emitted } = render(BaseBanner, { props: { isClosable: true } })

			await fireEvent.click(screen.getByRole('button', { name: UI_ARIA.CLOSE }))

			expect(emitted('update:isOpen')).toEqual([[false]])
			expect(emitted('close')).toHaveLength(1)
			expect(screen.queryByRole('region')).not.toBeInTheDocument()
		})

		it('isOpen=false изначально — баннера нет, смена на true показывает', async () => {
			const { rerender } = render(BaseBanner, { props: { isOpen: false } })

			expect(screen.queryByRole('region')).not.toBeInTheDocument()

			await rerender({ isOpen: true })
			expect(screen.getByRole('region')).toBeInTheDocument()

			await rerender({ isOpen: false })
			expect(screen.queryByRole('region')).not.toBeInTheDocument()
		})
	})

	describe('storageKey', () => {
		it('закрытие записывает rise-banner:<ключ> = closed', async () => {
			render(BaseBanner, { props: { isClosable: true, storageKey: 'promo' } })

			await fireEvent.click(screen.getByRole('button', { name: UI_ARIA.CLOSE }))

			expect(localStorage.getItem(STORAGE_NAME)).toBe('closed')
		})

		it('при монтировании с записью баннер скрыт, приходит update:isOpen false без close', async () => {
			localStorage.setItem(STORAGE_NAME, 'closed')
			const { emitted } = render(BaseBanner, { props: { storageKey: 'promo' } })
			await nextTick()

			expect(screen.queryByRole('region')).not.toBeInTheDocument()
			expect(emitted('update:isOpen')).toEqual([[false]])
			expect(emitted('close')).toBeUndefined()
		})

		it('без записи баннер показан', () => {
			const { emitted } = render(BaseBanner, { props: { storageKey: 'promo' } })

			expect(screen.getByRole('region')).toBeInTheDocument()
			expect(emitted('update:isOpen')).toBeUndefined()
		})

		it('недоступное хранилище: баннер показан, закрытие работает', async () => {
			vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
				throw new Error('denied')
			})
			vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
				throw new Error('denied')
			})
			const { emitted } = render(BaseBanner, { props: { isClosable: true, storageKey: 'promo' } })

			expect(screen.getByRole('region')).toBeInTheDocument()

			await fireEvent.click(screen.getByRole('button', { name: UI_ARIA.CLOSE }))

			expect(screen.queryByRole('region')).not.toBeInTheDocument()
			expect(emitted('close')).toHaveLength(1)
		})

		it('без storageKey localStorage не трогается', async () => {
			const getItem = vi.spyOn(Storage.prototype, 'getItem')
			const setItem = vi.spyOn(Storage.prototype, 'setItem')
			render(BaseBanner, { props: { isClosable: true } })

			await fireEvent.click(screen.getByRole('button', { name: UI_ARIA.CLOSE }))

			expect(getItem).not.toHaveBeenCalled()
			expect(setItem).not.toHaveBeenCalled()
		})
	})

	describe('SSR', () => {
		it('renderToString не падает и отдаёт область', async () => {
			const html = await renderToString(
				createSSRApp({ render: () => h(BaseBanner, { text: 'Скидка', isClosable: true, storageKey: 'promo' }) }),
			)

			expect(html).toContain('base-banner')
			expect(html).toContain('Скидка')
		})
	})
})
