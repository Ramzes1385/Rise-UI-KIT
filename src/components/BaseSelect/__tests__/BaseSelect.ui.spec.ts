import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseSelect from '../ui/BaseSelect.vue'
import { SELECT_PARTS } from '../types/BaseSelect.types'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BaseSelectOption, BaseSelectPart } from '../types/BaseSelect.types'

const OPTIONS: BaseSelectOption[] = [
	{ value: 'metal', label: 'Металл', icon: '⚙', description: 'Прочный' },
	{ value: 'wood', label: 'Дерево' },
]

const ui = Object.fromEntries([['root', 'u-root'], ...SELECT_PARTS.map(part => [part, `u-${part}`])])

function expectParts(parts: BaseSelectPart[]): void {
	for (const part of parts) expect(document.body.querySelector(`.base-select__${part}`), part).toHaveClass(`u-${part}`)
}

async function open(): Promise<void> {
	await fireEvent.click(screen.getByRole('combobox'))
}

describe('BaseSelect: проп ui', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('одиночный выбор: части поля и списка с поиском, шапкой и подвалом', async () => {
		render(BaseSelect, {
			props: { modelValue: 'metal', options: OPTIONS, label: 'Материал', isRequired: true, error: 'Ошибка', isSearchable: true, ui },
			slots: { header: 'Шапка', footer: 'Подвал' },
		})

		expect(document.body.querySelector('.base-select')).toHaveClass('u-root', 'base-select--error')
		expectParts(['dropdown', 'label', 'required', 'trigger', 'values', 'icon', 'value-text', 'arrow', 'error-text'])
		await open()
		expectParts(['dropdown-content', 'search', 'search-icon', 'search-input', 'header', 'options', 'option', 'option-icon'])
		expectParts(['option-content', 'option-label', 'option-desc', 'check', 'footer'])
	})

	it('мультивыбор: метки и чекбоксы; пустой поиск и плейсхолдер', async () => {
		const view = render(BaseSelect, { props: { modelValue: ['wood'], options: OPTIONS, isMultiple: true, ariaLabel: 'Материалы', ui } })

		expectParts(['tag', 'tag-text', 'tag-close'])
		await open()
		expectParts(['checkbox'])
		await view.rerender({ modelValue: [], options: [] })
		expectParts(['placeholder', 'no-results'])
	})

	it('без ui — только класс кита; классы плагина и экземпляра склеиваются', async () => {
		const { container } = render(BaseSelect, {
			props: { modelValue: 'wood', options: OPTIONS, ariaLabel: 'Материал', ui: { option: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSelect: { ui: { option: 'app', trigger: 'app-trigger' } } } })] },
		})

		expect(container.querySelector('.base-select')!.className).not.toMatch(/app|own/)
		expect(container.querySelector('.base-select__trigger')).toHaveClass('app-trigger')
		await open()
		expect(screen.getAllByRole('option')[1]).toHaveAttribute(
			'class',
			'base-select__option app own base-select__option--selected base-select__option--active',
		)
	})
})
