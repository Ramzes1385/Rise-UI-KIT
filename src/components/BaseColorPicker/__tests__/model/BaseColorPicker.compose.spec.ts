import '@testing-library/jest-dom/vitest'
import BaseColorPicker from '../../ui/BaseColorPicker.vue'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'

async function openPanel(container: ParentNode): Promise<HTMLElement> {
	await fireEvent.click(container.querySelector('.base-color-picker__swatch')!)
	return document.body.querySelector<HTMLElement>('.base-color-picker__panel')!
}

afterEach(() => {
	document.body.querySelectorAll('.base-dropdown__panel').forEach(element => element.remove())
	vi.unstubAllGlobals()
})

describe('BaseColorPicker: кнопки и подсказки на компонентах кита', () => {
	it('«Без цвета»: кнопка type=button с customClass.reset, клик эмитит reset и закрывает панель', async () => {
		const { container, emitted } = render(BaseColorPicker, {
			props: { modelValue: '#ff0000', isResettable: true, customClass: { reset: 'my-reset' } },
		})
		const panel = await openPanel(container)
		const reset = within(panel).getByRole('button', { name: 'Без цвета' })

		expect(reset).toHaveAttribute('type', 'button')
		expect(reset).toHaveClass('base-color-picker__reset', 'my-reset')
		await fireEvent.click(reset)
		expect(emitted('reset')).toEqual([[]])
		expect(emitted('update:modelValue')).toBeUndefined()
		await waitFor(() => expect(container.querySelector('.base-color-picker__swatch')).toHaveAttribute('aria-expanded', 'false'))
	})

	it('resetLabel меняет имя кнопки сброса', async () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: '#ff0000', isResettable: true, resetLabel: 'Сбросить' } })
		const panel = await openPanel(container)

		expect(within(panel).getByRole('button', { name: 'Сбросить' })).toBeInTheDocument()
	})

	it('пипетка: кнопка с именем без title, подсказка по наведению и фокусу', async () => {
		vi.stubGlobal(
			'EyeDropper',
			class {
				open = vi.fn()
			},
		)
		const { container } = render(BaseColorPicker, { props: { modelValue: '#000000' } })
		const panel = await openPanel(container)
		const button = within(panel).getByRole('button', { name: 'Взять цвет с экрана' })

		expect(button).toHaveAttribute('type', 'button')
		expect(button).toHaveClass('base-color-picker__eyedropper')
		expect(button).not.toHaveAttribute('title')
		await fireEvent.mouseEnter(button.closest('.base-tooltip')!)
		expect(await screen.findByRole('tooltip')).toHaveTextContent('Взять цвет с экрана')
		await fireEvent.mouseLeave(button.closest('.base-tooltip')!)
		await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
		await fireEvent.focusIn(button)
		expect(await screen.findByRole('tooltip')).toHaveTextContent('Взять цвет с экрана')
	})

	it('клик по пипетке вызывает EyeDropper.open и применяет цвет', async () => {
		const open = vi.fn().mockResolvedValue({ sRGBHex: '#abcdef' })
		vi.stubGlobal(
			'EyeDropper',
			class {
				open = open
			},
		)
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: '#000000' } })
		const panel = await openPanel(container)

		await fireEvent.click(within(panel).getByRole('button', { name: 'Взять цвет с экрана' }))
		expect(open).toHaveBeenCalledTimes(1)
		await waitFor(() => expect(emitted('update:modelValue')).toEqual([['#abcdef']]))
	})
})
