import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import type { MegaMenuItem } from '../types/BaseMegaMenu.types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { getCatalogDepth, getFocusable, isDrilldownItem } from '../model/megaMenuItems'

const ITEMS: MegaMenuItem[] = [
	{
		key: 'catalog',
		label: 'Каталог',
		groups: [
			{
				title: 'Телефоны',
				items: [
					{
						label: 'Смартфоны',
						children: [
							{ label: 'Флагманы', children: [{ label: 'Компактные', to: '/phones/compact' }] },
							{ label: 'Бюджетные', to: '/phones/budget' },
						],
					},
					{ label: 'Кнопочные', to: '/phones/push' },
					{ label: 'Запасные', isDisabled: true, children: [{ label: 'Батареи', to: '/spare' }] },
				],
			},
			{ items: [{ label: 'Сервис', children: [{ label: 'Ремонт', to: '/repair' }] }] },
		],
	},
	{ key: 'flat', label: 'Плоский', groups: [{ items: [{ label: 'Блог', children: [{ label: 'Новости', to: '/news' }] }] }] },
]

function setViewport(width: number): void {
	Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
	window.dispatchEvent(new Event('resize'))
}

type Props = Record<string, unknown>

async function openCatalog(props: Props = {}) {
	const utils = render(BaseMegaMenu, {
		props: { items: ITEMS, trigger: 'click', drilldown: 'always', ...props },
		global: { stubs: { transition: false } },
	})
	await fireEvent.click(screen.getByRole('button', { name: 'Каталог' }))
	return utils
}

const link = (name: string): HTMLElement => screen.getByRole('button', { name })
const status = (index = 0): string => document.querySelectorAll('.base-mega-menu__drill-status')[index]?.textContent ?? ''

beforeEach(() => setViewport(1280))

afterEach(() => {
	cleanup()
	document.documentElement.removeAttribute('data-rise-motion')
	vi.unstubAllGlobals()
})

describe('BaseMegaMenu: drill-down', () => {
	it('по умолчанию уровни идут каскадом: aria-expanded у пункта, колонок drill-down нет', async () => {
		await openCatalog({ drilldown: undefined })

		expect(link('Смартфоны')).toHaveAttribute('aria-expanded', 'false')
		expect(document.querySelector('.base-mega-menu__drill')).toBeNull()
	})

	it('drilldown="always": пункт с вложенным уровнем без aria-expanded, список колонки заменяется уровнем', async () => {
		await openCatalog()
		const parent = link('Смартфоны')

		expect(parent).not.toHaveAttribute('aria-expanded')
		expect(parent).not.toHaveAttribute('aria-haspopup')
		await fireEvent.click(parent)

		expect(screen.queryByRole('button', { name: 'Кнопочные' })).toBeNull()
		expect(screen.getByRole('list', { name: 'Смартфоны' })).toBeInTheDocument()
		expect(link('Флагманы')).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Бюджетные' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Назад к «Телефоны»' })).toBeInTheDocument()
		expect(document.querySelectorAll('.base-mega-menu__group')).toHaveLength(2)
		expect(screen.getByRole('button', { name: 'Сервис' })).toBeInTheDocument()
	})

	it('после входа фокус на первом пункте уровня и уровень объявлен', async () => {
		await openCatalog()

		await fireEvent.click(link('Смартфоны'))

		await waitFor(() => expect(link('Флагманы')).toHaveFocus())
		expect(status()).toBe('Уровень «Смартфоны»: 2 пункта')
	})

	it('«Назад» возвращает список колонки и фокус на пункт, из которого вошли', async () => {
		await openCatalog()
		await fireEvent.click(link('Смартфоны'))

		await fireEvent.click(screen.getByRole('button', { name: 'Назад к «Телефоны»' }))

		await waitFor(() => expect(link('Смартфоны')).toHaveFocus())
		expect(screen.getByRole('link', { name: 'Кнопочные' })).toBeInTheDocument()
		await waitFor(() => expect(screen.queryByRole('button', { name: /^Назад/ })).toBeNull())
		expect(status()).toBe('Уровень «Телефоны»: 3 пункта')
	})

	it('на третьем уровне «Назад» ведёт к названию второго, а колонка без заголовка — к названию раздела', async () => {
		await openCatalog()
		await fireEvent.click(link('Смартфоны'))
		await fireEvent.click(link('Флагманы'))

		expect(screen.getByRole('button', { name: 'Назад к «Смартфоны»' })).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Компактные' })).toBeInTheDocument()
		expect(status()).toBe('Уровень «Флагманы»: 1 пункт')

		await fireEvent.click(screen.getByRole('button', { name: 'Назад к «Смартфоны»' }))
		await waitFor(() => expect(link('Флагманы')).toHaveFocus())
		expect(status()).toBe('Уровень «Смартфоны»: 2 пункта')

		await fireEvent.click(link('Сервис'))
		expect(screen.getByRole('button', { name: 'Назад к «Каталог»' })).toBeInTheDocument()
		await fireEvent.click(screen.getByRole('button', { name: 'Назад к «Каталог»' }))
		await waitFor(() => expect(link('Сервис')).toHaveFocus())
		expect(status(1)).toBe('Уровень «Каталог»: 1 пункт')
	})

	it('→ на пункте открывает уровень, ← и Escape на уровне возвращают, меню остаётся открытым', async () => {
		await openCatalog()
		const parent = link('Смартфоны')
		parent.focus()

		await fireEvent.keyDown(parent, { key: 'ArrowRight' })
		await waitFor(() => expect(link('Флагманы')).toHaveFocus())

		await fireEvent.keyDown(link('Флагманы'), { key: 'ArrowLeft' })
		await waitFor(() => expect(link('Смартфоны')).toHaveFocus())

		await fireEvent.keyDown(link('Смартфоны'), { key: 'ArrowRight' })
		await waitFor(() => expect(link('Флагманы')).toHaveFocus())
		await fireEvent.keyDown(screen.getByRole('link', { name: 'Бюджетные' }), { key: 'Escape' })

		await waitFor(() => expect(link('Смартфоны')).toHaveFocus())
		expect(screen.getByRole('button', { name: 'Каталог' })).toHaveAttribute('aria-expanded', 'true')
	})

	it('← и Escape на кнопке «Назад» возвращают на уровень выше, остальные клавиши не трогают', async () => {
		await openCatalog()
		await fireEvent.click(link('Смартфоны'))
		const back = (): HTMLElement => screen.getByRole('button', { name: 'Назад к «Телефоны»' })

		await fireEvent.keyDown(back(), { key: 'ArrowDown' })
		expect(back()).toBeInTheDocument()
		await fireEvent.keyDown(back(), { key: 'ArrowLeft' })
		await waitFor(() => expect(link('Смартфоны')).toHaveFocus())

		await fireEvent.click(link('Смартфоны'))
		await fireEvent.keyDown(back(), { key: 'Escape' })
		await waitFor(() => expect(link('Смартфоны')).toHaveFocus())
	})

	it('← на пункте корня и клавиши вне навигации по уровням не перехватываются, Escape в корне закрывает меню', async () => {
		await openCatalog()
		const parent = link('Смартфоны')
		parent.focus()

		await fireEvent.keyDown(parent, { key: 'ArrowLeft' })
		await fireEvent.keyDown(parent, { key: 'a' })
		expect(screen.queryByRole('button', { name: /^Назад/ })).toBeNull()

		await fireEvent.keyDown(document, { key: 'Escape' })
		await waitFor(() => expect(screen.getByRole('button', { name: 'Каталог' })).toHaveAttribute('aria-expanded', 'false'))
	})

	it('выбор ссылки уровня сообщает select и закрывает меню', async () => {
		const { emitted } = await openCatalog()
		await fireEvent.click(link('Смартфоны'))

		await fireEvent.click(screen.getByRole('link', { name: 'Бюджетные' }))

		expect((emitted().select as unknown[][])[0][0]).toMatchObject({ label: 'Бюджетные' })
		await waitFor(() => expect(screen.getByRole('button', { name: 'Каталог' })).toHaveAttribute('aria-expanded', 'false'))
	})

	it('отключённый пункт с вложенным уровнем не открывается, наведение ничего не меняет', async () => {
		await openCatalog({ trigger: 'hover' })
		const disabled = link('Запасные')

		expect(disabled).toBeDisabled()
		await fireEvent.pointerEnter(link('Смартфоны').closest('li') as HTMLElement, { pointerType: 'mouse' })
		expect(document.querySelector('.base-mega-menu__sub')).toBeNull()
	})

	it('слот link получает ссылки уровней', async () => {
		render(BaseMegaMenu, {
			props: { items: ITEMS, trigger: 'click', drilldown: 'always' },
			slots: { link: '<template #link="{ link, depth }">{{ link.label }} [{{ depth }}]</template>' },
			global: { stubs: { transition: false } },
		})
		await fireEvent.click(screen.getByRole('button', { name: 'Каталог' }))
		await fireEvent.click(screen.getByRole('button', { name: /Смартфоны \[0\]/ }))

		expect(screen.getByRole('button', { name: /Флагманы \[1\]/ })).toBeInTheDocument()
	})

	it('в мобильном виде drilldown не применяется: уровни списком под пунктом', async () => {
		setViewport(500)
		render(BaseMegaMenu, {
			props: { items: ITEMS, trigger: 'click', drilldown: 'always' },
			global: { stubs: { transition: false } },
		})
		await fireEvent.click(screen.getByRole('button', { name: 'Меню' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Каталог' }))

		expect(document.querySelector('.base-mega-menu__drill')).toBeNull()
		expect(link('Смартфоны')).toHaveAttribute('aria-expanded', 'false')
	})

	it('при уменьшении движения уровни сменяются без переходных классов', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
		await openCatalog()

		await fireEvent.click(link('Смартфоны'))
		await nextTick()

		expect(document.querySelector('.base-mega-menu__drill-level')?.className).not.toMatch(/-(enter|leave)-/)
		expect(link('Флагманы')).toBeInTheDocument()
	})
})

describe('BaseMegaMenu: режим auto', () => {
	it('включает drill-down у разделов, где вложенность каталога не меньше drilldownFrom', async () => {
		await openCatalog({ drilldown: 'auto' })

		expect(document.querySelector('.base-mega-menu__drill')).not.toBeNull()
		await fireEvent.click(screen.getByRole('button', { name: 'Плоский' }))
		await waitFor(() => expect(document.querySelector('.base-mega-menu__drill')).toBeNull())
		expect(screen.getByRole('button', { name: 'Блог' })).toHaveAttribute('aria-expanded', 'false')
	})

	it('drilldownFrom сдвигает порог', async () => {
		await openCatalog({ drilldown: 'auto', drilldownFrom: 4 })

		expect(document.querySelector('.base-mega-menu__drill')).toBeNull()
		expect(link('Смартфоны')).toHaveAttribute('aria-expanded', 'false')
	})

	it('глубина каталога и выбор режима', () => {
		expect(getCatalogDepth(ITEMS[0])).toBe(3)
		expect(getCatalogDepth(ITEMS[1])).toBe(2)
		expect(getCatalogDepth({ label: 'Без колонок' })).toBe(0)
		expect(getFocusable(null, 'button')).toEqual([])
		expect(isDrilldownItem(ITEMS[1], 'never', 1)).toBe(false)
		expect(isDrilldownItem(ITEMS[1], 'always', 99)).toBe(true)
		expect(isDrilldownItem(ITEMS[0], 'auto', 3)).toBe(true)
		expect(isDrilldownItem(ITEMS[0], 'auto', 4)).toBe(false)
	})
})
