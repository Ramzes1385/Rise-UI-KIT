/**
 * Integration-тесты для BaseDropdown.
 * Проверяют взаимодействие: закрытие по Escape, click-outside,
 * сохранение фокуса при preventMousedown.
 * Компонент использует teleport to="body" — поиск в document.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { defineComponent, ref } from 'vue'
import { BaseSelect } from '@components/BaseSelect'
import BaseDropdown from '../ui/BaseDropdown.vue'

/** Хост: кнопка-триггер и панель с полем ввода и некликабельным пунктом (preventMousedown по умолчанию) */
function renderDropdownWithInput() {
	const Host = defineComponent({
		components: { BaseDropdown },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<BaseDropdown v-model:is-open="isOpen">
				<button type="button" @click="isOpen = !isOpen">Меню</button>
				<template #dropdown>
					<input aria-label="Фильтр" />
					<div data-testid="item">Пункт</div>
				</template>
			</BaseDropdown>
		`,
	})
	return render(Host)
}

vi.mock('@composables/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/useDropdownPosition', () => ({
	useDropdownPosition: () => ({
		panelStyle: { value: {} },
		triggerWidth: { value: 0 },
		coords: { value: { top: 0, left: 0 } },
		updatePosition: vi.fn(),
	}),
}))

describe('BaseDropdown integration', () => {
	describe('закрытие по Escape', () => {
		it('должен эмитить close и update:isOpen при нажатии Escape когда closeOnEscape=true', async () => {
			const { emitted } = render(BaseDropdown, {
				props: { isOpen: true, closeOnEscape: true },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			await fireEvent.keyDown(document, { key: 'Escape' })

			expect(emitted()).toHaveProperty('close')
			expect(emitted()).toHaveProperty('update:isOpen')
			expect(emitted()['update:isOpen'][0]).toEqual([false])
		})

		it('не должен эмитить close при нажатии Escape когда closeOnEscape=false', async () => {
			const { emitted } = render(BaseDropdown, {
				props: { isOpen: true, closeOnEscape: false },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			await fireEvent.keyDown(document, { key: 'Escape' })

			expect(emitted()).not.toHaveProperty('close')
			expect(emitted()).not.toHaveProperty('update:isOpen')
		})
	})

	describe('preventMousedown и фокус', () => {
		it('должен предотвращать preventDefault при mousedown когда preventMousedown=true', async () => {
			render(BaseDropdown, {
				props: { isOpen: true, preventMousedown: true },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			const panel = document.querySelector('.base-dropdown__panel')
			expect(panel).toBeInTheDocument()

			const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
			panel?.dispatchEvent(event)
			expect(event.defaultPrevented).toBe(true)
		})

		it('не должен предотвращать preventDefault при mousedown когда preventMousedown=false', async () => {
			render(BaseDropdown, {
				props: { isOpen: true, preventMousedown: false },
				slots: {
					default: '<button>Триггер</button>',
					dropdown: '<p>Контент</p>',
				},
			})

			const panel = document.querySelector('.base-dropdown__panel')
			expect(panel).toBeInTheDocument()

			const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
			panel?.dispatchEvent(event)
			expect(event.defaultPrevented).toBe(false)
		})
	})

	describe('поля ввода внутри панели при preventMousedown по умолчанию', () => {
		it('BaseSelect с поиском: клик в поле поиска ставит фокус, ввод фильтрует опции', async () => {
			const user = userEvent.setup()
			render(BaseSelect, {
				props: {
					modelValue: '',
					isSearchable: true,
					options: [
						{ value: 'msk', label: 'Москва' },
						{ value: 'kzn', label: 'Казань' },
					],
				},
			})

			await user.click(document.querySelector('.base-select__trigger') as HTMLElement)
			const search = await screen.findByPlaceholderText('Поиск...')
			await user.click(search)

			expect(search).toHaveFocus()
			await user.keyboard('Каз')
			expect(search).toHaveValue('Каз')
			expect(screen.getByText('Казань')).toBeInTheDocument()
			expect(screen.queryByText('Москва')).not.toBeInTheDocument()
		})

		it('фокус, переведённый в поле ввода панели, не возвращается на триггер', async () => {
			const user = userEvent.setup()
			renderDropdownWithInput()

			await user.click(screen.getByRole('button', { name: 'Меню' }))
			const filter = screen.getByRole('textbox', { name: 'Фильтр' })
			filter.focus()

			expect(filter).toHaveFocus()
		})

		it('при закрытии по Escape фокус из поля ввода панели возвращается на триггер, а не на body', async () => {
			const user = userEvent.setup()
			renderDropdownWithInput()
			const trigger = screen.getByRole('button', { name: 'Меню' })

			await user.click(trigger)
			await user.click(screen.getByRole('textbox', { name: 'Фильтр' }))
			await user.keyboard('{Escape}')

			expect(screen.queryByRole('textbox', { name: 'Фильтр' })).not.toBeInTheDocument()
			expect(trigger).toHaveFocus()
		})

		it('не перехватывает фокус, если к моменту закрытия он уже вне панели', async () => {
			const user = userEvent.setup()
			const outside = document.createElement('input')
			outside.setAttribute('aria-label', 'Снаружи')
			document.body.appendChild(outside)
			renderDropdownWithInput()

			await user.click(screen.getByRole('button', { name: 'Меню' }))
			await user.click(screen.getByRole('textbox', { name: 'Фильтр' }))
			outside.focus()
			await user.keyboard('{Escape}')

			expect(outside).toHaveFocus()
			outside.remove()
		})

		it('BaseSelect с поиском: после выбора опции фокус возвращается на триггер селекта', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSelect, {
				props: {
					modelValue: '',
					isSearchable: true,
					options: [
						{ value: 'msk', label: 'Москва' },
						{ value: 'kzn', label: 'Казань' },
					],
				},
			})
			const trigger = document.querySelector('.base-select__trigger') as HTMLElement

			await user.click(trigger)
			await user.click(await screen.findByPlaceholderText('Поиск...'))
			await user.keyboard('Каз')
			await user.click(screen.getByText('Казань'))

			expect(emitted()['update:modelValue']).toEqual([['kzn']])
			expect(trigger).toHaveFocus()
		})

		it('клик по нетекстовому содержимому панели по-прежнему не уводит фокус с триггера', async () => {
			const user = userEvent.setup()
			renderDropdownWithInput()
			const trigger = screen.getByRole('button', { name: 'Меню' })

			await user.click(trigger)
			await user.click(screen.getByTestId('item'))

			expect(trigger).toHaveFocus()
		})
	})
})
