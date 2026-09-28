import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { BaseForm } from '@components/BaseForm'
import BaseInplace from '../ui/BaseInplace.vue'

function renderModel(initial = 'Альфа', props: Record<string, unknown> = {}) {
	const model = ref(initial)
	const onSave = vi.fn()
	const onCancel = vi.fn()
	const inplaceRef = ref<InstanceType<typeof BaseInplace> | null>(null)
	const utils = render({
		components: { BaseInplace },
		setup: () => ({ model, props, onSave, onCancel, inplaceRef }),
		template: '<BaseInplace ref="inplaceRef" v-model="model" label="Проект" v-bind="props" @save="onSave" @cancel="onCancel" />',
	})
	return { ...utils, model, onSave, onCancel, inplaceRef }
}

describe('BaseInplace integration', () => {
	it('клик открывает поле с выделенным текстом, Enter сохраняет без пробелов по краям, фокус — на кнопку', async () => {
		const user = userEvent.setup()
		const { model, onSave } = renderModel()

		await user.click(screen.getByRole('button', { name: 'Проект: Альфа' }))
		const field = screen.getByRole('textbox', { name: 'Проект' }) as HTMLInputElement
		expect(field).toHaveFocus()
		expect(field.selectionStart).toBe(0)
		expect(field.selectionEnd).toBe(5)
		await user.keyboard('  Бета  {Enter}')

		expect(model.value).toBe('Бета')
		expect(onSave).toHaveBeenCalledWith('Бета')
		await waitFor(() => expect(screen.getByRole('button', { name: 'Проект: Бета' })).toHaveFocus())
	})

	it('Escape отменяет правку; сохранение без изменений не меняет v-model, но сообщает save', async () => {
		const user = userEvent.setup()
		const { model, onSave, onCancel } = renderModel()

		await user.click(screen.getByRole('button', { name: 'Проект: Альфа' }))
		await user.keyboard('Гамма{Escape}')
		expect(onCancel).toHaveBeenCalledTimes(1)
		expect(model.value).toBe('Альфа')

		await user.click(screen.getByRole('button', { name: 'Проект: Альфа' }))
		await user.tab()
		expect(onSave).toHaveBeenCalledWith('Альфа')
		expect(model.value).toBe('Альфа')
	})

	it('выход из поля сохраняет; isSaveOnBlur=false — отменяет', async () => {
		const user = userEvent.setup()
		const saving = renderModel()
		await user.click(screen.getByRole('button', { name: 'Проект: Альфа' }))
		await user.keyboard('Дельта')
		await user.tab()
		expect(saving.model.value).toBe('Дельта')
		saving.unmount()

		const cancelling = renderModel('Альфа', { isSaveOnBlur: false })
		await user.click(screen.getByRole('button', { name: 'Проект: Альфа' }))
		await user.keyboard('Дельта')
		await user.tab()
		expect(cancelling.model.value).toBe('Альфа')
		expect(cancelling.onCancel).toHaveBeenCalled()
	})

	it('методы через ref: edit, save и cancel вне правки ничего не делают', async () => {
		const { inplaceRef, onSave, onCancel } = renderModel()

		await inplaceRef.value!.save()
		await inplaceRef.value!.cancel()
		expect(onSave).not.toHaveBeenCalled()
		expect(onCancel).not.toHaveBeenCalled()

		await inplaceRef.value!.edit()
		expect(screen.getByRole('textbox', { name: 'Проект' })).toHaveFocus()
		await inplaceRef.value!.cancel()
		expect(onCancel).toHaveBeenCalled()
	})

	it('отключённый и в отключённой форме — правка не открывается', async () => {
		const { inplaceRef } = renderModel('Альфа', { isDisabled: true })
		expect(screen.getByRole('button', { name: 'Проект: Альфа' })).toBeDisabled()
		await inplaceRef.value!.edit()
		expect(screen.queryByRole('textbox')).toBeNull()

		render({
			components: { BaseForm, BaseInplace },
			template: '<BaseForm is-disabled><BaseInplace model-value="Бета" label="Код" /></BaseForm>',
		})
		expect(screen.getByRole('button', { name: 'Код: Бета' })).toBeDisabled()
	})
})
