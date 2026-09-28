import { ref } from 'vue'
import { expect, fn, waitFor } from 'storybook/test'
import BaseAutocomplete from '../ui/BaseAutocomplete.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { AUTOCOMPLETE_VARIANTS } from '../types/BaseAutocomplete.types'
import type { AutocompleteOption } from '../types/BaseAutocomplete.types'
import { ARG_GROUP, baseArgTypes, propGroup, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'

const CITIES: AutocompleteOption[] = [
	{ value: 'msk', label: 'Москва' },
	{ value: 'spb', label: 'Санкт-Петербург' },
	{ value: 'kzn', label: 'Казань' },
	{ value: 'nsk', label: 'Новосибирск' },
	{ value: 'ekb', label: 'Екатеринбург' },
	{ value: 'nnv', label: 'Нижний Новгород' },
	{ value: 'vlg', label: 'Волгоград' },
	{ value: 'vld', label: 'Владивосток', isDisabled: true, description: 'Доставка временно недоступна' },
]

/** Время «ответа сервера» в примере загрузки, мс */
const SEARCH_DELAY = 400

const meta = {
	title: 'Form/BaseAutocomplete',
	component: BaseAutocomplete,
	parameters: {
		docs: {
			description: {
				component: [
					'Поле с подсказками: город, компания, тег из справочника. Список фильтруется по вводу, выбор — мышью или с клавиатуры.',
					'',
					'- По образцу APG Combobox: фокус остаётся в поле, ↓/↑ ведут по вариантам (`aria-activedescendant`), Enter выбирает,',
					'  Escape закрывает список, а при закрытом — очищает поле. Число найденного слышно из `role="status"`.',
					'- Текст без выбора из списка при выходе из поля заменяется выбранным значением; `isCustomAllowed` делает его значением (`normalize` — привести текст к значению).',
					'- `isRemote` + событие `search` — варианты с сервера без фильтрации, `isLoading` — «Загрузка…».',
					'- Слот `option` — своя разметка варианта; `filter` — своя фильтрация; `maxResults` — длина списка.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: AUTOCOMPLETE_VARIANTS }),
		modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
		options: { control: 'object', table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isCustomAllowed: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isRemote: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		maxResults: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		modelValue: null,
		options: CITIES,
		label: 'Город доставки',
		placeholder: 'Начните вводить город',
		isCustomAllowed: false,
		isRemote: false,
		isLoading: false,
		isDisabled: false,
		isReadonly: false,
		isRequired: false,
		variant: 'default',
		sizeScale: 100,
		onChange: fn(),
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseAutocomplete },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: '<div class="story-narrow"><BaseAutocomplete v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
} satisfies Meta<typeof BaseAutocomplete>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: ввод фильтрует города, совпадение выделено, клик выбирает. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('combobox', { name: 'Город доставки' })
		await userEvent.type(field, 'каз')
		const listbox = await waitFor(() => document.querySelector('[role="listbox"]') as HTMLElement)
		await waitFor(() => expect(listbox.querySelectorAll('[role="option"]')).toHaveLength(1))
		await userEvent.click(listbox.querySelector('[role="option"]') as HTMLElement)
		await expect(args.onChange).toHaveBeenLastCalledWith('kzn')
		await expect(field).toHaveValue('Казань')
		await expect(field).toHaveAttribute('aria-expanded', 'false')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Варианты поля — как у BaseInput. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseAutocomplete },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'label', 'modelValue']), variants: AUTOCOMPLETE_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 220px;">
				<BaseAutocomplete v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" model-value="spb" />
			</div>
		`,
	}),
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённое поле: не получает фокус, список не открывается. */
export const Disabled: Story = {
	args: { isDisabled: true, modelValue: 'msk' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('combobox', { name: 'Город доставки' })).toBeDisabled()
	},
}

/** Ошибка: текст под полем описывает его, поле помечено `aria-invalid`. */
export const WithError: Story = {
	args: { isRequired: true, error: 'Выберите город из списка' },
	play: async ({ canvas }) => {
		const field = canvas.getByRole('combobox', { name: 'Город доставки' })
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAccessibleDescription('Выберите город из списка')
	},
}

/** Ничего не найдено: в списке — «Ничего не найдено» (слот `empty`), скринридер слышит то же. */
export const Empty: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.type(canvas.getByRole('combobox', { name: 'Город доставки' }), 'Лондон')
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Ничего не найдено'))
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Свой вариант (`isCustomAllowed`): набранный город, которого нет в списке, становится значением при выходе из поля
 * или по Enter. Без `isCustomAllowed` такой текст заменился бы выбранным значением.
 */
export const CustomValue: Story = {
	args: { isCustomAllowed: true, label: 'Город (можно свой)' },
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('combobox', { name: 'Город (можно свой)' })
		await userEvent.type(field, 'Тверь{Enter}')
		await expect(args.onChange).toHaveBeenLastCalledWith('Тверь')
		await expect(field).toHaveValue('Тверь')
	},
}

/**
 * Варианты с сервера: `isRemote` и событие `search` — приложение загружает варианты по запросу, пока идёт запрос —
 * `isLoading`. Здесь «сервер» отвечает через 400 мс.
 */
export const Remote: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseAutocomplete },
		setup: () => {
			const options = ref<AutocompleteOption[]>([])
			const isLoading = ref(false)
			const selected = ref<string | number | null>(null)
			let timer: ReturnType<typeof setTimeout> | undefined
			function handleSearch(query: string): void {
				isLoading.value = true
				clearTimeout(timer)
				timer = setTimeout(() => {
					options.value = CITIES.filter(city => city.label.toLowerCase().startsWith(query.trim().toLowerCase()))
					isLoading.value = false
				}, SEARCH_DELAY)
			}
			return {
				props: useArgsWithoutSlots(args, ['options', 'isRemote', 'isLoading', 'modelValue', 'onChange']),
				options,
				isLoading,
				selected,
				handleSearch,
			}
		},
		template: `
			<div class="story-narrow">
				<BaseAutocomplete v-bind="props" v-model="selected" :options="options" :is-loading="isLoading" is-remote label="Город (поиск на сервере)" @search="handleSearch" />
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Город (поиск на сервере)' })
		await userEvent.type(field, 'Но')
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(1), { timeout: SEARCH_DELAY * 5 })
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(field).toHaveValue('Новосибирск')
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/** Клавиатура: ↓ открывает список и ведёт по вариантам (отключённый пропускается), Enter выбирает, Escape очищает поле. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('combobox', { name: 'Город доставки' })
		await tabTo(field, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		await expect(field).toHaveAttribute('aria-expanded', 'true')
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(args.onChange).toHaveBeenLastCalledWith('spb')
		await expect(field).toHaveValue('Санкт-Петербург')
		await userEvent.keyboard('{Escape}')
		await expect(args.onChange).toHaveBeenLastCalledWith(null)
		await expect(field).toHaveValue('')
	},
}
