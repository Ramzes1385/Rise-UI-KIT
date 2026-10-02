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

	it('со своей подписью внутри BaseFormField: обёртка — группа, ошибка обёртки описывает переключатель', async () => {
		const { container } = render({
			components: { BaseSwitch, BaseFormField },
			template: `
				<BaseFormField label="Конфиденциальность" error="Нужно согласие">
					<BaseSwitch label="Делиться статистикой">Анонимно</BaseSwitch>
				</BaseFormField>
			`,
		})
		await nextTick()

		expect(screen.getByRole('group', { name: 'Конфиденциальность' })).toBeInTheDocument()
		const control = screen.getByRole('switch', { name: 'Делиться статистикой' })
		expect(control).toHaveAttribute('aria-invalid', 'true')
		expect(control).toHaveAccessibleDescription('Анонимно Нужно согласие')
		expect(container.querySelector('.base-switch')).toHaveClass('base-switch--error')
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
})
