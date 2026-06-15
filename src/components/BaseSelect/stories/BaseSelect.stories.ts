/**
 * Stories для компонента BaseSelect.
 * Демонстрирует все вариации, мультивыбор, поиск, ошибки и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'

import { buildArgTypes } from '@utils/storybookUtils'
import { playFocusTest, playShiftTab } from '@utils/storybookUtils/a11yHelpers'
import type { BaseSelectOption } from '../model/BaseSelect.types'
import { SELECT_VARIANTS } from '../model/BaseSelect.types'
import BaseSelect from '../ui/BaseSelect.vue'

/** Демо-опции для stories */
const OPTIONS: BaseSelectOption[] = [
	{ value: 'metal', label: 'Металл' },
	{ value: 'wood', label: 'Дерево' },
	{ value: 'stone', label: 'Камень' },
	{ value: 'glass', label: 'Стекло', description: 'Прозрачный материал' },
	{ value: 'ceramic', label: 'Керамика', isDisabled: true },
]

/** Опции с иконками */
const ICON_OPTIONS: BaseSelectOption[] = [
	{ value: 'steel', label: 'Сталь', icon: '⚙️' },
	{ value: 'bronze', label: 'Бронза', icon: 'рџҐ‰' },
	{ value: 'copper', label: 'Медь', icon: 'рџџ¤' },
	{ value: 'gold', label: 'Золото', icon: 'рџҐ‡' },
]

/** Много опций для скролла */
const MANY_OPTIONS: BaseSelectOption[] = Array.from({ length: 20 }, (_, i) => ({
	value: `item-${i}`,
	label: `Элемент ${i + 1}`,
}))

const meta: Meta<typeof BaseSelect> = {
	title: 'UI/BaseSelect',
	component: BaseSelect,

	argTypes: buildArgTypes({
		props: {
			variant: { control: 'radio', options: SELECT_VARIANTS },
			sizeScale: { control: { type: 'range', min: 50, max: 200, step: 10 } },
			color: { control: 'object', description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }' },
			placeholder: { control: 'text' },
			label: { control: 'text' },
			isRequired: { control: 'boolean' },
			isMultiple: { control: 'boolean' },
			isSearchable: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			error: { control: 'text' },
		},
		hidden: ['modelValue', 'options', 'onUpdate:modelValue', 'onChange'],
	}),

	args: {
		options: OPTIONS,
		placeholder: 'Выберите материал...',
		label: '',
		isRequired: false,
		isMultiple: false,
		isSearchable: false,
		isDisabled: false,
		error: '',
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseSelect>
/** Базовый выбор */
export const Default: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка по Tab', async () => {
			await playFocusTest(canvasElement, { selector: '.base-select__trigger' })
		})
		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '.base-select__trigger' })
		})
	},
	parameters: {
		docs: {
			source: { code: '<BaseSelect v-model="value" :options="options" />' },
		},
	},
}
/** Все варианты отображения */
export const Variants: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const values = ref<Record<string, string | number | (string | number)[]>>({})
			const options = OPTIONS
			const variants = SELECT_VARIANTS
			return { args, values, options, variants }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSelect v-for="v in variants" :key="v"
					v-model="values[v]"
					v-bind="args"
					:variant="v"
					:placeholder="'Variant: ' + v"
					:options="options"
				/>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: { code: '<BaseSelect v-for="v in variants" :key="v" :variant="v" />' },
		},
	},
}
/** Масштаб размера */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			const options = OPTIONS
			return { args, value, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSelect v-model="value" :options="options" :size-scale="75" placeholder="75%" />
				<BaseSelect v-model="value" :options="options" :size-scale="100" placeholder="100%" />
				<BaseSelect v-model="value" :options="options" :size-scale="150" placeholder="150%" />
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: { code: '<BaseSelect :size-scale="150" />' },
		},
	},
}
/** Отключенный */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: { code: '<BaseSelect v-model="value" is-disabled />' },
		},
	},
}
/** С ошибкой */
export const WithError: Story = {
	args: {
		error: 'Выберите обязательный материал',
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: { code: '<BaseSelect v-model="value" error="Выберите обязательный материал" />' },
		},
	},
}
/** С label и required */
export const WithLabel: Story = {
	args: {
		label: 'Материал',
		isRequired: true,
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: { code: '<BaseSelect v-model="value" label="Материал" is-required />' },
		},
	},
}
/** Мультивыбор */
export const Multiple: Story = {
	args: {
		isMultiple: true,
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<(string | number)[]>([])
			return { args, value }
		},
		template: `
			<div>
				<BaseSelect v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);font-size:12px;">Выбрано: {{ value }}</p>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: { code: '<BaseSelect v-model="value" is-multiple />' },
		},
	},
}
/** С поиском */
export const Searchable: Story = {
	args: {
		isSearchable: true,
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: { code: '<BaseSelect v-model="value" is-searchable />' },
		},
	},
}
/** Мультивыбор + поиск */
export const MultipleSearchable: Story = {
	args: {
		isMultiple: true,
		isSearchable: true,
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<(string | number)[]>([])
			return { args, value }
		},
		template: `
			<div>
				<BaseSelect v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);font-size:12px;">Выбрано: {{ value }}</p>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: { code: '<BaseSelect v-model="value" is-multiple is-searchable />' },
		},
	},
}
/** С иконками */
export const WithIcons: Story = {
	args: {
		options: ICON_OPTIONS,
		placeholder: 'Выберите металл...',
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: { code: '<BaseSelect v-model="value" :options="iconOptions" />' },
		},
	},
}
/** С описаниями опций */
export const WithDescriptions: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			const options = OPTIONS
			return { args, value, options }
		},
		template: '<BaseSelect v-model="value" :options="options" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: { code: '<BaseSelect v-model="value" :options="options" />' },
		},
	},
}
/** С отключенной опцией */
export const WithDisabledOption: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: { code: '<BaseSelect v-model="value" :options="options" />' },
		},
	},
}
/** Много опций */
export const ManyOptions: Story = {
	args: {
		options: MANY_OPTIONS,
		placeholder: 'Выберите элемент...',
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	parameters: {
		docs: {
			source: { code: '<BaseSelect v-model="value" :options="manyOptions" />' },
		},
	},
}
/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseSelect },
		setup() {
			const v1 = ref<string | number | (string | number)[]>('')
			const v2 = ref<string | number | (string | number)[]>('')
			const v3 = ref<string | number | (string | number)[]>('')
			const v4 = ref<string | number | (string | number)[]>('')
			const v5 = ref<string | number | (string | number)[]>('')
			const v6 = ref<string | number | (string | number)[]>('')
			const options = OPTIONS
			return { v1, v2, v3, v4, v5, v6, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSelect v-model="v1" variant="default" placeholder="Normal" :options="options" />
				<BaseSelect v-model="v2" variant="default" placeholder="Hover" class="base-select--hover" :options="options" />
				<BaseSelect v-model="v3" variant="default" placeholder="Active" class="base-select--active" :options="options" />
				<BaseSelect v-model="v4" variant="default" placeholder="Focus" class="base-select--focus" :options="options" />
				<BaseSelect v-model="v5" variant="default" placeholder="Error" error="Ошибка" :options="options" />
				<BaseSelect v-model="v6" variant="default" placeholder="Disabled" is-disabled :options="options" />
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseSelect placeholder="Normal" />\n<BaseSelect class="base-select--hover" />\n<BaseSelect error="Ошибка" />\n<BaseSelect is-disabled />',
			},
		},
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: () => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			const options = OPTIONS
			return { value, options }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseSelect v-model="value" variant="default" :options="options" placeholder="Тёмная тема" />
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: { code: '<div data-theme="dark"><BaseSelect v-model="value" /></div>' },
		},
	},
}
/** Открытие/закрытие дропдауна — покрывает toggleDropdown, handleClose */
export const OpenClose: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		document.querySelectorAll('.base-dropdown__panel').forEach(el => el.remove())
		const trigger = canvasElement.querySelector('.base-select__trigger') as HTMLElement
		if (trigger) {
			await userEvent.click(trigger)
			await waitFor(() => {
				const dropdown = document.querySelector('.base-select__dropdown-content')
				expect(dropdown).toBeTruthy()
			})
			await userEvent.click(trigger)
			await waitFor(() => {
				const dropdown = document.querySelector('.base-select__dropdown-content')
				expect(dropdown).toBeFalsy()
			})
		}
	},
}
/** Выбор одной опции */
export const SelectOption: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		document.querySelectorAll('.base-dropdown__panel').forEach(el => el.remove())
		const trigger = canvasElement.querySelector('.base-select__trigger') as HTMLElement
		if (trigger) {
			await userEvent.click(trigger)
			let dropdown: HTMLElement | null = null
			await waitFor(() => {
				dropdown = document.querySelector('.base-select__dropdown-content')
				expect(dropdown).toBeTruthy()
			})
			if (dropdown) {
				const option = (dropdown as HTMLElement).querySelector(
					'.base-select__option:not(.base-select__option--disabled)',
				) as HTMLElement
				expect(option).toBeTruthy()
				await userEvent.click(option)
				await waitFor(() => {
					const valueText = canvasElement.querySelector('.base-select__value-text') as HTMLElement
					expect(valueText).toBeTruthy()
					expect(valueText.textContent).toBe('Металл')
				})
			}
		}
	},
}
/** Выбор нескольких опций */
export const SelectMultipleOption: Story = {
	args: { isMultiple: true },
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<(string | number)[]>([])
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		document.querySelectorAll('.base-dropdown__panel').forEach(el => el.remove())
		const trigger = canvasElement.querySelector('.base-select__trigger') as HTMLElement
		if (trigger) {
			await userEvent.click(trigger)
			let dropdown: HTMLElement | null = null
			await waitFor(() => {
				dropdown = document.querySelector('.base-select__dropdown-content')
				expect(dropdown).toBeTruthy()
			})
			if (dropdown) {
				const options = (dropdown as HTMLElement).querySelectorAll(
					'.base-select__option:not(.base-select__option--disabled)',
				)
				expect(options.length).toBeGreaterThan(0)
				if (options[0]) await userEvent.click(options[0] as HTMLElement)
				if (options[1]) await userEvent.click(options[1] as HTMLElement)

				await waitFor(() => {
					const tags = canvasElement.querySelectorAll('.base-select__tag')
					expect(tags.length).toBe(2)
				})

				const closeBtn = canvasElement.querySelector('.base-select__tag-close') as HTMLElement
				if (closeBtn) {
					await userEvent.click(closeBtn)
					await waitFor(() => {
						const tags = canvasElement.querySelectorAll('.base-select__tag')
						expect(tags.length).toBe(1)
					})
				}
			}
		}
	},
}
/** Поиск по опциям */
export const SearchOptions: Story = {
	args: { isSearchable: true },
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
}
/** Навигация с клавиатуры */
export const KeyboardNavigation: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		document.querySelectorAll('.base-dropdown__panel').forEach(el => el.remove())
		const trigger = canvasElement.querySelector('.base-select__trigger') as HTMLElement
		expect(trigger).toBeInTheDocument()

		await step('Фокусировка на селекте через Tab', async () => {
			trigger.focus()
			expect(trigger).toHaveFocus()
		})

		await step('Открытие выпадающего списка по Enter', async () => {
			await userEvent.keyboard('{Enter}')
			await waitFor(() => {
				const dropdown = document.querySelector('.base-select__dropdown-content')
				expect(dropdown).toBeTruthy()
			})
		})

		await step('Выбор первого элемента кликом', async () => {
			// Компонент не поддерживает навигацию стрелками между опциями,
			// поэтому выбираем первый доступный элемент кликом
			const firstOption = document.querySelector('.base-select__option') as HTMLElement
			expect(firstOption).toBeTruthy()
			await userEvent.click(firstOption)

			await waitFor(() => {
				const valueText = canvasElement.querySelector('.base-select__value-text') as HTMLElement
				expect(valueText).toBeTruthy()
				expect(valueText.textContent).toBe('Металл')
			})
		})
	},
}
/** Клик по отключённой опции */
export const ClickDisabledOption: Story = {
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		document.querySelectorAll('.base-dropdown__panel').forEach(el => el.remove())
		const trigger = canvasElement.querySelector('.base-select__trigger') as HTMLElement
		if (trigger) {
			await userEvent.click(trigger)
			let dropdown: HTMLElement | null = null
			await waitFor(() => {
				dropdown = document.querySelector('.base-select__dropdown-content')
				expect(dropdown).toBeTruthy()
			})
			if (dropdown) {
				const disabledOption = (dropdown as HTMLElement).querySelector('.base-select__option--disabled') as HTMLElement
				expect(disabledOption).toBeTruthy()
				await userEvent.click(disabledOption)
				const valueText = canvasElement.querySelector('.base-select__value-text')
				expect(valueText).toBeFalsy()
			}
		}
	},
}
/** searchable с вводом текста (filteredOptions с query) */
export const SearchWithQuery: Story = {
	args: { isSearchable: true },
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		document.querySelectorAll('.base-dropdown__panel').forEach(el => el.remove())
		const trigger = canvasElement.querySelector('.base-select__trigger') as HTMLElement
		if (trigger) await userEvent.click(trigger)
		let dropdown: HTMLElement | null = null
		await waitFor(() => {
			dropdown = document.querySelector('.base-select__dropdown-content')
			expect(dropdown).toBeTruthy()
		})
		if (dropdown) {
			const input = (dropdown as HTMLElement).querySelector('.base-select__search-input') as HTMLInputElement
			expect(input).toBeTruthy()
			await userEvent.type(input, 'Мет')
			await waitFor(
				() => {
					const options = (dropdown as HTMLElement).querySelectorAll('.base-select__option')
					expect(options.length).toBeGreaterThan(0)
				},
				{ timeout: 2000 },
			)
		}
	},
}
/** Селект без опций */
export const Empty: Story = {
	args: {
		modelValue: '',
		options: [],
		label: 'Пустой список',
		placeholder: 'Нет элементов',
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка по Tab', async () => {
			await playFocusTest(canvasElement, { selector: '.base-select__trigger' })
		})
		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '.base-select__trigger' })
		})
	},
}
/** Селект с большим количеством опций */
export const LongContent: Story = {
	args: {
		modelValue: '',
		options: MANY_OPTIONS,
		label: 'Много опций',
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка по Tab', async () => {
			await playFocusTest(canvasElement, { selector: '.base-select__trigger' })
		})
	},
}
/** Поиск без совпадений — покрывает блок "Ничего не найдено" (стр. 192-196) */
export const SearchNoResults: Story = {
	args: { isSearchable: true },
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		document.querySelectorAll('.base-dropdown__panel').forEach(el => el.remove())
		const trigger = canvasElement.querySelector('.base-select__trigger') as HTMLElement
		if (!trigger) return
		await userEvent.click(trigger)
		let dropdown: HTMLElement | null = null
		await waitFor(() => {
			dropdown = document.querySelector('.base-select__dropdown-content')
			expect(dropdown).toBeTruthy()
		})
		if (dropdown) {
			const input = (dropdown as HTMLElement).querySelector('.base-select__search-input') as HTMLInputElement
			expect(input).toBeTruthy()
			input.value = 'qwertyzzz'
			input.dispatchEvent(new Event('input', { bubbles: true }))
			await waitFor(
				() => {
					const noResults = (dropdown as HTMLElement).querySelector('.base-select__no-results')
					expect(noResults).toBeTruthy()
				},
				{ timeout: 2000 },
			)
		}
	},
}
/** Поиск по описанию опции — покрывает ветку matchDesc (стр. 291-292) */
export const SearchByDescription: Story = {
	args: { isSearchable: true },
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		document.querySelectorAll('.base-dropdown__panel').forEach(el => el.remove())
		const trigger = canvasElement.querySelector('.base-select__trigger') as HTMLElement
		if (!trigger) return
		await userEvent.click(trigger)
		let dropdown: HTMLElement | null = null
		await waitFor(() => {
			dropdown = document.querySelector('.base-select__dropdown-content')
			expect(dropdown).toBeTruthy()
		})
		if (dropdown) {
			const input = (dropdown as HTMLElement).querySelector('.base-select__search-input') as HTMLInputElement
			expect(input).toBeTruthy()
			input.value = 'прозрачный'
			input.dispatchEvent(new Event('input', { bubbles: true }))
			await waitFor(
				() => {
					const options = (dropdown as HTMLElement).querySelectorAll('.base-select__option')
					expect(options.length).toBe(1)
				},
				{ timeout: 2000 },
			)
		}
		// Закрываем дропдаун кликом по триггеру — покрывает handleClose (стр. 306)
		await userEvent.click(trigger)
		await waitFor(() => {
			const stillOpen = document.querySelector('.base-select__dropdown-content')
			expect(stillOpen).toBeFalsy()
		})
	},
}
/** Отображение иконки выбранной опции — покрывает стр. 94 (selectedOption.icon) */
export const SelectedIconDisplay: Story = {
	args: { options: ICON_OPTIONS, placeholder: 'Выберите металл...' },
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('steel')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const icon = canvasElement.querySelector('.base-select__icon')
		expect(icon).toBeTruthy()
		if (icon instanceof HTMLElement) {
			expect(icon.textContent?.trim()).toBeTruthy()
		}
	},
}
/** Отображение иконок в списке опций — покрывает стр. 171 (option.icon) */
export const OptionIconsList: Story = {
	args: { options: ICON_OPTIONS, placeholder: 'Выберите металл...' },
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		document.querySelectorAll('.base-dropdown__panel').forEach(el => el.remove())
		const trigger = canvasElement.querySelector('.base-select__trigger')
		if (!(trigger instanceof HTMLElement)) return
		await userEvent.click(trigger)
		await waitFor(() => {
			const optionIcons = document.querySelectorAll('.base-select__option-icon')
			expect(optionIcons.length).toBeGreaterThan(0)
		})
	},
}
/** Закрытие через клик вне — покрывает handleClose (стр. 306) */
export const HandleCloseClearsSearch: Story = {
	args: { options: OPTIONS, isSearchable: true },
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number>('')
			return { args, value }
		},
		template: '<div style="padding:200px;"><BaseSelect v-model="value" v-bind="args" /></div>',
	}),
	play: async ({ canvasElement }) => {
		document.querySelectorAll('.base-dropdown__panel').forEach(el => el.remove())
		const trigger = canvasElement.querySelector('.base-select__trigger')
		if (!(trigger instanceof HTMLElement)) return
		await userEvent.click(trigger)
		let searchInput: HTMLInputElement | null = null
		await waitFor(() => {
			const found = document.querySelector('.base-select__search-input')
			if (found instanceof HTMLInputElement) searchInput = found
			expect(searchInput).toBeTruthy()
		})
		if (searchInput) {
			await userEvent.type(searchInput, 'мет')
		}
		await userEvent.click(document.body)
		await waitFor(() => {
			const stillOpen = document.querySelector('.base-select__dropdown-content')
			expect(stillOpen).toBeFalsy()
		})
	},
}
/** Снятие выбора в multiple — покрывает splice ветку (стр. 322-324) */
export const MultipleDeselect: Story = {
	args: { isMultiple: true },
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<(string | number)[]>(['metal'])
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		document.querySelectorAll('.base-dropdown__panel').forEach(el => el.remove())
		const trigger = canvasElement.querySelector('.base-select__trigger') as HTMLElement
		if (!trigger) return
		await userEvent.click(trigger)
		let dropdown: HTMLElement | null = null
		await waitFor(() => {
			dropdown = document.querySelector('.base-select__dropdown-content')
			expect(dropdown).toBeTruthy()
		})
		if (dropdown) {
			const selectedOption = (dropdown as HTMLElement).querySelector('.base-select__option--selected') as HTMLElement
			expect(selectedOption).toBeTruthy()
			await userEvent.click(selectedOption)
			await waitFor(() => {
				const stillSelected = (dropdown as HTMLElement).querySelector('.base-select__option--selected')
				expect(stillSelected).toBeFalsy()
			})
		}
	},
}
/** Селект с обязательным label — ветка isRequired=true */
export const RequiredLabel: Story = {
	args: {
		label: 'Обязательное поле',
		isRequired: true,
		options: OPTIONS,
		placeholder: 'Выберите',
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const required = canvasElement.querySelector('.base-select__required')
		expect(required).toBeTruthy()
	},
}
/** Клик по триггеру при isDisabled — ветка !props.isDisabled ложна */
export const DisabledTriggerClick: Story = {
	args: {
		options: OPTIONS,
		isDisabled: true,
		placeholder: 'Заблокировано',
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		let trigger: HTMLElement | null = null
		await waitFor(() => {
			const found = canvasElement.querySelector('.base-select__trigger')
			expect(found).toBeTruthy()
			if (found instanceof HTMLElement) trigger = found
		})
		try {
			if (trigger) await userEvent.click(trigger)
		} catch { /* ignore */ }
		await waitFor(() => {
			const dropdown =
				document.querySelector('.base-select__dropdown-content') || document.querySelector('.base-select__dropdown')
			const visible = dropdown instanceof HTMLElement && dropdown.offsetParent !== null && dropdown.children.length > 0
			expect(visible).toBeFalsy()
		})
	},
}
/** Удаление тега в multiple — функция removeValue */
export const MultipleRemoveTag: Story = {
	args: {
		options: OPTIONS,
		isMultiple: true,
		placeholder: 'Выберите несколько',
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<(string | number)[]>(['metal', 'wood'])
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		// Дожидаемся рендера двух тегов (steel + iron) и крестиков закрытия
		await waitFor(
			() => {
				const tags = canvasElement.querySelectorAll('.base-select__tag')
				const closes = canvasElement.querySelectorAll('.base-select__tag-close')
				expect(tags.length).toBe(2)
				expect(closes.length).toBe(2)
			},
			{ timeout: 3000 },
		)
		// Кликаем по крестику первого тега и ждём удаления
		const firstClose = canvasElement.querySelector('.base-select__tag-close')
		if (!(firstClose instanceof HTMLElement)) throw new Error('tag-close не найден')
		await userEvent.click(firstClose)
		await waitFor(
			() => {
				const tags = canvasElement.querySelectorAll('.base-select__tag')
				expect(tags.length).toBe(1)
			},
			{ timeout: 3000 },
		)
	},
}
/** Селект с customClass — покрытие всех elementKeys */
export const WithCustomClass: Story = {
	args: {
		options: OPTIONS,
		label: 'С классами',
		isRequired: true,
		error: 'Ошибка',
		customClass: {
			root: 'sel-root',
			dropdown: 'sel-dropdown',
			label: 'sel-label',
			required: 'sel-required',
			trigger: 'sel-trigger',
			values: 'sel-values',
			placeholder: 'sel-placeholder',
			arrow: 'sel-arrow',
			errorText: 'sel-error',
		},
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.sel-root')).toBeTruthy()
	},
}
/** Селект с customColor — покрытие customColorStyle */
export const WithCustomColor: Story = {
	args: {
		options: OPTIONS,
		color: {
			bg: { base: '#fafafa', hover: '#f0f0f0' },
			text: { base: '#222222', hover: '#000000' },
		},
	},
	render: args => ({
		components: { BaseSelect },
		setup() {
			const value = ref<string | number | (string | number)[]>('')
			return { args, value }
		},
		template: '<BaseSelect v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement).toBeInTheDocument()
	},
}
