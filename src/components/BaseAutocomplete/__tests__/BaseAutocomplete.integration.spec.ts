import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import { BaseForm } from '@components/BaseForm'
import userEvent from '@testing-library/user-event'
import BaseAutocomplete from '../ui/BaseAutocomplete.vue'
import { render, screen, waitFor } from '@testing-library/vue'
import type { AutocompleteOption } from '../types/BaseAutocomplete.types'

const CITIES: AutocompleteOption[] = [
	{ value: 'msk', label: 'Москва' },
	{ value: 'spb', label: 'Санкт-Петербург', description: 'Северная столица' },
	{ value: 'kzn', label: 'Казань' },
	{ value: 'vld', label: 'Владивосток', isDisabled: true },
	{ value: 'ekb', label: 'Екатеринбург' },
]

function options(): HTMLElement[] {
	return [...document.querySelectorAll<HTMLElement>('[role="option"]')]
}

function renderModel(initial: string | number | null = null, props: Record<string, unknown> = {}) {
	const model = ref<string | number | null>(initial)
	const onChange = vi.fn()
	const onSearch = vi.fn()
	const utils = render({
		components: { BaseAutocomplete },
		setup: () => ({ model, props, onChange, onSearch, options: CITIES }),
		template:
			'<BaseAutocomplete v-model="model" :options="options" v-bind="props" aria-label="Город" @change="onChange" @search="onSearch" />',
	})
	return { ...utils, model, onChange, onSearch, field: screen.getByRole('combobox', { name: 'Город' }) }
}

describe('BaseAutocomplete integration', () => {
	it('ввод фильтрует варианты, выделяет совпадение и объявляет число найденного', async () => {
		const user = userEvent.setup()
		const { field, onSearch } = renderModel()

		await user.type(field, 'ка')

		expect(field).toHaveAttribute('aria-expanded', 'true')
		expect(options().map(option => option.textContent?.trim())).toEqual(['Казань', 'Екатеринбург'])
		expect(document.querySelector('mark')?.textContent).toBe('Ка')
		expect(screen.getByRole('status')).toHaveTextContent('Найдено 2 результата')
		expect(onSearch).toHaveBeenLastCalledWith('ка')
	})

	it('клик по варианту выбирает его, по отключённому — нет', async () => {
		const user = userEvent.setup()
		const { field, model, onChange } = renderModel()

		await user.click(field)
		await user.click(options()[3])
		expect(model.value).toBeNull()
		await user.click(options()[2])

		expect(model.value).toBe('kzn')
		expect(onChange).toHaveBeenCalledWith('kzn')
		expect(field).toHaveValue('Казань')
		expect(field).toHaveAttribute('aria-expanded', 'false')
	})

	it('↓ открывает на выбранном, ↓/↑ пропускают отключённый вариант с переходом через край, Enter выбирает', async () => {
		const user = userEvent.setup()
		const { field, model } = renderModel('kzn')

		field.focus()
		await user.keyboard('{ArrowDown}')
		expect(field).toHaveAttribute('aria-activedescendant', options()[2].id)
		await user.keyboard('{ArrowDown}')
		expect(field).toHaveAttribute('aria-activedescendant', options()[4].id)
		await user.keyboard('{ArrowDown}')
		expect(field).toHaveAttribute('aria-activedescendant', options()[0].id)
		await user.keyboard('{ArrowUp}{Enter}')
		expect(model.value).toBe('ekb')
	})

	it('↑ открывает на последнем, Alt+↓ открывает без выбора, Alt+↑ закрывает, при открытом ↓ с Alt не двигает', async () => {
		const user = userEvent.setup()
		const { field } = renderModel()

		field.focus()
		await user.keyboard('{ArrowUp}')
		expect(field).toHaveAttribute('aria-activedescendant', options()[4].id)
		await user.keyboard('{Alt>}{ArrowUp}{/Alt}')
		expect(field).toHaveAttribute('aria-expanded', 'false')
		await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
		expect(field).toHaveAttribute('aria-expanded', 'true')
		expect(field).not.toHaveAttribute('aria-activedescendant')
		await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
		expect(field).not.toHaveAttribute('aria-activedescendant')
		await user.keyboard('{Tab}')
		expect(field).toHaveAttribute('aria-expanded', 'false')
	})

	it('в открытом списке без активного варианта ↓ выбирает первый доступный, ↑ — последний', async () => {
		const user = userEvent.setup()
		const { field } = renderModel()

		field.focus()
		await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
		expect(field).not.toHaveAttribute('aria-activedescendant')
		await user.keyboard('{ArrowDown}')
		expect(field).toHaveAttribute('aria-activedescendant', options()[0].id)

		await user.keyboard('{Alt>}{ArrowUp}{/Alt}{Alt>}{ArrowDown}{/Alt}')
		expect(field).not.toHaveAttribute('aria-activedescendant')
		await user.keyboard('{ArrowUp}')
		expect(field).toHaveAttribute('aria-activedescendant', options()[4].id)
	})

	it('Escape: открытый список закрывает (событие не уходит дальше), закрытый — очищает поле', async () => {
		const user = userEvent.setup()
		const { field, model } = renderModel('msk')

		field.focus()
		await user.keyboard('{ArrowDown}')
		const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
		field.dispatchEvent(escape)
		await nextTick()
		expect(escape.defaultPrevented).toBe(true)
		expect(field).toHaveAttribute('aria-expanded', 'false')
		expect(model.value).toBe('msk')

		await user.keyboard('{Escape}')
		expect(model.value).toBeNull()
		expect(field).toHaveValue('')
		await user.keyboard('{Escape}')
		expect(model.value).toBeNull()
	})

	it('без своего варианта: точная подпись выбирает, чужой текст возвращает выбранное, пустое поле очищает', async () => {
		const user = userEvent.setup()
		const { field, model } = renderModel('msk')

		await user.clear(field)
		await user.type(field, 'казань')
		await user.tab()
		expect(model.value).toBe('kzn')

		await user.clear(field)
		await user.type(field, 'Лондон')
		await user.tab()
		expect(model.value).toBe('kzn')
		expect(field).toHaveValue('Казань')

		await user.clear(field)
		await user.tab()
		expect(model.value).toBeNull()
	})

	it('свой вариант: текст становится значением по Enter; normalize может отклонить ввод', async () => {
		const user = userEvent.setup()
		const normalize = (text: string) => (text.length > 3 ? text.toUpperCase() : null)
		const { field, model } = renderModel(null, { isCustomAllowed: true, normalize })

		await user.type(field, 'Тверь{Enter}')
		expect(model.value).toBe('ТВЕРЬ')
		expect(field).toHaveValue('ТВЕРЬ')

		await user.clear(field)
		await user.type(field, 'Ош')
		await user.tab()
		expect(model.value).toBe('ТВЕРЬ')
	})

	it('свой вариант без normalize — текст без пробелов по краям', async () => {
		const user = userEvent.setup()
		const { field, model } = renderModel(null, { isCustomAllowed: true })

		await user.type(field, '  Тверь  ')
		await user.tab()

		expect(model.value).toBe('Тверь')
	})

	it('с сервера (isRemote) варианты не фильтруются; загрузка и пустой список', async () => {
		const user = userEvent.setup()
		const { field, rerender } = renderModel(null, { isRemote: true, isLoading: true })

		await user.type(field, 'zz')
		expect(options()).toHaveLength(5)
		expect(screen.getByRole('status')).toHaveTextContent('Загрузка')
		expect(document.querySelector('.base-autocomplete__empty')).toHaveTextContent('Загрузка')
		void rerender
	})

	it('ничего не найдено: текст в списке и в статусе; maxResults ограничивает список; своя фильтрация', async () => {
		const user = userEvent.setup()
		const first = renderModel(null, { maxResults: 2 })

		await user.click(first.field)
		expect(options()).toHaveLength(2)
		await user.type(first.field, 'Лондон')
		expect(document.querySelector('.base-autocomplete__empty')).toHaveTextContent('Ничего не найдено')
		expect(screen.getByRole('status')).toHaveTextContent('Ничего не найдено')
		first.unmount()

		const second = renderModel(null, { filter: (option: AutocompleteOption, query: string) => option.value === query })
		await user.type(second.field, 'spb')
		expect(options().map(option => option.textContent?.trim())).toEqual(['Санкт-ПетербургСеверная столица'])
	})

	it('активный вариант под указателем; при сужении списка активный сбрасывается', async () => {
		const user = userEvent.setup()
		const { field } = renderModel()

		await user.click(field)
		await user.hover(options()[4])
		expect(field).toHaveAttribute('aria-activedescendant', options()[4].id)
		await user.type(field, 'мос')
		expect(field).not.toHaveAttribute('aria-activedescendant')
	})

	it('клавиши без списка вариантов не открывают пустоту и не ломаются', async () => {
		const user = userEvent.setup()
		const model = ref<string | number | null>(null)
		render({
			components: { BaseAutocomplete },
			setup: () => ({ model }),
			template: '<BaseAutocomplete v-model="model" :options="[]" aria-label="Пусто" />',
		})
		const field = screen.getByRole('combobox', { name: 'Пусто' })

		field.focus()
		await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Enter}')
		expect(field).not.toHaveAttribute('aria-activedescendant')
	})

	it('отключённое поле и поле только для чтения не открывают список', async () => {
		const user = userEvent.setup()
		const readonly = renderModel('msk', { isReadonly: true })
		await user.click(readonly.field)
		readonly.field.focus()
		await user.keyboard('{ArrowDown}')
		expect(readonly.field).toHaveAttribute('aria-expanded', 'false')
		readonly.unmount()

		render({
			components: { BaseForm, BaseAutocomplete },
			setup: () => ({ options: CITIES }),
			template: '<BaseForm is-disabled><BaseAutocomplete :options="options" aria-label="Город" /></BaseForm>',
		})
		expect(screen.getByRole('combobox', { name: 'Город' })).toBeDisabled()
	})

	it('варианты загрузились после значения — поле показывает подпись; методы через ref', async () => {
		const list = ref<AutocompleteOption[]>([])
		const autocompleteRef = ref<InstanceType<typeof BaseAutocomplete> | null>(null)
		const onFocus = vi.fn()
		render({
			components: { BaseAutocomplete },
			setup: () => ({ list, autocompleteRef, onFocus }),
			template:
				'<BaseAutocomplete ref="autocompleteRef" model-value="msk" :options="list" aria-label="Город" is-required @focus="onFocus" />',
		})
		const field = screen.getByRole('combobox', { name: 'Город' })
		expect(field).toHaveValue('msk')

		list.value = CITIES
		await waitFor(() => expect(field).toHaveValue('Москва'))
		autocompleteRef.value!.focus()
		expect(field).toHaveFocus()
		expect(onFocus).toHaveBeenCalled()
		autocompleteRef.value!.blur()
		expect(autocompleteRef.value!.validate()).toBe(true)
		autocompleteRef.value!.reset()
	})

	it('варианты с сервера сузились — активный вариант за пределами списка сбрасывается', async () => {
		const user = userEvent.setup()
		const list = ref<AutocompleteOption[]>(CITIES)
		render({
			components: { BaseAutocomplete },
			setup: () => ({ list }),
			template: '<BaseAutocomplete :model-value="null" :options="list" is-remote aria-label="Город" />',
		})
		const field = screen.getByRole('combobox', { name: 'Город' })

		field.focus()
		await user.keyboard('{ArrowUp}')
		expect(field).toHaveAttribute('aria-activedescendant')
		list.value = CITIES.slice(0, 2)
		await nextTick()

		expect(field).not.toHaveAttribute('aria-activedescendant')
	})

	it('повторный выбор того же варианта не шлёт change; клик вне поля закрывает список', async () => {
		const user = userEvent.setup()
		const { field, onChange } = renderModel('kzn')

		await user.click(field)
		await user.click(options()[2])
		expect(onChange).not.toHaveBeenCalled()

		await user.click(field)
		expect(field).toHaveAttribute('aria-expanded', 'true')
		await user.click(document.body)
		expect(field).toHaveAttribute('aria-expanded', 'false')
	})
})
