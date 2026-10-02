import '@testing-library/jest-dom/vitest'
import BaseSlideover from '../ui/BaseSlideover.vue'
import userEvent from '@testing-library/user-event'
import { defineComponent, nextTick, ref } from 'vue'
import { render, screen } from '@testing-library/vue'

function renderNonModalHost(props: Record<string, unknown> = {}) {
	const onClose = vi.fn()
	const onPageClick = vi.fn()
	const Host = defineComponent({
		components: { BaseSlideover },
		setup() {
			const isOpen = ref(false)
			return { isOpen, props, onClose, onPageClick }
		},
		template: `
			<div>
				<button type="button" @click="isOpen = true">Свойства</button>
				<button type="button" @click="onPageClick">Кнопка страницы</button>
				<BaseSlideover v-model:is-open="isOpen" title="Свойства слоя" :has-overlay="false" v-bind="props" @close="onClose">
					<input aria-label="Ширина" />
				</BaseSlideover>
			</div>
		`,
	})
	return { ...render(Host), onClose, onPageClick }
}

describe('BaseSlideover: hasOverlay=false — немодальная панель (APG Dialog, non-modal)', () => {
	beforeEach(() => {
		document.body.style.overflow = ''
	})

	it('панель без aria-modal, фокус не переносится, прокрутка страницы не блокируется', async () => {
		const user = userEvent.setup()
		renderNonModalHost()
		const trigger = screen.getByRole('button', { name: 'Свойства' })

		await user.click(trigger)
		await nextTick()

		const dialog = screen.getByRole('dialog', { name: 'Свойства слоя' })
		expect(dialog).not.toHaveAttribute('aria-modal')
		expect(trigger).toHaveFocus()
		expect(document.body.style.overflow).not.toBe('hidden')
		expect(document.querySelector('.base-slideover')).toHaveClass('base-slideover--no-overlay')
	})

	it('Tab уходит из панели на страницу и обратно: ловушки фокуса нет', async () => {
		const user = userEvent.setup()
		renderNonModalHost()
		await user.click(screen.getByRole('button', { name: 'Свойства' }))
		const input = screen.getByRole('textbox', { name: 'Ширина' })
		input.focus()

		await user.tab()

		expect(screen.getByRole('dialog')).not.toContainElement(document.activeElement as HTMLElement)
	})

	it('Escape при фокусе вне панели её не закрывает', async () => {
		const user = userEvent.setup()
		const { onClose } = renderNonModalHost()
		await user.click(screen.getByRole('button', { name: 'Свойства' }))
		screen.getByRole('button', { name: 'Кнопка страницы' }).focus()

		await user.keyboard('{Escape}')

		expect(onClose).not.toHaveBeenCalled()
		expect(screen.getByRole('dialog')).toBeInTheDocument()
	})

	it('Escape при фокусе в панели закрывает её', async () => {
		const user = userEvent.setup()
		const { onClose } = renderNonModalHost()
		await user.click(screen.getByRole('button', { name: 'Свойства' }))
		screen.getByRole('textbox', { name: 'Ширина' }).focus()

		await user.keyboard('{Escape}')

		expect(onClose).toHaveBeenCalledOnce()
	})

	it('closeOnEscape=false: Escape в панели её не закрывает', async () => {
		const user = userEvent.setup()
		const { onClose } = renderNonModalHost({ closeOnEscape: false })
		await user.click(screen.getByRole('button', { name: 'Свойства' }))
		screen.getByRole('textbox', { name: 'Ширина' }).focus()

		await user.keyboard('{Escape}')

		expect(onClose).not.toHaveBeenCalled()
	})

	it('клик по странице под панелью доходит до страницы и панель не закрывает', async () => {
		const user = userEvent.setup()
		const { onClose, onPageClick } = renderNonModalHost()
		await user.click(screen.getByRole('button', { name: 'Свойства' }))

		await user.click(screen.getByRole('button', { name: 'Кнопка страницы' }))

		expect(onPageClick).toHaveBeenCalledOnce()
		expect(onClose).not.toHaveBeenCalled()
	})

	it('hasOverlay=true: панель модальная — aria-modal и блокировка прокрутки', async () => {
		const user = userEvent.setup()
		renderNonModalHost({ hasOverlay: true })
		await user.click(screen.getByRole('button', { name: 'Свойства' }))
		await nextTick()

		expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
		expect(document.body.style.overflow).toBe('hidden')
	})
})
