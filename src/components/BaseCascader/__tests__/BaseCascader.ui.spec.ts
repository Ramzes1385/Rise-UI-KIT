import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseCascader from '../ui/BaseCascader.vue'
import { flush, REGIONS } from './cascaderFixtures'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

const FIELD_PARTS = ['label', 'trigger', 'values', 'placeholder', 'arrow'] as const
const PANEL_PARTS = ['panel', 'search', 'search-input', 'columns', 'column', 'options', 'option'] as const

function uiOf(parts: readonly string[]): Record<string, string> {
	return Object.fromEntries([['root', 'u-root'], ...parts.map(part => [part, `u-${part}`])])
}

const motionGlobal = { stubs: { 'transition-group': false } }

const panel = (): HTMLElement => document.querySelector<HTMLElement>('.base-cascader__panel')!
const columns = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('.base-cascader__column')]
const lastColumn = (): HTMLElement | undefined => columns()[columns().length - 1]

describe('BaseCascader: проп ui', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('классы частей поля и панели добавляются к БЭМ-классам кита, customClass сохраняется', async () => {
		const user = userEvent.setup()
		const ui = uiOf([...FIELD_PARTS, ...PANEL_PARTS, 'dropdown', 'required', 'error-text'])
		const { container } = render(BaseCascader, {
			props: {
				items: REGIONS,
				label: 'Регион',
				isRequired: true,
				isSearchable: true,
				error: 'Ошибка',
				ui,
				customClass: { trigger: 'own' },
			},
		})
		const root = container.querySelector('.base-cascader')!
		expect(root).toHaveClass('u-root', 'base-cascader')
		for (const part of FIELD_PARTS) expect(root.querySelector(`.base-cascader__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-cascader__trigger')).toHaveClass('own')
		expect(root.querySelector('.base-cascader__required')).toHaveClass('u-required')
		expect(root.querySelector('.base-cascader__error-text')).toHaveClass('u-error-text')
		expect(container.querySelector('.base-cascader__dropdown')).toHaveClass('u-dropdown')

		await user.click(screen.getByRole('combobox'))
		for (const part of PANEL_PARTS) expect(panel().querySelector(`.base-cascader__${part}`) ?? panel()).toHaveClass(`u-${part}`)
	})

	it('метки, значение, результаты поиска и пустой уровень получают классы ui', async () => {
		const user = userEvent.setup()
		const ui = uiOf(['tag', 'tag-text', 'tag-close', 'results', 'empty', 'value-text'])
		const { container, rerender } = render(BaseCascader, {
			props: { items: REGIONS, isMultiple: true, isSearchable: true, modelValue: [['am']], ui },
		})
		for (const part of ['tag', 'tag-text', 'tag-close'])
			expect(container.querySelector(`.base-cascader__${part}`)).toHaveClass(`u-${part}`)
		await user.click(screen.getByRole('combobox'))
		await user.keyboard('zzz')
		expect(panel().querySelector('.base-cascader__results')).toHaveClass('u-results')
		expect(panel().querySelector('.base-cascader__empty')).toHaveClass('u-empty')
		await rerender({ items: REGIONS, isMultiple: false, modelValue: ['am'], ui })
		expect(container.querySelector('.base-cascader__value-text')).toHaveClass('u-value-text')
	})

	it('классы плагина и экземпляра склеиваются; без ui — только классы кита', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseCascader, {
			props: { items: REGIONS, ui: { trigger: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCascader: { ui: { trigger: 'app', column: 'app-column' } } } })] },
		})
		expect(container.querySelector('.base-cascader__trigger')).toHaveAttribute('class', 'base-cascader__trigger app own')
		expect(container.querySelector('.base-cascader__values')).toHaveAttribute('class', 'base-cascader__values')
		await user.click(screen.getByRole('combobox'))
		expect(columns()[0]).toHaveClass('base-cascader__column', 'app-column', 'base-cascader__column--ready')
	})
})

describe('BaseCascader: движение колонок', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('новая колонка уровня появляется переходом base-cascader-column, ключ колонки — родитель', async () => {
		const user = userEvent.setup()
		render(BaseCascader, { props: { items: REGIONS }, global: motionGlobal })
		await user.click(screen.getByRole('combobox'))
		await flush()
		expect(columns()).toHaveLength(1)
		expect(columns()[0]).not.toHaveClass('base-cascader-column-enter-active')

		await user.click(screen.getByRole('option', { name: 'Россия' }))
		expect(columns()).toHaveLength(2)
		expect(columns()[1]).toHaveClass('base-cascader-column-enter-from', 'base-cascader-column-enter-active')
		const russia = columns()[1]

		await user.click(screen.getByRole('option', { name: 'Казахстан' }))
		await nextTick()
		expect(screen.getAllByRole('listbox')[1]).toHaveAccessibleName('Казахстан')
		expect(lastColumn()).not.toBe(russia)
	})

	it('путь значения при открытии раскрывается без перехода, затем переходы снова включены', async () => {
		const user = userEvent.setup()
		render(BaseCascader, { props: { items: REGIONS, modelValue: ['ru', 'msk', 'tverskoy'] }, global: motionGlobal })
		await user.click(screen.getByRole('combobox'))
		expect(columns()).toHaveLength(3)
		for (const column of columns()) expect(column).not.toHaveClass('base-cascader-column-enter-active')
		await flush()

		await user.click(screen.getByRole('option', { name: 'Санкт-Петербург' }))
		expect(lastColumn()).toHaveClass('base-cascader-column-enter-active')
	})
})
