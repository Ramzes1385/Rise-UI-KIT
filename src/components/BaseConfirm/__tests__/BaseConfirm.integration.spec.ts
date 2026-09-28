/**
 * Интеграция useConfirm() + BaseApp: окно открывается из кода, промис получает ответ пользователя.
 */

import '@testing-library/jest-dom/vitest'
import { defineComponent, h, ref } from 'vue'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'
import { BaseApp } from '@components/BaseApp'
import { getActiveOverlayStore, OVERLAY_DESTROY_DELAY } from '@composables/useOverlay'
import { useConfirm } from '../useConfirm'
import type { ConfirmOptions } from '../model/BaseConfirm.types'

/** Кнопка «Удалить», которая спрашивает подтверждение и показывает ответ */
function renderApp(options: ConfirmOptions) {
	const Page = defineComponent({
		setup() {
			const confirm = useConfirm()
			const answer = ref('нет ответа')
			async function remove() {
				answer.value = (await confirm(options)) ? 'удалено' : 'отменено'
			}
			return () => [h('button', { type: 'button', onClick: remove }, 'Удалить проект'), h('output', answer.value)]
		},
	})
	return render(defineComponent({ render: () => h(BaseApp, null, () => h(Page)) }))
}

describe('useConfirm в BaseApp', () => {
	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	it('подтверждение разрешает промис true, фокус возвращается на кнопку', async () => {
		renderApp({ title: 'Удалить проект?', description: 'Это необратимо.', confirmLabel: 'Удалить', isDanger: true })
		const trigger = screen.getByRole('button', { name: 'Удалить проект' })
		trigger.focus()

		await fireEvent.click(trigger)
		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить проект?' })
		expect(dialog).toHaveAccessibleDescription('Это необратимо.')
		await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Отмена' })).toHaveFocus())

		await fireEvent.click(within(dialog).getByRole('button', { name: 'Удалить' }))

		expect(await screen.findByText('удалено')).toBeInTheDocument()
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
		expect(trigger).toHaveFocus()
	})

	it('Escape разрешает промис false', async () => {
		renderApp({ title: 'Удалить проект?' })

		await fireEvent.click(screen.getByRole('button', { name: 'Удалить проект' }))
		await screen.findByRole('alertdialog', { name: 'Удалить проект?' })
		await fireEvent.keyDown(document, { key: 'Escape' })

		expect(await screen.findByText('отменено')).toBeInTheDocument()
	})

	it('закрытое окно удаляется из BaseApp и открывается заново', async () => {
		vi.useFakeTimers()
		renderApp({ title: 'Удалить проект?' })
		const trigger = screen.getByRole('button', { name: 'Удалить проект' })

		await fireEvent.click(trigger)
		await fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))
		expect(getActiveOverlayStore()?.entries.value).toHaveLength(1)

		// В тестах анимация отключена и after-leave не приходит — окно удаляет запасной таймер
		await vi.advanceTimersByTimeAsync(OVERLAY_DESTROY_DELAY)
		expect(getActiveOverlayStore()?.entries.value).toHaveLength(0)

		await fireEvent.click(trigger)
		expect(screen.getByRole('alertdialog', { name: 'Удалить проект?' })).toBeInTheDocument()
	})

	it('без BaseApp предупреждает и отвечает false', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		let confirm!: ReturnType<typeof useConfirm>
		render(
			defineComponent({
				setup() {
					confirm = useConfirm()
					return () => null
				},
			}),
		)

		await expect(confirm({ title: 'Удалить?' })).resolves.toBe(false)
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('не найден <BaseApp>'))
	})
})
