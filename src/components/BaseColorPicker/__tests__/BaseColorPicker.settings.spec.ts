import '@testing-library/jest-dom/vitest'
import { defineComponent, nextTick, ref } from 'vue'
import BaseColorPicker from '../ui/BaseColorPicker.vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/vue'

async function openPanel(container: ParentNode): Promise<HTMLElement> {
	await fireEvent.click(container.querySelector('.base-color-picker__swatch')!)
	return document.body.querySelector<HTMLElement>('.base-color-picker__panel')!
}

async function closePanel(): Promise<void> {
	await fireEvent.keyDown(document, { key: 'Escape' })
	await nextTick()
}

function lastEmitted(emitted: Record<string, unknown[][]>, event = 'update:modelValue'): unknown {
	const calls = emitted[event]
	return calls?.[calls.length - 1]?.[0]
}

afterEach(() => {
	document.body.querySelectorAll('.base-dropdown__panel').forEach(element => element.remove())
	vi.unstubAllGlobals()
})

describe('BaseColorPicker — форматы, прозрачность, палитры', () => {
	it('переключает поля HEX → RGB → HSL и меняет канал RGB', async () => {
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: '#ff0000' } })
		const panel = await openPanel(container)
		const formats = within(panel).getByRole('group', { name: 'Формат цвета' })
		expect(within(formats).getByRole('button', { name: 'HEX' })).toHaveAttribute('aria-pressed', 'true')

		await fireEvent.click(within(formats).getByRole('button', { name: 'RGB' }))
		const green = within(panel).getByRole('spinbutton', { name: 'Зелёный' })
		expect(within(panel).getByRole('spinbutton', { name: 'Красный' })).toHaveValue(255)
		await fireEvent.update(green, '128')
		await fireEvent.change(green)
		expect(lastEmitted(emitted())).toBe('#ff8000')

		await fireEvent.click(within(formats).getByRole('button', { name: 'HSL' }))
		expect(within(panel).queryByLabelText('HEX-значение')).not.toBeInTheDocument()
		const hue = within(panel).getByRole('spinbutton', { name: 'Тон' })
		await fireEvent.update(hue, '240')
		await fireEvent.change(hue)
		expect(lastEmitted(emitted())).toBe('#0000ff')
	})

	it('зажимает значение канала и возвращает прежнее при нечисловом вводе', async () => {
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: '#000000', formats: ['rgb'] } })
		const panel = await openPanel(container)
		expect(within(panel).queryByRole('group', { name: 'Формат цвета' })).not.toBeInTheDocument()
		const red = within(panel).getByRole('spinbutton', { name: 'Красный' })

		await fireEvent.update(red, '999')
		await fireEvent.change(red)
		expect(lastEmitted(emitted())).toBe('#ff0000')

		await fireEvent.update(red, '')
		await fireEvent.change(red)
		expect(red).toHaveValue(255)
		expect(emitted()['update:modelValue']).toHaveLength(1)
	})

	it('format="rgb" отдаёт v-model в rgb(), с прозрачностью — rgba()', async () => {
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: 'rgb(255, 0, 0)', format: 'rgb', hasAlpha: true } })
		const panel = await openPanel(container)
		expect(within(panel).getByRole('button', { name: 'RGB' })).toHaveAttribute('aria-pressed', 'true')

		const alpha = within(panel).getByRole('slider', { name: 'Непрозрачность' })
		await fireEvent.update(alpha, '40')
		expect(lastEmitted(emitted())).toBe('rgba(255, 0, 0, 0.4)')
		expect(alpha).toHaveAttribute('aria-valuetext', '40%')
		expect(within(panel).getByRole('spinbutton', { name: 'Непрозрачность' })).toHaveValue(40)
	})

	it('поле HEX показывает прозрачность при hasAlpha и принимает rgba()', async () => {
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: '#ff000080', hasAlpha: true } })
		const panel = await openPanel(container)
		const hex = within(panel).getByLabelText('HEX-значение')
		expect(hex).toHaveValue('#ff000080')
		const swatch = container.querySelector<HTMLElement>('.base-color-picker__swatch')
		expect(swatch?.style.backgroundColor).toBe('rgba(255, 0, 0, 0.5)')
		expect(swatch).toHaveClass('base-color-picker__swatch--translucent')

		await fireEvent.update(hex, 'rgba(0, 0, 255, 0.25)')
		await fireEvent.change(hex)
		expect(lastEmitted(emitted())).toBe('#0000ff40')
	})

	it('без formats, где есть format, поля начинаются с первого формата списка', async () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: '#ff0000', format: 'hex', formats: ['hsl', 'rgb'] } })
		const panel = await openPanel(container)
		expect(within(panel).getByRole('button', { name: 'HSL' })).toHaveAttribute('aria-pressed', 'true')
	})

	it('без hasAlpha нет ползунка прозрачности, а прозрачность из v-model отбрасывается', async () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: '#ff000080' } })
		const panel = await openPanel(container)
		expect(within(panel).queryByRole('slider', { name: 'Непрозрачность' })).not.toBeInTheDocument()
		expect(within(panel).getByLabelText('HEX-значение')).toHaveValue('#ff0000')
	})

	it('палитры: группа с подписью, выбор цвета закрывает панель', async () => {
		const palettes = [{ label: 'Статусы', colors: ['#16a34a', '#dc2626'] }]
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: '#16a34a', palettes, isPresetsHidden: true } })
		const panel = await openPanel(container)
		const group = within(panel).getByRole('group', { name: 'Статусы' })
		expect(within(group).getByRole('button', { name: 'Пресет #16a34a' })).toHaveAttribute('aria-pressed', 'true')

		await fireEvent.click(within(group).getByRole('button', { name: 'Пресет #dc2626' }))
		expect(lastEmitted(emitted())).toBe('#dc2626')
		expect(container.querySelector('.base-color-picker__swatch')).toHaveAttribute('aria-expanded', 'false')
	})

	it('пресет в формате rgb() тоже отмечается выбранным', async () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: '#ff0000', presets: ['rgb(255, 0, 0)', 'nope'] } })
		const panel = await openPanel(container)
		expect(within(panel).getByRole('button', { name: 'Пресет rgb(255, 0, 0)' })).toHaveAttribute('aria-pressed', 'true')
		expect(within(panel).getByRole('button', { name: 'Пресет nope' })).toHaveAttribute('aria-pressed', 'false')
	})
})

describe('BaseColorPicker — недавние цвета', () => {
	it('без v-model хранит недавние внутри: цвет попадает в начало после закрытия панели', async () => {
		const Host = defineComponent({
			components: { BaseColorPicker },
			setup: () => ({ color: ref('#ff0000') }),
			template: '<BaseColorPicker v-model="color" :max-recent-colors="2" />',
		})
		const { container } = render(Host)

		let panel = await openPanel(container)
		expect(within(panel).queryByRole('group', { name: 'Недавние' })).not.toBeInTheDocument()
		await fireEvent.click(within(panel).getByRole('button', { name: 'Пресет #3b82f6' }))

		panel = await openPanel(container)
		await fireEvent.click(within(panel).getByRole('button', { name: 'Пресет #22c55e' }))
		await openPanel(container)
		await closePanel()
		panel = await openPanel(container)
		await fireEvent.click(within(panel).getByRole('button', { name: 'Пресет #ef4444' }))

		panel = await openPanel(container)
		const recent = within(panel).getByRole('group', { name: 'Недавние' })
		expect(
			within(recent)
				.getAllByRole('button')
				.map(button => button.getAttribute('aria-label')),
		).toEqual(['Пресет #ef4444', 'Пресет #22c55e'])
	})

	it('с v-model:recent-colors отдаёт новый список наружу', async () => {
		const { container, emitted } = render(BaseColorPicker, {
			props: { modelValue: '#000000', recentColors: ['#ff0000', '#00ff00'] },
		})
		const panel = await openPanel(container)
		await fireEvent.click(within(panel).getByRole('button', { name: 'Пресет #ff0000' }))
		expect(lastEmitted(emitted(), 'update:recentColors')).toEqual(['#ff0000', '#00ff00'])
	})

	it('isRecentHidden скрывает недавние', async () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: '#000000', recentColors: ['#ff0000'], isRecentHidden: true } })
		const panel = await openPanel(container)
		expect(within(panel).queryByRole('group', { name: 'Недавние' })).not.toBeInTheDocument()
	})
})

describe('BaseColorPicker — пипетка', () => {
	it('без EyeDropper API кнопки нет', async () => {
		const { container } = render(BaseColorPicker, { props: { modelValue: '#000000' } })
		const panel = await openPanel(container)
		expect(within(panel).queryByRole('button', { name: 'Взять цвет с экрана' })).not.toBeInTheDocument()
	})

	it('берёт цвет с экрана, отмена выбора ничего не меняет', async () => {
		const open = vi.fn().mockResolvedValueOnce({ sRGBHex: '#123456' }).mockRejectedValueOnce(new DOMException('', 'AbortError'))
		vi.stubGlobal(
			'EyeDropper',
			class {
				open = open
			},
		)
		const { container, emitted } = render(BaseColorPicker, { props: { modelValue: '#000000' } })
		const panel = await openPanel(container)
		const button = within(panel).getByRole('button', { name: 'Взять цвет с экрана' })

		await fireEvent.click(button)
		await vi.waitFor(() => expect(lastEmitted(emitted())).toBe('#123456'))
		await fireEvent.click(button)
		await Promise.resolve()
		expect(emitted()['update:modelValue']).toHaveLength(1)
	})

	it('isEyeDropperHidden скрывает кнопку и там, где API есть', async () => {
		vi.stubGlobal('EyeDropper', class {})
		const { container } = render(BaseColorPicker, { props: { modelValue: '#000000', isEyeDropperHidden: true } })
		const panel = await openPanel(container)
		expect(screen.queryByRole('button', { name: 'Взять цвет с экрана' })).not.toBeInTheDocument()
		expect(panel).toBeInTheDocument()
	})
})
