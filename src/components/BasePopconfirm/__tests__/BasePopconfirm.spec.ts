import '@testing-library/jest-dom/vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { fireEvent, render, screen, within } from '@testing-library/vue'
import BasePopconfirm from '../ui/BasePopconfirm.vue'

function renderConfirm(props: Record<string, unknown> = {}) {
	const utils = render(BasePopconfirm, {
		props: { title: 'Снять серию с публикации?', ...props },
		slots: { default: () => h('button', { type: 'button' }, 'Снять') },
	})
	return { ...utils, trigger: screen.getByRole('button', { name: 'Снять' }) }
}

async function open(trigger: HTMLElement): Promise<HTMLElement> {
	await fireEvent.click(trigger)
	await nextTick()
	return screen.getByRole('alertdialog')
}

describe('BasePopconfirm', () => {
	it('кнопка получает ARIA, диалог — имя и описание, фокус на подтверждении', async () => {
		const { trigger } = renderConfirm({ description: 'Подписчики перестанут её видеть.' })
		expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
		expect(trigger).toHaveAttribute('aria-expanded', 'false')

		const dialog = await open(trigger)
		expect(trigger).toHaveAttribute('aria-expanded', 'true')
		expect(trigger).toHaveAttribute('aria-controls', dialog.id)
		expect(dialog).toHaveAccessibleName('Снять серию с публикации?')
		expect(dialog).toHaveAccessibleDescription('Подписчики перестанут её видеть.')
		expect(within(dialog).getByRole('button', { name: 'Подтвердить' })).toHaveFocus()
	})

	it('подтверждение эмитит confirm, закрывает и возвращает фокус на кнопку', async () => {
		const { trigger, emitted } = renderConfirm({ confirmLabel: 'Снять с публикации', cancelLabel: 'Оставить' })
		const dialog = await open(trigger)
		await fireEvent.click(within(dialog).getByRole('button', { name: 'Снять с публикации' }))

		expect(emitted('confirm')).toHaveLength(1)
		expect(emitted('update:isOpen')).toEqual([[true], [false]])
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
		expect(trigger).toHaveFocus()
	})

	it('isDanger: значок предупреждения и фокус на «Отмене»; «Отмена» эмитит cancel', async () => {
		const { trigger, emitted } = renderConfirm({ isDanger: true })
		const dialog = await open(trigger)
		expect(dialog.querySelector('.base-popconfirm__icon')).toBeInTheDocument()
		const cancel = within(dialog).getByRole('button', { name: 'Отмена' })
		expect(cancel).toHaveFocus()

		await fireEvent.click(cancel)
		expect(emitted('cancel')).toHaveLength(1)
		expect(emitted('confirm')).toBeUndefined()
	})

	it('повторный клик по кнопке, Escape и клик снаружи — отмена', async () => {
		const { trigger, emitted } = renderConfirm()
		await open(trigger)
		await fireEvent.click(trigger)
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

		await open(trigger)
		document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
		await nextTick()
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

		await open(trigger)
		await fireEvent.mouseDown(document.body)
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
		expect(emitted('cancel')).toHaveLength(3)
	})

	it('Tab и Shift+Tab ходят между кнопками по кругу; другие клавиши не трогает', async () => {
		const { trigger } = renderConfirm()
		const dialog = await open(trigger)
		const [cancel, confirm] = within(dialog).getAllByRole('button')

		await fireEvent.keyDown(dialog, { key: 'Tab' })
		expect(cancel).toHaveFocus()
		await fireEvent.keyDown(dialog, { key: 'Tab' })
		expect(confirm).toHaveFocus()
		await fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
		expect(cancel).toHaveFocus()
		await fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
		expect(confirm).toHaveFocus()

		// Фокус вне кнопок (например, после клика по тексту): Shift+Tab — на последнюю, Tab — на первую
		confirm.blur()
		await fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
		expect(confirm).toHaveFocus()
		confirm.blur()
		await fireEvent.keyDown(dialog, { key: 'Tab' })
		expect(cancel).toHaveFocus()
		await fireEvent.keyDown(dialog, { key: 'Enter' })
		expect(screen.getByRole('alertdialog')).toBeInTheDocument()
	})

	it('isOpen управляет вопросом снаружи', async () => {
		const isOpen = ref(true)
		render(
			defineComponent({
				setup: () => () =>
					h(
						BasePopconfirm,
						{ title: 'Удалить?', isOpen: isOpen.value, 'onUpdate:isOpen': (value: boolean) => (isOpen.value = value) },
						{ default: () => h('button', { type: 'button' }, 'Удалить') },
					),
			}),
		)
		expect(screen.getByRole('alertdialog')).toBeInTheDocument()
		isOpen.value = false
		await nextTick()
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
	})
})
