import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseDescriptions from '../ui/BaseDescriptions.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { DESCRIPTIONS_PARTS } from '../types/BaseDescriptions.types'
import type { DescriptionsItem } from '../types/BaseDescriptions.types'

const ITEMS: DescriptionsItem[] = [
	{ key: 'inn', label: 'ИНН', value: '7707083893', isCopyable: true },
	{ key: 'phone', label: 'Телефон', value: null },
]
const SLOTS = { extra: '<button>Изменить</button>' }
const PARTS = DESCRIPTIONS_PARTS.filter(part => part !== 'empty')

afterEach(() => vi.unstubAllGlobals())

describe('BaseDescriptions: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseDescriptions, { props: { items: ITEMS, title: 'Реквизиты' }, slots: SLOTS })
		const root = container.querySelector('.base-descriptions')!

		expect(root).toHaveAttribute('class', 'base-descriptions base-descriptions--horizontal')
		for (const part of PARTS) {
			const classes = [...root.querySelector(`.base-descriptions__${part}`)!.classList]
			expect(classes.filter(name => !name.startsWith('base-'))).toEqual([])
		}
		expect(root.querySelector('.base-descriptions__label')).toHaveAttribute('class', 'base-descriptions__label')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...DESCRIPTIONS_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseDescriptions, {
			props: {
				items: ITEMS,
				title: 'Реквизиты',
				variant: 'soft',
				layout: 'vertical',
				customClass: { root: 'own-root', list: 'own-list' },
				ui,
			},
			slots: SLOTS,
		})
		const root = container.querySelector('.base-descriptions')!

		expect(root).toHaveClass('base-descriptions', 'u-root', 'base-descriptions--soft', 'base-descriptions--vertical', 'own-root')
		for (const part of PARTS) expect(root.querySelector(`.base-descriptions__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-descriptions__list')).toHaveClass('own-list')
	})

	it('часть empty — у текста «Нет данных»', () => {
		const { container } = render(BaseDescriptions, { props: { items: [], ui: { empty: 'u-empty' } } })

		expect(container.querySelector('.base-descriptions__empty')).toHaveClass('u-empty')
	})

	it('классы из defaults.BaseDescriptions.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseDescriptions, {
			props: { items: ITEMS, ui: { label: 'own-label' } },
			global: {
				plugins: [createUiKitPlugin({ defaults: { BaseDescriptions: { ui: { root: 'app-root', label: 'app-label' } } } })],
			},
		})

		expect(container.querySelector('.base-descriptions')).toHaveClass('app-root')
		expect(container.querySelector('.base-descriptions__label')).toHaveAttribute(
			'class',
			'base-descriptions__label app-label own-label',
		)
	})
})

describe('BaseDescriptions: смена иконки «Копировать»', () => {
	it('иконка в Transition сменяется по ключу: copy → check', async () => {
		vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
		const { container } = render(BaseDescriptions, { props: { items: ITEMS }, global: { stubs: { transition: false } } })
		const icon = () => container.querySelector('.base-descriptions__copy .base-icon use')?.getAttribute('href') ?? ''

		expect(icon()).toMatch(/copy$/)
		await fireEvent.click(screen.getByRole('button', { name: 'Копировать: ИНН' }))
		await vi.waitFor(() => expect(icon()).toMatch(/check$/))
		expect(container.querySelectorAll('.base-descriptions__copy .base-icon')).toHaveLength(1)
	})
})
