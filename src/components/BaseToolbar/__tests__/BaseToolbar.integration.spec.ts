import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseToolbar from '../ui/BaseToolbar.vue'

const BUTTONS =
	'<button>A</button><button>B</button><input aria-label="Поле" /><input type="checkbox" aria-label="Флажок" /><button>C</button>'

function button(name: string): HTMLElement {
	return screen.getByRole('button', { name })
}

describe('BaseToolbar integration', () => {
	it('←/→ с переходом через край, Home/End; фокус запоминается как элемент в порядке Tab', async () => {
		const user = userEvent.setup()
		render(BaseToolbar, {
			props: { ariaLabel: 'Панель' },
			slots: { default: '<button>A</button><button>B</button><input type="checkbox" aria-label="Флажок" /><button>C</button>' },
		})

		await user.tab()
		expect(button('A')).toHaveFocus()
		await user.keyboard('{ArrowLeft}')
		expect(button('C')).toHaveFocus()
		await user.keyboard('{ArrowRight}')
		expect(button('A')).toHaveFocus()
		await user.keyboard('{ArrowRight}{ArrowRight}')
		expect(screen.getByRole('checkbox', { name: 'Флажок' })).toHaveFocus()
		await user.keyboard('{End}')
		expect(button('C')).toHaveFocus()
		await user.keyboard('{Home}')
		expect(button('A')).toHaveFocus()
		await user.keyboard('{ArrowRight}')
		await user.tab()
		await user.tab({ shift: true })
		expect(button('B')).toHaveFocus()
	})

	it('в текстовом поле стрелки не переводят фокус; другие клавиши не перехватываются', async () => {
		const user = userEvent.setup()
		render(BaseToolbar, { slots: { default: BUTTONS } })

		const field = screen.getByRole('textbox', { name: 'Поле' })
		await user.click(field)
		await user.keyboard('{ArrowRight}{Home}')
		expect(field).toHaveFocus()
		expect(field).toHaveAttribute('tabindex', '0')

		button('A').focus()
		const event = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true })
		button('A').dispatchEvent(event)
		expect(event.defaultPrevented).toBe(false)
	})

	it('вертикальная панель — ↑/↓; клавиши вне элементов панели не обрабатываются', async () => {
		const user = userEvent.setup()
		render(BaseToolbar, {
			props: { orientation: 'vertical' },
			slots: { default: '<button>A</button><button>B</button><span tabindex="-1" data-testid="plain">текст</span>' },
		})

		button('A').focus()
		await user.keyboard('{ArrowDown}')
		expect(button('B')).toHaveFocus()
		await user.keyboard('{ArrowUp}')
		expect(button('A')).toHaveFocus()
		await user.keyboard('{ArrowRight}')
		expect(button('A')).toHaveFocus()

		const plain = screen.getByTestId('plain')
		plain.focus()
		await user.keyboard('{ArrowDown}')
		expect(plain).toHaveFocus()
	})

	it('многострочное поле и редактируемый блок — стрелки остаются в них', async () => {
		const user = userEvent.setup()
		render(BaseToolbar, {
			slots: {
				default:
					'<button>A</button><textarea aria-label="Заметка"></textarea><div contenteditable="true" tabindex="0" aria-label="Текст">x</div>',
			},
		})

		const note = screen.getByRole('textbox', { name: 'Заметка' })
		note.focus()
		await user.keyboard('{ArrowRight}')
		expect(note).toHaveFocus()
		const editable = screen.getByLabelText('Текст')
		editable.focus()
		await user.keyboard('{ArrowLeft}')
		expect(editable).toHaveFocus()
	})
})
