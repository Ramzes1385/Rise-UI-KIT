import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { BaseForm } from '@components/BaseForm'
import { BaseInput } from '@components/BaseInput'
import BaseFormField from '../ui/BaseFormField.vue'
import { BaseSelect } from '@components/BaseSelect'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { BaseCalendar } from '@components/BaseCalendar'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseTextarea } from '@components/BaseTextarea'
import { BaseDatePicker } from '@components/BaseDatePicker'
import type { StandardSchemaV1 } from '@utils/form/formUtils'

describe('BaseFormField integration', () => {
	it('должен рендерить label и error', () => {
		render(BaseFormField, {
			props: { label: 'Field Label', error: 'Error Message' },
		})

		expect(screen.getByText('Field Label')).toBeInTheDocument()
		expect(screen.getByText('Error Message')).toBeInTheDocument()
	})
})

describe('BaseFormField: контрол кита внутри', () => {
	it('подпись связана с BaseInput через for, описание обёртки описывает поле, группы нет', async () => {
		const { container } = render({
			components: { BaseFormField, BaseInput },
			template: `
				<BaseFormField label="E-mail" description="Пришлём чек" is-required>
					<BaseInput model-value="" />
				</BaseFormField>
			`,
		})
		await nextTick()

		const input = screen.getByRole('textbox', { name: 'E-mail' })
		expect(input).toHaveAccessibleDescription('Пришлём чек')
		expect(input).toHaveAttribute('aria-required', 'true')
		expect(container.querySelector('[role="group"]')).toBeNull()
		expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
	})

	it('ошибка обёртки: поле помечено aria-invalid, описано ошибкой и в цвете ошибки; свой текст ошибки поле не дублирует', async () => {
		const { container } = render({
			components: { BaseFormField, BaseInput },
			template: `
				<BaseFormField label="Телефон" error="Введите телефон">
					<BaseInput model-value="" />
				</BaseFormField>
			`,
		})
		await nextTick()

		const input = screen.getByRole('textbox', { name: 'Телефон' })
		expect(input).toHaveAttribute('aria-invalid', 'true')
		expect(input).toHaveAccessibleDescription('Введите телефон')
		expect(container.querySelector('.base-input')).toHaveClass('base-input--error')
		expect(screen.getAllByText('Введите телефон')).toHaveLength(1)
	})

	it('BaseTextarea: свой счётчик и описание обёртки вместе', async () => {
		render({
			components: { BaseFormField, BaseTextarea },
			template: `
				<BaseFormField label="Комментарий" description="Увидит только менеджер">
					<BaseTextarea model-value="Привет" :maxlength="100" />
				</BaseFormField>
			`,
		})
		await nextTick()

		expect(screen.getByRole('textbox', { name: 'Комментарий' })).toHaveAccessibleDescription('6/100 Увидит только менеджер')
	})

	it('BaseSelect назван подписью обёртки через aria-labelledby (for к div не применим)', async () => {
		const { container } = render({
			components: { BaseFormField, BaseSelect },
			setup: () => ({ options: [{ value: 'a', label: 'Активен' }] }),
			template: `
				<BaseFormField label="Статус" error="Выберите статус">
					<BaseSelect model-value="" :options="options" />
				</BaseFormField>
			`,
		})
		await nextTick()

		const combobox = screen.getByRole('combobox', { name: 'Статус' })
		expect(combobox).toHaveAttribute('aria-invalid', 'true')
		expect(combobox).toHaveAccessibleDescription('Выберите статус')
		expect(container.querySelector('label')).not.toHaveAttribute('for')
	})

	it('свой id поля (inputAttrs.id) — подпись обёртки связана с ним', async () => {
		render({
			components: { BaseFormField, BaseInput },
			template: `
				<BaseFormField label="Город">
					<BaseInput model-value="" :input-attrs="{ id: 'city', name: 'city' }" />
				</BaseFormField>
			`,
		})
		await nextTick()

		const input = screen.getByRole('textbox', { name: 'Город' })
		expect(input).toHaveAttribute('id', 'city')
		expect(input).toHaveAttribute('name', 'city')
	})

	it('BaseDatePicker: подпись обёртки называет поле даты', async () => {
		render({
			components: { BaseFormField, BaseDatePicker },
			template: '<BaseFormField label="Дата доставки"><BaseDatePicker /></BaseFormField>',
		})
		await nextTick()

		expect(screen.getByRole('textbox', { name: 'Дата доставки' })).toBeInTheDocument()
	})

	it('служебные поля составного компонента (время в BaseCalendar) не становятся полем обёртки', async () => {
		const { container } = render({
			components: { BaseFormField, BaseCalendar },
			template: `<BaseFormField label="Начало встречи"><BaseCalendar :time-config="{ showTime: true }" /></BaseFormField>`,
		})
		await nextTick()

		expect(container.querySelector('.base-calendar__time-input')).not.toBeNull()
		expect(container.querySelector('.base-form-field__label')).not.toHaveAttribute('for')
		expect(screen.getByRole('group', { name: 'Начало встречи' })).toBeInTheDocument()
	})

	it('без контрола кита и без for содержимое — группа с именем подписи', () => {
		render(BaseFormField, {
			props: { label: 'Адрес', description: 'Улица и дом' },
			slots: { default: '<input aria-label="Улица" />' },
		})

		expect(screen.getByRole('group', { name: 'Адрес' })).toHaveAccessibleDescription('Улица и дом')
	})

	it('флажок со своей подписью: ошибку несёт группа, только когда обёртка стала группой', async () => {
		render({
			components: { BaseCheckbox, BaseFormField, BaseInput },
			template: `
				<BaseFormField label="Почта" error="Подтвердите адрес">
					<BaseInput model-value="" />
					<BaseCheckbox label="Подписаться" />
				</BaseFormField>
			`,
		})
		await nextTick()

		expect(screen.queryByRole('group')).toBeNull()
		expect(screen.getByRole('textbox', { name: 'Почта' })).toHaveAccessibleDescription('Подтвердите адрес')
		const checkbox = screen.getByRole('checkbox', { name: 'Подписаться' })
		expect(checkbox).toHaveAttribute('aria-invalid', 'true')
		expect(checkbox).toHaveAccessibleDescription('Подтвердите адрес')
	})

	it('поле с name показывает ошибку проверки BaseForm по схеме', async () => {
		const user = userEvent.setup()
		const schema: StandardSchemaV1 = {
			'~standard': { version: 1, vendor: 'test', validate: () => ({ issues: [{ message: 'Введите имя', path: ['name'] }] }) },
		}
		render({
			components: { BaseForm, BaseFormField, BaseInput },
			setup: () => ({ schema, state: { name: '' } }),
			template: `
				<BaseForm :schema="schema" :state="state">
					<BaseFormField label="Имя" name="name"><BaseInput model-value="" /></BaseFormField>
					<button type="submit">Отправить</button>
				</BaseForm>
			`,
		})

		await user.click(screen.getByRole('button', { name: 'Отправить' }))

		expect(await screen.findByText('Введите имя')).toBeInTheDocument()
		expect(screen.getByRole('textbox', { name: 'Имя' })).toHaveAttribute('aria-invalid', 'true')
	})
})

describe('BaseFormField: реестр контролов', () => {
	it('подпись связывается с первым контролом; после его удаления содержимое — группа с именем из подписи', async () => {
		const { rerender } = render({
			components: { BaseFormField, BaseInput },
			props: { isFirst: { type: Boolean, default: true } },
			template: `
				<BaseFormField label="Город">
					<BaseInput v-if="isFirst" model-value="" />
					<BaseInput model-value="" aria-label="Улица" />
				</BaseFormField>
			`,
		})
		await nextTick()

		expect(screen.getByLabelText('Город')).toBe(screen.getAllByRole('textbox')[0])
		expect(screen.queryByRole('group')).toBeNull()
		await rerender({ isFirst: false })
		expect(screen.getByRole('group', { name: 'Город' })).toContainElement(screen.getByRole('textbox', { name: 'Улица' }))
	})
})
