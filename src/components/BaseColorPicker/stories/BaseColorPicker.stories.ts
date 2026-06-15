/**
 * Stories для компонента BaseColorPicker.
 * Демонстрирует выбор цвета, ввод HEX, пресеты, позиции и состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, fireEvent, fn, waitFor } from 'storybook/test'
import { ref } from 'vue'

import BaseColorPicker from '../ui/BaseColorPicker.vue'
import { COLOR_PICKER_POSITIONS } from '../model/BaseColorPicker.types'

const meta: Meta<typeof BaseColorPicker> = {
	title: 'UI/BaseColorPicker',
	component: BaseColorPicker,

	argTypes: {
		modelValue: { control: 'color' },
		position: { control: 'inline-radio', options: COLOR_PICKER_POSITIONS },
		presets: { control: 'object', description: 'Массив HEX-цветов пресетов' },
		isHexHidden: { control: 'boolean' },
		isPresetsHidden: { control: 'boolean' },
		isDisabled: { control: 'boolean' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		'onUpdate:modelValue': { table: { disable: true } },
		onChange: { table: { disable: true } },
	},

	args: {
		modelValue: '#f97316',
		position: 'bottom',
		isHexHidden: false,
		isPresetsHidden: false,
		isDisabled: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseColorPicker>

function cleanPanels(): void {
	document.body.querySelectorAll('.base-dropdown__panel').forEach(element => element.remove())
}

function getSwatch(root: ParentNode): HTMLElement {
	const swatch = root.querySelector<HTMLElement>('.base-color-picker__swatch')
	if (!swatch) throw new Error('Swatch не найден')
	return swatch
}

async function openPanel(root: ParentNode): Promise<HTMLElement> {
	cleanPanels()
	await fireEvent.click(getSwatch(root))
	await waitFor(() => expect(document.body.querySelector('.base-color-picker__panel')).toBeTruthy())
	const panels = document.body.querySelectorAll<HTMLElement>('.base-color-picker__panel')
	return panels[panels.length - 1]
}

const renderWithModel: Story['render'] = args => ({
	components: { BaseColorPicker },
	setup() {
		const value = ref<string>(args.modelValue ?? '#f97316')
		return { args, value }
	},
	template: '<BaseColorPicker v-bind="args" v-model="value" />',
})
/** Базовый выбор цвета */
export const Default: Story = {
	render: renderWithModel,
	args: { 'onUpdate:modelValue': fn() },
	play: async ({ canvasElement }) => {
		const swatch = getSwatch(canvasElement)
		expect(swatch.style.backgroundColor).toBe('rgb(249, 115, 22)')
	},
}
/** Открытие панели и выбор тона */
export const PickHue: Story = {
	render: renderWithModel,
	play: async ({ canvasElement }) => {
		const panel = await openPanel(canvasElement)
		const hue = panel.querySelector('.base-color-picker__hue') as HTMLInputElement
		if (!hue) throw new Error('Слайдер тона не найден')
		hue.value = '200'
		await fireEvent.input(hue)
		await waitFor(() => expect(getSwatch(canvasElement).style.backgroundColor).not.toBe('rgb(249, 115, 22)'))
		cleanPanels()
	},
}
/** Ручной ввод HEX */
export const HexInput: Story = {
	render: renderWithModel,
	play: async ({ canvasElement }) => {
		const panel = await openPanel(canvasElement)
		const hex = panel.querySelector('.base-color-picker__hex') as HTMLInputElement
		hex.value = '#0000ff'
		await fireEvent.change(hex)
		await waitFor(() => expect(getSwatch(canvasElement).style.backgroundColor).toBe('rgb(0, 0, 255)'))
		cleanPanels()
	},
}
/** Выбор насыщенности и яркости перетаскиванием в SV-области */
export const PickArea: Story = {
	render: renderWithModel,
	play: async ({ canvasElement }) => {
		const panel = await openPanel(canvasElement)
		const area = panel.querySelector<HTMLElement>('.base-color-picker__area')
		if (!area) throw new Error('SV-область не найдена')

		const rect = area.getBoundingClientRect()
		const midX = rect.left + rect.width / 2
		const midY = rect.top + rect.height / 2

		await fireEvent.pointerDown(area, { clientX: midX, clientY: midY })
		window.dispatchEvent(
			Object.assign(new Event('pointermove'), { clientX: rect.left + rect.width * 0.75, clientY: rect.top + rect.height * 0.25 }),
		)
		window.dispatchEvent(new Event('pointerup'))

		await waitFor(() => expect(getSwatch(canvasElement)).toBeInTheDocument())
		cleanPanels()
	},
}
/** Невалидное значение модели — swatch использует цвет палитры */
export const InvalidValue: Story = {
	render: renderWithModel,
	args: { modelValue: 'not-a-color' },
	play: async ({ canvasElement }) => {
		const swatch = getSwatch(canvasElement)
		await expect(swatch.style.backgroundColor).toBe('rgb(0, 0, 0)')
	},
}
/** Кнопка сброса цвета */
export const Resettable: Story = {
	render: renderWithModel,
	args: { isResettable: true, resetLabel: 'Без цвета', 'onReset': fn() },
	play: async ({ canvasElement, args }) => {
		const panel = await openPanel(canvasElement)
		const reset = panel.querySelector<HTMLButtonElement>('.base-color-picker__reset')
		if (!reset) throw new Error('Кнопка сброса не найдена')
		await expect(reset).toHaveTextContent('Без цвета')

		await fireEvent.click(reset)
		await expect(args.onReset).toHaveBeenCalled()
		await waitFor(() => expect(document.body.querySelector('.base-color-picker__panel')).toBeNull())
		cleanPanels()
	},
}
/** Выбор пресета */
export const PickPreset: Story = {
	render: renderWithModel,
	play: async ({ canvasElement }) => {
		const panel = await openPanel(canvasElement)
		const presets = panel.querySelectorAll('.base-color-picker__preset')
		await fireEvent.click(presets[5])
		await waitFor(() => expect(document.body.querySelector('.base-color-picker__panel')).toBeTruthy())
		cleanPanels()
	},
}
/** Без поля HEX и без пресетов */
export const PaletteOnly: Story = {
	render: renderWithModel,
	args: { isHexHidden: true, isPresetsHidden: true },
	play: async ({ canvasElement }) => {
		const panel = await openPanel(canvasElement)
		expect(panel.querySelector('.base-color-picker__hex')).toBeNull()
		expect(panel.querySelector('.base-color-picker__presets')).toBeNull()
		cleanPanels()
	},
}
/** Кастомный набор пресетов */
export const CustomPresets: Story = {
	render: renderWithModel,
	args: {
		presets: ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'],
	},
	play: async ({ canvasElement }) => {
		const panel = await openPanel(canvasElement)
		expect(panel.querySelectorAll('.base-color-picker__preset')).toHaveLength(6)
		cleanPanels()
	},
}
/** Заблокированное состояние */
export const Disabled: Story = {
	render: renderWithModel,
	args: { isDisabled: true },
	play: async ({ canvasElement }) => {
		expect(getSwatch(canvasElement)).toBeDisabled()
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 32px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: renderWithModel,
	play: async ({ canvasElement }) => {
		expect(getSwatch(canvasElement)).toBeInTheDocument()
	},
}
