import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { REGIONS } from './cascaderFixtures'
import { UI_TEXT } from '@/locales/messages'
import { createUiKitPlugin } from '@/plugin'
import BaseCascader from '../ui/BaseCascader.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { BaseFormField } from '@components/BaseFormField'

describe('BaseCascader unit', () => {
	describe('поле', () => {
		it('combobox называется подписью и закрыт', () => {
			render(BaseCascader, { props: { items: REGIONS, label: 'Регион' } })
			const field = screen.getByRole('combobox', { name: 'Регион' })
			expect(field).toHaveAttribute('aria-haspopup', 'listbox')
			expect(field).toHaveAttribute('aria-expanded', 'false')
			expect(field).not.toHaveAttribute('aria-controls')
			expect(field).toHaveAttribute('tabindex', '0')
		})

		it('без подписи имя — ariaLabel, затем подсказка, затем «Выберите...»', () => {
			const { rerender } = render(BaseCascader, { props: { items: REGIONS, ariaLabel: 'Город' } })
			expect(screen.getByRole('combobox', { name: 'Город' })).toBeInTheDocument()
			rerender({ items: REGIONS, ariaLabel: undefined, placeholder: 'Куда' })
			return nextTick().then(() => {
				expect(screen.getByRole('combobox', { name: 'Куда' })).toHaveTextContent('Куда')
			})
		})

		it('пустое значение — подсказка по умолчанию', () => {
			render(BaseCascader, { props: { items: REGIONS } })
			expect(screen.getByRole('combobox', { name: UI_TEXT.SELECT_PLACEHOLDER })).toHaveTextContent(UI_TEXT.SELECT_PLACEHOLDER)
		})

		it('щелчок по подписи переводит фокус на поле', async () => {
			const user = userEvent.setup()
			render(BaseCascader, { props: { items: REGIONS, label: 'Регион' } })
			await user.click(screen.getByText('Регион'))
			expect(screen.getByRole('combobox')).toHaveFocus()
		})

		it('ошибка связана с полем и помечает его невалидным', () => {
			render(BaseCascader, { props: { items: REGIONS, label: 'Регион', error: 'Выберите район' } })
			const field = screen.getByRole('combobox', { name: 'Регион' })
			expect(field).toHaveAccessibleDescription('Выберите район')
			expect(field).toHaveAttribute('aria-invalid', 'true')
		})

		it('без ошибки нет aria-invalid и aria-describedby', () => {
			render(BaseCascader, { props: { items: REGIONS, label: 'Регион' } })
			const field = screen.getByRole('combobox')
			expect(field).not.toHaveAttribute('aria-invalid')
			expect(field).not.toHaveAttribute('aria-describedby')
		})

		it('обязательное поле — aria-required и звёздочка', () => {
			const { container } = render(BaseCascader, { props: { items: REGIONS, label: 'Регион', isRequired: true } })
			expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true')
			expect(container.querySelector('.base-cascader__required')).toBeInTheDocument()
		})

		it('triggerAttrs: свой id, data-атрибут и описание вдобавок к ошибке', () => {
			render(BaseCascader, {
				props: {
					items: REGIONS,
					label: 'Регион',
					error: 'Ошибка',
					triggerAttrs: { id: 'region', 'data-qa': 'region', 'aria-describedby': 'hint' },
				},
			})
			const field = screen.getByRole('combobox')
			expect(field).toHaveAttribute('id', 'region')
			expect(field).toHaveAttribute('data-qa', 'region')
			expect(field.getAttribute('aria-describedby')).toMatch(/-error hint$/)
		})

		it('isDisabled: aria-disabled, не в порядке Tab, щелчок и клавиши не открывают', async () => {
			const user = userEvent.setup()
			render(BaseCascader, { props: { items: REGIONS, label: 'Регион', isDisabled: true } })
			const field = screen.getByRole('combobox')
			expect(field).toHaveAttribute('aria-disabled', 'true')
			expect(field).not.toHaveAttribute('tabindex')
			await user.click(field)
			field.focus()
			await user.keyboard('{ArrowDown}')
			expect(field).toHaveAttribute('aria-expanded', 'false')
		})

		it('isDisabled: щелчок по подписи не переводит фокус', async () => {
			const user = userEvent.setup()
			render(BaseCascader, { props: { items: REGIONS, label: 'Регион', isDisabled: true } })
			await user.click(screen.getByText('Регион'))
			expect(screen.getByRole('combobox')).not.toHaveFocus()
		})

		it('isLoading: aria-busy на поле', () => {
			render(BaseCascader, { props: { items: [], label: 'Регион', isLoading: true } })
			expect(screen.getByRole('combobox')).toHaveAttribute('aria-busy', 'true')
		})
	})

	describe('значение', () => {
		it('показывает путь подписями через разделитель', () => {
			render(BaseCascader, { props: { items: REGIONS, label: 'Регион', modelValue: ['ru', 'msk', 'tverskoy'] } })
			expect(screen.getByRole('combobox')).toHaveTextContent('Россия / Москва / Тверской')
		})

		it('свой разделитель', () => {
			render(BaseCascader, { props: { items: REGIONS, label: 'Регион', modelValue: ['ru', 'spb'], separator: ' → ' } })
			expect(screen.getByRole('combobox')).toHaveTextContent('Россия → Санкт-Петербург')
		})

		it('неизвестный (ещё не загруженный) id показывается как есть', () => {
			render(BaseCascader, { props: { items: REGIONS, label: 'Регион', modelValue: ['ru', 'kazan'] } })
			expect(screen.getByRole('combobox')).toHaveTextContent('Россия / kazan')
		})

		it('без isMultiple из списка путей берётся первый непустой', () => {
			render(BaseCascader, { props: { items: REGIONS, label: 'Регион', modelValue: [[], ['kz', 'almaty'], ['am']] } })
			expect(screen.getByRole('combobox')).toHaveTextContent('Казахстан / Алматы')
		})

		it('слот selected получает путь, подписи и узлы', () => {
			render(BaseCascader, {
				props: { items: REGIONS, label: 'Регион', modelValue: ['kz', 'nope'] },
				slots: {
					selected: `<template #selected="{ path, labels, nodes }"><b>{{ path.join(',') }}|{{ labels.join(',') }}|{{ nodes.map(node => node ? node.id : '-').join(',') }}</b></template>`,
				},
			})
			expect(screen.getByRole('combobox')).toHaveTextContent('kz,nope|Казахстан,nope|kz,-')
		})

		it('isMultiple: пути — метками; плоский путь — одна метка', () => {
			const { rerender } = render(BaseCascader, {
				props: { items: REGIONS, label: 'Регион', isMultiple: true, modelValue: [['ru', 'spb', 'nevsky'], ['am']] },
			})
			expect(screen.getByText('Россия / Санкт-Петербург / Невский')).toBeInTheDocument()
			expect(screen.getByText('Армения')).toBeInTheDocument()
			rerender({ items: REGIONS, label: 'Регион', isMultiple: true, modelValue: ['kz', 'almaty'] })
			return nextTick().then(() => expect(screen.getByText('Казахстан / Алматы')).toBeInTheDocument())
		})

		it('isMultiple: крестик метки убирает путь и не открывает панель', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseCascader, {
				props: { items: REGIONS, label: 'Регион', isMultiple: true, modelValue: [['ru', 'spb', 'nevsky'], ['am']] },
			})
			await user.click(screen.getByRole('button', { name: `${UI_TEXT.DELETE} Армения` }))
			expect(emitted()['update:modelValue']).toEqual([[[['ru', 'spb', 'nevsky']]]])
			expect(emitted().change).toEqual([[[['ru', 'spb', 'nevsky']]]])
			expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
		})

		it('isMultiple + isDisabled: меток без крестиков', () => {
			render(BaseCascader, { props: { items: REGIONS, label: 'Регион', isMultiple: true, isDisabled: true, modelValue: [['am']] } })
			expect(screen.queryByRole('button')).not.toBeInTheDocument()
		})
	})

	describe('оформление', () => {
		it('модификатор варианта, кроме default', () => {
			const { container, rerender } = render(BaseCascader, { props: { items: REGIONS } })
			expect(container.querySelector('.base-cascader')?.className).not.toContain('base-cascader--default')
			rerender({ items: REGIONS, variant: 'underline' })
			return nextTick().then(() => expect(container.querySelector('.base-cascader')).toHaveClass('base-cascader--underline'))
		})

		it('--size-scale только при масштабе не 100', () => {
			const { container } = render(BaseCascader, { props: { items: REGIONS, sizeScale: 125 } })
			expect((container.querySelector('.base-cascader') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
		})

		it('customClass — к корню и полю', () => {
			const { container } = render(BaseCascader, {
				props: { items: REGIONS, customClass: { root: 'my-root', trigger: 'my-trigger' } },
			})
			expect(container.querySelector('.base-cascader')).toHaveClass('my-root')
			expect(screen.getByRole('combobox')).toHaveClass('my-trigger')
		})

		it('берёт разделитель из createUiKitPlugin({ defaults })', () => {
			render(BaseCascader, {
				props: { items: REGIONS, label: 'Регион', modelValue: ['ru', 'msk'] },
				global: { plugins: [createUiKitPlugin({ defaults: { BaseCascader: { separator: ' » ' } } })] },
			})
			expect(screen.getByRole('combobox')).toHaveTextContent('Россия » Москва')
		})
	})

	describe('методы', () => {
		it('focus, blur, validate, reset', async () => {
			const wrapper = mount(BaseCascader, { props: { items: REGIONS, label: 'Регион', isRequired: true }, attachTo: document.body })
			const field = wrapper.find('[role="combobox"]').element as HTMLElement
			wrapper.vm.focus()
			expect(field).toHaveFocus()
			wrapper.vm.blur()
			expect(field).not.toHaveFocus()
			expect(wrapper.vm.rootRef).toBe(field)
			expect(wrapper.vm.validate()).toBe(false)
			await nextTick()
			expect(wrapper.text()).toContain(UI_TEXT.REQUIRED_FIELD)
			wrapper.vm.reset()
			await nextTick()
			expect(wrapper.text()).not.toContain(UI_TEXT.REQUIRED_FIELD)
			wrapper.unmount()
		})

		it('validate с выбранным путём проходит', () => {
			const wrapper = mount(BaseCascader, { props: { items: REGIONS, isRequired: true, modelValue: ['am'] } })
			expect(wrapper.vm.validate()).toBe(true)
			wrapper.unmount()
		})
	})

	describe('BaseFormField', () => {
		it('имя — подпись обёртки, описание — через aria-describedby, обязательность — aria-required', async () => {
			render({
				components: { BaseCascader, BaseFormField },
				template: `
					<BaseFormField label="Район доставки" description="Только Москва" is-required>
						<BaseCascader :items="items" />
					</BaseFormField>
				`,
				setup: () => ({ items: REGIONS }),
			})
			await nextTick()
			const field = screen.getByRole('combobox', { name: 'Район доставки' })
			expect(field).toHaveAccessibleDescription('Только Москва')
			expect(field).toHaveAttribute('aria-required', 'true')
			await userEvent.setup().click(field)
			expect(await screen.findByRole('listbox', { name: 'Район доставки' })).toBeInTheDocument()
		})
	})
})
