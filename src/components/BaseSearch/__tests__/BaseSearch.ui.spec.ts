import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseSearch from '../ui/BaseSearch.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { SEARCH_PARTS } from '../types/BaseSearch.types'

vi.mock('@composables/overlay/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/overlay/useEscapeKey', () => ({ useEscapeKey: vi.fn() }))
vi.mock('@composables/overlay/useScrollLock', () => ({ useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }) }))

const RESULTS = [
	{ id: 1, title: 'Закат в горах', description: 'Закат над рекой', category: 'Видео', icon: 'video' },
	{ id: 2, title: 'Закат у моря', image: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' },
]

const ui = Object.fromEntries([['root', 'u-root'], ...SEARCH_PARTS.map(part => [part, `u-${part}`])])

function expectParts(parts: readonly string[]): void {
	for (const part of parts) {
		const elements = document.querySelectorAll(`.base-search__${part}`)
		expect(elements.length, part).toBeGreaterThan(0)
		for (const element of elements) expect(element, part).toHaveClass(`u-${part}`)
	}
}

describe('BaseSearch: проп ui', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('режим default: поле, панель и части результатов получают классы ui', async () => {
		const { container } = render(BaseSearch, { props: { modelValue: 'закат', results: RESULTS, isLoading: true, ui } })

		await userEvent.setup().click(screen.getByRole('combobox'))
		expect(container.querySelector('.base-search')).toHaveClass('u-root')
		expectParts([
			'trigger',
			'field',
			'icon',
			'actions',
			'loading',
			'clear',
			'live',
			'panel',
			'listbox',
			'result',
			'result-image',
			'result-icon',
			'result-content',
			'result-title',
			'result-desc',
			'result-category',
			'match',
		])
		expect(document.querySelector('.base-search__panel')).toHaveClass('base-dropdown__panel')
	})

	it('строка загрузки и «Ничего не найдено» получают классы ui', async () => {
		const { rerender } = render(BaseSearch, { props: { modelValue: 'закат', results: [], isRemote: true, isLoading: true, ui } })

		await userEvent.setup().click(screen.getByRole('combobox'))
		expectParts(['status'])
		await rerender({ isLoading: false })
		expectParts(['empty'])
	})

	it.each(['modal', 'sidebar'] as const)('режим %s: подложка, окно, шапка, закрытие и результаты получают классы ui', async mode => {
		const { container } = render(BaseSearch, { props: { mode, modelValue: 'закат', results: RESULTS, ui } })

		await userEvent.setup().click(screen.getByRole('textbox'))
		await screen.findByRole('dialog')
		expect(container.querySelector('.base-search')).toHaveClass('u-root', `base-search--${mode}`)
		expectParts(['trigger', 'field', 'icon', 'live', `${mode}-overlay`, mode, `${mode}-header`, `${mode}-close`, `${mode}-results`])
		expectParts(['result', 'result-title', 'match'])
	})

	it('без ui — только класс кита; классы плагина и экземпляра склеиваются', async () => {
		const { container } = render(BaseSearch, {
			props: { modelValue: 'закат', results: RESULTS, ui: { result: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSearch: { ui: { result: 'app', icon: 'app-icon' } } } })] },
		})

		await userEvent.setup().click(screen.getByRole('combobox'))
		expect(container.querySelector('.base-search')!.className).not.toMatch(/\b(app|own)\b/)
		expect(container.querySelector('.base-search__icon')).toHaveClass('app-icon')
		expect(document.querySelector('.base-search__result')).toHaveClass('base-search__result', 'app', 'own')
		expect(document.querySelector('.base-search__result-title')!.className).not.toMatch(/\b(app|own)\b/)
	})
})
