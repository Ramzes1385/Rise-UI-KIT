import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseSwitch from '../ui/BaseSwitch.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { BaseFormField } from '@components/BaseFormField'

describe('BaseSwitch: описание, имя и контекст поля', () => {
	it('описание из слота default не входит в имя и связано через aria-describedby', () => {
		render(BaseSwitch, {
			props: { label: 'Тёмная тема' },
			slots: { default: 'Применится ко всем устройствам' },
		})

		const control = screen.getByRole('switch', { name: 'Тёмная тема' })
		expect(control).toHaveAccessibleDescription('Применится ко всем устройствам')
	})

	it('слот label тоже считается подписью: default уходит в описание', () => {
		render(BaseSwitch, {
			slots: { label: '<strong>Звук</strong>', default: 'Сигнал о новых сообщениях' },
		})

		expect(screen.getByRole('switch', { name: 'Звук' })).toHaveAccessibleDescription('Сигнал о новых сообщениях')
	})

	it('клик по описанию переключает', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseSwitch, {
			props: { label: 'Тёмная тема', modelValue: false },
			slots: { default: '<span data-testid="description">Описание</span>' },
		})

		await user.click(screen.getByTestId('description'))

		expect(emitted('update:modelValue')).toEqual([[true]])
	})

	it('клик по подписи переключает один раз', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseSwitch, { props: { label: 'Тёмная тема', modelValue: false } })

		await user.click(screen.getByText('Тёмная тема'))

		expect(emitted('update:modelValue')).toEqual([[true]])
	})

	it('клик по ссылке внутри описания не переключает', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseSwitch, {
			props: { label: 'Аналитика', modelValue: false },
			slots: { default: '<a href="#policy" @click.prevent>Политика</a>' },
		})

		await user.click(screen.getByRole('link', { name: 'Политика' }))

		expect(emitted('update:modelValue')).toBeUndefined()
	})

	it('отключённый переключатель не меняется по клику на описание', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseSwitch, {
			props: { label: 'Тёмная тема', isDisabled: true },
			slots: { default: '<span data-testid="description">Описание</span>' },
		})

		await user.click(screen.getByTestId('description'))

		expect(emitted('update:modelValue')).toBeUndefined()
	})

	it('без label и слота label содержимое default — подпись, описания нет', () => {
		const { container } = render(BaseSwitch, { slots: { default: 'Автосохранение' } })

		const control = screen.getByRole('switch', { name: 'Автосохранение' })
		expect(control).not.toHaveAttribute('aria-describedby')
		expect(container.querySelector('.base-switch__description')).toBeNull()
	})

	it('ariaLabel и inputAttrs: имя без подписи, свой id и name, внешнее описание', () => {
		const { container } = render({
			components: { BaseSwitch },
			template: `
				<p id="hint">Влияет на расход батареи</p>
				<BaseSwitch aria-label="Геолокация" :input-attrs="{ id: 'geo', name: 'geo', 'aria-describedby': 'hint' }" />
			`,
		})

		const control = screen.getByRole('switch', { name: 'Геолокация' })
		expect(control).toHaveAttribute('id', 'geo')
		expect(control).toHaveAttribute('name', 'geo')
		expect(control).toHaveAccessibleDescription('Влияет на расход батареи')
		expect(container.querySelector('.base-switch__caption')).toBeNull()
	})

	it('без своей подписи внутри BaseFormField называется её подписью, берёт описание и обязательность', async () => {
		render({
			components: { BaseSwitch, BaseFormField },
			template: `
				<BaseFormField label="Уведомления" description="Только важные" is-required>
					<BaseSwitch />
				</BaseFormField>
			`,
		})
		await nextTick()

		const control = screen.getByRole('switch', { name: 'Уведомления' })
		expect(control).toHaveAccessibleDescription('Только важные')
		expect(control).toHaveAttribute('aria-required', 'true')
	})

	it('со своей подписью внутри BaseFormField: ошибку обёртки описывает группа, переключатель — только своим описанием', async () => {
		const { container } = render({
			components: { BaseSwitch, BaseFormField },
			template: `
				<BaseFormField label="Конфиденциальность" error="Нужно согласие">
					<BaseSwitch label="Делиться статистикой">Анонимно</BaseSwitch>
				</BaseFormField>
			`,
		})
		await nextTick()

		expect(screen.getByRole('group', { name: 'Конфиденциальность' })).toHaveAccessibleDescription('Нужно согласие')
		const control = screen.getByRole('switch', { name: 'Делиться статистикой' })
		expect(control).not.toHaveAttribute('aria-invalid')
		expect(control).toHaveAccessibleDescription('Анонимно')
		expect(container.querySelector('.base-switch')).toHaveClass('base-switch--error')
	})

	it('подпись в слоте, появившаяся позже, освобождает обёртку', async () => {
		const wrapper = mount(
			{
				components: { BaseSwitch, BaseFormField },
				props: { isLabelShown: Boolean },
				template: `
					<BaseFormField label="Уведомления">
						<BaseSwitch><template v-if="isLabelShown" #label>Почта</template></BaseSwitch>
					</BaseFormField>
				`,
			},
			{ attachTo: document.body },
		)
		await nextTick()

		const input = wrapper.find('input')
		expect(wrapper.find('label.base-form-field__label').attributes('for')).toBe(input.attributes('id'))

		await wrapper.setProps({ isLabelShown: true })
		expect(wrapper.find('.base-switch__caption').text()).toBe('Почта')
		expect(wrapper.find('label.base-form-field__label').attributes('for')).toBeUndefined()
		expect(wrapper.find('[role="group"]').exists()).toBe(true)
		wrapper.unmount()
	})

	it('focus и blur из defineExpose переводят фокус на input и снимают его', () => {
		const wrapper = mount(BaseSwitch, { props: { label: 'Фокус' }, attachTo: document.body })
		const input = wrapper.find('input').element

		wrapper.vm.focus()
		expect(document.activeElement).toBe(input)
		wrapper.vm.blur()
		expect(document.activeElement).not.toBe(input)
		wrapper.unmount()
	})

	it('change без поля в target не эмитит значение', () => {
		const wrapper = mount(BaseSwitch, { props: { label: 'Событие' } })
		const event = new Event('change')
		Object.defineProperty(event, 'target', { value: null })
		wrapper.find('input').element.dispatchEvent(event)
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
	})

	it('обязательный переключатель проверяет значение через validate', () => {
		const wrapper = mount(BaseSwitch, { props: { label: 'Согласие', isRequired: true, modelValue: true } })
		expect(wrapper.vm.validate()).toBe(true)
	})
})
