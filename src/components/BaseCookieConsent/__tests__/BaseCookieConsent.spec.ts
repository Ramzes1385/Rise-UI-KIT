import '@testing-library/jest-dom/vitest'
import { createSSRApp, h } from 'vue'
import { setLocale } from '@/locales/state'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'vue/server-renderer'
import { UI_COOKIE_CONSENT } from '@/locales/messages'
import BaseCookieConsent from '../ui/BaseCookieConsent.vue'
import { render, screen, waitFor } from '@testing-library/vue'

const CATEGORIES = [
	{ id: 'necessary', label: 'Необходимые', description: 'Нужны для работы сайта', isRequired: true },
	{ id: 'analytics', label: 'Аналитика', description: 'Считаем посещения' },
	{ id: 'ads', label: 'Реклама' },
]

const STORAGE_KEY = 'rise-cookie-consent:site'

function root(container: Element): HTMLElement {
	return container.querySelector('.base-cookie-consent') as HTMLElement
}

function lastValue(calls: unknown[][] | undefined): unknown {
	return (calls as unknown[][]).at(-1)![0]
}

describe('BaseCookieConsent unit', () => {
	beforeEach(() => {
		localStorage.clear()
	})

	afterEach(() => {
		setLocale('ru')
		vi.restoreAllMocks()
	})

	describe('окно', () => {
		it('область (region) с именем из заголовка и описанием из текста, не диалог', () => {
			render(BaseCookieConsent)
			const dialog = screen.getByRole('region', { name: UI_COOKIE_CONSENT.TITLE })
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
			expect(dialog).not.toHaveAttribute('aria-modal')
			expect(dialog).toHaveAccessibleDescription(UI_COOKIE_CONSENT.DESCRIPTION)
			expect(screen.getByRole('heading', { level: 2, name: UI_COOKIE_CONSENT.TITLE })).toBeInTheDocument()
		})

		it('title и description заменяют тексты по умолчанию', () => {
			render(BaseCookieConsent, { props: { title: 'Куки', description: 'Свой текст' } })
			const dialog = screen.getByRole('region', { name: 'Куки' })
			expect(dialog).toHaveAccessibleDescription('Свой текст')
			expect(screen.queryByText(UI_COOKIE_CONSENT.DESCRIPTION)).not.toBeInTheDocument()
		})

		it('слот default заменяет описание', () => {
			render(BaseCookieConsent, { props: { description: 'Свой текст' }, slots: { default: '<a href="/privacy">Политика</a>' } })
			expect(screen.getByRole('link', { name: 'Политика' })).toBeInTheDocument()
			expect(screen.queryByText('Свой текст')).not.toBeInTheDocument()
		})

		it('фокус при монтировании не забирается', () => {
			render(BaseCookieConsent, { props: { categories: CATEGORIES } })
			expect(document.activeElement).toBe(document.body)
		})

		it('isOpen=false скрывает окно, смена на true показывает', async () => {
			const { rerender } = render(BaseCookieConsent, { props: { isOpen: false } })
			expect(screen.queryByRole('region')).not.toBeInTheDocument()
			await rerender({ isOpen: true })
			expect(screen.getByRole('region')).toBeInTheDocument()
			await rerender({ isOpen: false })
			expect(screen.queryByRole('region')).not.toBeInTheDocument()
		})
	})

	describe('оформление', () => {
		it('положение по умолчанию — bottom', () => {
			const { container } = render(BaseCookieConsent)
			expect(root(container)).toHaveClass('base-cookie-consent--bottom')
			expect(root(container)).not.toHaveClass('base-cookie-consent--contained')
		})

		it('position, isContained и variant дают классы', () => {
			const { container } = render(BaseCookieConsent, { props: { position: 'bottom-right', isContained: true, variant: 'soft' } })
			expect(root(container)).toHaveClass(
				'base-cookie-consent--bottom-right',
				'base-cookie-consent--contained',
				'base-cookie-consent--soft',
			)
		})

		it('sizeScale 125 пишет --size-scale', () => {
			const { container } = render(BaseCookieConsent, { props: { sizeScale: 125 } })
			expect(root(container).style.getPropertyValue('--size-scale')).toBe('1.25')
		})

		it('customClass строкой и объектом', () => {
			const first = render(BaseCookieConsent, { props: { customClass: 'my-root' } })
			expect(root(first.container)).toHaveClass('my-root')
			first.unmount()
			const second = render(BaseCookieConsent, { props: { customClass: { root: 'obj-root', actions: 'obj-actions' } } })
			expect(root(second.container)).toHaveClass('obj-root')
			expect(second.container.querySelector('.base-cookie-consent__actions')).toHaveClass('obj-actions')
		})

		it('ui экземпляра и ui плагина склеиваются', () => {
			const { container } = render(BaseCookieConsent, {
				props: { ui: { root: 'own-root', 'accept-all': 'own-all' } },
				global: {
					plugins: [createUiKitPlugin({ defaults: { BaseCookieConsent: { ui: { root: 'app-root', title: 'app-title' } } } })],
				},
			})
			expect(root(container)).toHaveClass('base-cookie-consent', 'app-root', 'own-root')
			expect(container.querySelector('.base-cookie-consent__title')).toHaveClass('app-title')
			expect(container.querySelector('.base-cookie-consent__accept-all')).toHaveClass('own-all')
		})

		it('умолчания плагина: defaults.BaseCookieConsent.position', () => {
			const { container } = render(BaseCookieConsent, {
				global: { plugins: [createUiKitPlugin({ defaults: { BaseCookieConsent: { position: 'bottom-left' } } })] },
			})
			expect(root(container)).toHaveClass('base-cookie-consent--bottom-left')
		})
	})

	describe('настройки', () => {
		it('кнопка «Настроить» свёрнута и без aria-controls', () => {
			render(BaseCookieConsent, { props: { categories: CATEGORIES } })
			const button = screen.getByRole('button', { name: UI_COOKIE_CONSENT.CUSTOMIZE })
			expect(button).toHaveAttribute('aria-expanded', 'false')
			expect(button).not.toHaveAttribute('aria-controls')
			expect(screen.queryByRole('group', { name: UI_COOKIE_CONSENT.CATEGORIES })).not.toBeInTheDocument()
		})

		it('клик раскрывает группу категорий и эмитит update:isSettingsOpen', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseCookieConsent, { props: { categories: CATEGORIES } })
			await user.click(screen.getByRole('button', { name: UI_COOKIE_CONSENT.CUSTOMIZE }))
			const group = screen.getByRole('group', { name: UI_COOKIE_CONSENT.CATEGORIES })
			const button = screen.getByRole('button', { name: UI_COOKIE_CONSENT.CUSTOMIZE_CLOSE })
			expect(button).toHaveAttribute('aria-expanded', 'true')
			expect(button).toHaveAttribute('aria-controls', group.id)
			expect(emitted('update:isSettingsOpen')).toEqual([[true]])
			await user.click(button)
			expect(screen.queryByRole('group')).not.toBeInTheDocument()
			expect(emitted('update:isSettingsOpen')).toEqual([[true], [false]])
		})

		it('isSettingsOpen управляется извне', async () => {
			const { rerender } = render(BaseCookieConsent, { props: { categories: CATEGORIES, isSettingsOpen: true } })
			expect(screen.getByRole('group', { name: UI_COOKIE_CONSENT.CATEGORIES })).toBeInTheDocument()
			await rerender({ isSettingsOpen: false })
			expect(screen.queryByRole('group')).not.toBeInTheDocument()
			await rerender({ isSettingsOpen: true })
			expect(screen.getByRole('group')).toBeInTheDocument()
		})

		it('пустой categories — группы нет даже при раскрытии', () => {
			render(BaseCookieConsent, { props: { isSettingsOpen: true } })
			expect(screen.queryByRole('group')).not.toBeInTheDocument()
			expect(screen.getByRole('button', { name: UI_COOKIE_CONSENT.CUSTOMIZE_CLOSE })).toHaveAttribute('aria-expanded', 'true')
		})
	})

	describe('категории и выбор', () => {
		it('описание категории связано с переключателем через aria-describedby', () => {
			render(BaseCookieConsent, { props: { categories: CATEGORIES, isSettingsOpen: true } })
			expect(screen.getByRole('switch', { name: 'Аналитика' })).toHaveAccessibleDescription('Считаем посещения')
		})

		it('обязательная включена и недоступна, с пометкой; остальные выключены', () => {
			render(BaseCookieConsent, { props: { categories: CATEGORIES, isSettingsOpen: true } })
			const required = screen.getByRole('switch', { name: 'Необходимые' })
			expect(required).toBeChecked()
			expect(required).toBeDisabled()
			expect(screen.getAllByText(UI_COOKIE_CONSENT.REQUIRED)).toHaveLength(1)
			expect(screen.getByText('Нужны для работы сайта')).toBeInTheDocument()
			expect(screen.getByText('Считаем посещения')).toBeInTheDocument()
			expect(screen.getByRole('switch', { name: 'Аналитика' })).not.toBeChecked()
			expect(screen.getByRole('switch', { name: 'Реклама' })).not.toBeChecked()
		})

		it('modelValue задаёт начальный выбор: неизвестные отброшены, обязательные добавлены', () => {
			render(BaseCookieConsent, { props: { categories: CATEGORIES, isSettingsOpen: true, modelValue: ['ads', 'ghost'] } })
			expect(screen.getByRole('switch', { name: 'Необходимые' })).toBeChecked()
			expect(screen.getByRole('switch', { name: 'Аналитика' })).not.toBeChecked()
			expect(screen.getByRole('switch', { name: 'Реклама' })).toBeChecked()
		})

		it('переключение эмитит update:modelValue и change с упорядоченным массивом', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseCookieConsent, { props: { categories: CATEGORIES, isSettingsOpen: true } })
			await user.click(screen.getByRole('switch', { name: 'Реклама' }))
			await user.click(screen.getByRole('switch', { name: 'Аналитика' }))
			expect(emitted('update:modelValue')).toEqual([[['necessary', 'ads']], [['necessary', 'analytics', 'ads']]])
			expect(emitted('change')).toEqual([[['necessary', 'ads']], [['necessary', 'analytics', 'ads']]])
			await user.click(screen.getByRole('switch', { name: 'Реклама' }))
			expect(lastValue(emitted('change'))).toEqual(['necessary', 'analytics'])
		})

		it('пропы categories и modelValue обновляют выбор', async () => {
			const { rerender } = render(BaseCookieConsent, { props: { categories: CATEGORIES, isSettingsOpen: true } })
			await rerender({ modelValue: ['analytics'] })
			expect(screen.getByRole('switch', { name: 'Аналитика' })).toBeChecked()
			await rerender({ modelValue: undefined, categories: [CATEGORIES[0], CATEGORIES[1]] })
			expect(screen.getByRole('switch', { name: 'Аналитика' })).toBeChecked()
			expect(screen.queryByRole('switch', { name: 'Реклама' })).not.toBeInTheDocument()
		})

		it('повторная установка того же выбора не эмитит событий', async () => {
			const { emitted, rerender } = render(BaseCookieConsent, { props: { categories: CATEGORIES, modelValue: ['analytics'] } })
			await rerender({ modelValue: ['analytics'] })
			expect(emitted('change')).toBeUndefined()
			await userEvent.setup().click(screen.getByRole('button', { name: UI_COOKIE_CONSENT.ACCEPT_ALL }))
			expect(emitted('change')).toHaveLength(1)
		})
	})

	describe('решение', () => {
		it('«Принять все»: change, accept со всеми id, окно скрыто, update:isOpen false', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseCookieConsent, { props: { categories: CATEGORIES } })
			await user.click(screen.getByRole('button', { name: UI_COOKIE_CONSENT.ACCEPT_ALL }))
			const all = ['necessary', 'analytics', 'ads']
			expect(emitted('change')).toEqual([[all]])
			expect(emitted('update:modelValue')).toEqual([[all]])
			expect(emitted('accept')).toEqual([[all]])
			expect(emitted('update:isOpen')).toEqual([[false]])
			expect(screen.queryByRole('region')).not.toBeInTheDocument()
		})

		it('«Принять все» при полном выборе: change не эмитится', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseCookieConsent, {
				props: { categories: CATEGORIES, modelValue: ['necessary', 'analytics', 'ads'] },
			})
			await user.click(screen.getByRole('button', { name: UI_COOKIE_CONSENT.ACCEPT_ALL }))
			expect(emitted('change')).toBeUndefined()
			expect(emitted('accept')).toHaveLength(1)
		})

		it('«Отклонить все»: accept только с обязательными категориями, окно скрыто', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseCookieConsent, {
				props: { categories: CATEGORIES, modelValue: ['necessary', 'analytics', 'ads'], storageKey: 'site' },
			})
			await screen.findByRole('region')
			await user.click(screen.getByRole('button', { name: UI_COOKIE_CONSENT.REJECT_ALL }))
			expect(emitted('accept')).toEqual([[['necessary']]])
			expect(emitted('change')).toEqual([[['necessary']]])
			expect(emitted('update:isOpen')).toEqual([[false]])
			expect(JSON.parse(localStorage.getItem(STORAGE_KEY) as string)).toEqual(['necessary'])
			expect(screen.queryByRole('region')).not.toBeInTheDocument()
		})

		it('«Отклонить все» и «Принять все» одного вида', () => {
			render(BaseCookieConsent, { props: { categories: CATEGORIES } })
			const reject = screen.getByRole('button', { name: UI_COOKIE_CONSENT.REJECT_ALL })
			const accept = screen.getByRole('button', { name: UI_COOKIE_CONSENT.ACCEPT_ALL })
			expect(reject.className.replace('reject-all', '')).toBe(accept.className.replace('accept-all', ''))
		})

		it('после решения фокус с кнопки переходит на следующий элемент страницы', async () => {
			const user = userEvent.setup()
			render({
				render: () => h('div', [h(BaseCookieConsent, { categories: CATEGORIES }), h('a', { href: '#next' }, 'Дальше')]),
			})
			await user.click(screen.getByRole('button', { name: UI_COOKIE_CONSENT.ACCEPT_ALL }))
			expect(screen.getByRole('link', { name: 'Дальше' })).toHaveFocus()
		})

		it('после решения без следующего элемента фокус уходит в body', async () => {
			const user = userEvent.setup()
			render(BaseCookieConsent, { props: { categories: CATEGORIES } })
			await user.click(screen.getByRole('button', { name: UI_COOKIE_CONSENT.REJECT_ALL }))
			expect(document.activeElement).toBe(document.body)
		})

		it('«Только выбранные»: accept с текущим выбором', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseCookieConsent, { props: { categories: CATEGORIES, isSettingsOpen: true } })
			await user.click(screen.getByRole('switch', { name: 'Аналитика' }))
			await user.click(screen.getByRole('button', { name: UI_COOKIE_CONSENT.ACCEPT_SELECTED }))
			expect(emitted('accept')).toEqual([[['necessary', 'analytics']]])
			expect(emitted('update:isOpen')).toEqual([[false]])
			expect(screen.queryByRole('region')).not.toBeInTheDocument()
		})
	})

	describe('storageKey', () => {
		it('после accept пишет JSON-массив в localStorage', async () => {
			const user = userEvent.setup()
			render(BaseCookieConsent, { props: { categories: CATEGORIES, storageKey: 'site', isSettingsOpen: true } })
			await user.click(await screen.findByRole('switch', { name: 'Реклама' }))
			expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
			await user.click(screen.getByRole('button', { name: UI_COOKIE_CONSENT.ACCEPT_SELECTED }))
			expect(JSON.parse(localStorage.getItem(STORAGE_KEY) as string)).toEqual(['necessary', 'ads'])
		})

		it('записанное решение: выбор восстановлен с нормализацией, окно скрыто, accept не эмитится', async () => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(['ads', 'ghost']))
			const { emitted } = render(BaseCookieConsent, { props: { categories: CATEGORIES, storageKey: 'site' } })
			await waitFor(() => expect(screen.queryByRole('region')).not.toBeInTheDocument())
			expect(emitted('update:modelValue')).toEqual([[['necessary', 'ads']]])
			expect(emitted('change')).toEqual([[['necessary', 'ads']]])
			expect(emitted('update:isOpen')).toEqual([[false]])
			expect(emitted('accept')).toBeUndefined()
		})

		it.each([
			['битый JSON', '{oops'],
			['не массив', '{"a":1}'],
			['массив не строк', '[1,2]'],
		])('%s в хранилище: окно показывается', async (_name, raw) => {
			localStorage.setItem(STORAGE_KEY, raw)
			const { emitted } = render(BaseCookieConsent, { props: { categories: CATEGORIES, storageKey: 'site' } })
			expect(await screen.findByRole('region')).toBeInTheDocument()
			expect(emitted('change')).toBeUndefined()
		})

		it('пустая запись: окно показывается', async () => {
			render(BaseCookieConsent, { props: { categories: CATEGORIES, storageKey: 'site' } })
			expect(await screen.findByRole('region')).toBeInTheDocument()
		})

		it('недоступное хранилище: окно показывается, accept не падает', async () => {
			vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
				throw new Error('denied')
			})
			vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
				throw new Error('denied')
			})
			const { emitted } = render(BaseCookieConsent, { props: { categories: CATEGORIES, storageKey: 'site' } })
			expect(await screen.findByRole('region')).toBeInTheDocument()
			await userEvent.setup().click(screen.getByRole('button', { name: UI_COOKIE_CONSENT.ACCEPT_SELECTED }))
			expect(emitted('accept')).toHaveLength(1)
		})

		it('без storageKey localStorage не трогается', async () => {
			const getItem = vi.spyOn(Storage.prototype, 'getItem')
			const setItem = vi.spyOn(Storage.prototype, 'setItem')
			render(BaseCookieConsent, { props: { categories: CATEGORIES } })
			await userEvent.setup().click(screen.getByRole('button', { name: UI_COOKIE_CONSENT.ACCEPT_ALL }))
			expect(getItem).not.toHaveBeenCalled()
			expect(setItem).not.toHaveBeenCalled()
		})
	})

	describe('язык и SSR', () => {
		it('setLocale("en") меняет тексты', () => {
			setLocale('en')
			render(BaseCookieConsent, { props: { categories: CATEGORIES } })
			expect(screen.getByRole('region', { name: 'We use cookies' })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'Customize' })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'Accept all' })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'Only selected' })).toBeInTheDocument()
		})

		it('renderToString не падает и отдаёт окно', async () => {
			const html = await renderToString(
				createSSRApp({ render: () => h(BaseCookieConsent, { categories: CATEGORIES, storageKey: 'site' }) }),
			)
			expect(html).not.toContain(UI_COOKIE_CONSENT.TITLE)
		})

		it('renderToString без storageKey отдаёт окно как область', async () => {
			const html = await renderToString(createSSRApp({ render: () => h(BaseCookieConsent, { categories: CATEGORIES }) }))
			expect(html).toContain('role="region"')
			expect(html).toContain(UI_COOKIE_CONSENT.TITLE)
		})
	})
})
