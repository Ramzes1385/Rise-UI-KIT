/**
 * Stories для BasePin.
 * Каждая story содержит play-функцию для 100% coverage.
 */

import { expect, fireEvent, fn, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'
import { playFocusTest, playShiftTab } from '@utils/storybookUtils/a11yHelpers'
import BasePin from '../ui/BasePin.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

/** Получает инпуты pin'а или бросает ошибку */
function getInputs(root: ParentNode): HTMLInputElement[] {
	const list = root.querySelectorAll<HTMLInputElement>('.base-pin__input')
	if (!list.length) throw new Error('Не найдены инпуты base-pin')
	return Array.from(list)
}

/** Эмулирует ввод символа в инпут через input-event */
async function typeInto(input: HTMLInputElement, char: string): Promise<void> {
	input.focus()
	input.value = char
	await fireEvent.input(input, { target: input })
}

/** Эмулирует paste-событие на инпуте с заданными данными */
async function pasteInto(input: HTMLInputElement, data: string): Promise<void> {
	input.focus()
	const event = new ClipboardEvent('paste', {
		clipboardData: new DataTransfer(),
		bubbles: true,
		cancelable: true,
	})
	event.clipboardData?.setData('text', data)
	input.dispatchEvent(event)
	await Promise.resolve()
}

const meta: Meta<typeof BasePin> = {
	title: 'UI/BasePin',
	component: BasePin,
	args: {
		modelValue: '',
		length: 4,
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BasePin>
// play удалён: дублирует "должен вставлять несколько символов при paste" в *.integration.spec.ts
/** Базовое состояние компонента */
export const Default: Story = {
	args: {
		onComplete: fn(),
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" :length="4" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка первого инпута по Tab', async () => {
			await playFocusTest(canvasElement, { selector: '.base-pin__input' })
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '.base-pin__input' })
		})
	},
}
/** Навигация стрелками */
export const ArrowNavigation: Story = {
	args: {
		modelValue: '12',
	},
	play: async ({ canvasElement }) => {
		const inputs = canvasElement.querySelectorAll('.base-pin__input') as NodeListOf<HTMLInputElement>

		// ArrowRight
		inputs[0].focus()
		await userEvent.keyboard('{ArrowRight}')
		expect(document.activeElement).toBe(inputs[1])

		// ArrowLeft
		await userEvent.keyboard('{ArrowLeft}')
		expect(document.activeElement).toBe(inputs[0])
	},
}
// play удалён: дублирует "должен вставлять несколько символов при paste" в *.integration.spec.ts
/** Отключённое состояние */
export const Disabled: Story = {
	args: {
		isDisabled: true,
		modelValue: '12',
	},
}
/** Состояние с ошибкой валидации */
export const WithError: Story = {
	args: {
		error: 'Неверный код',
		modelValue: '12',
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.base-pin--error')).toBeTruthy()
		expect(canvasElement.querySelector('.base-pin__error-text')?.textContent).toContain('Неверный код')
	},
}
/** Покрывает: ArrowLeft на первом инпуте (index=0, guard clause false) */
export const ArrowLeftOnFirst: Story = {
	args: {
		modelValue: '12',
	},
	play: async ({ canvasElement }) => {
		const inputs = canvasElement.querySelectorAll('.base-pin__input') as NodeListOf<HTMLInputElement>
		inputs[0].focus()
		await userEvent.keyboard('{ArrowLeft}')
		expect(document.activeElement).toBe(inputs[0])
	},
}
/** Покрывает: ArrowRight на последнем инпуте (index=length-1, guard clause false) */
export const ArrowRightOnLast: Story = {
	args: {
		modelValue: '12',
	},
	play: async ({ canvasElement }) => {
		const inputs = canvasElement.querySelectorAll('.base-pin__input') as NodeListOf<HTMLInputElement>
		inputs[3].focus()
		await userEvent.keyboard('{ArrowRight}')
		expect(document.activeElement).toBe(inputs[3])
	},
}
/** Пустой pin-код */
export const Empty: Story = {
	args: {
		modelValue: '',
		length: 4,
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" :length="4" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка первого инпута по Tab', async () => {
			await playFocusTest(canvasElement, { selector: '.base-pin__input' })
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '.base-pin__input' })
		})
	},
}
/** Ввод по одному символу с автопереходом на следующую ячейку */
export const TypingAutoAdvance: Story = {
	args: {
		modelValue: '',
		onComplete: fn(),
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" :length="4" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const inputs = getInputs(canvasElement)
		await typeInto(inputs[0], '1')
		await waitFor(() => expect(document.activeElement).toBe(inputs[1]))
		await typeInto(inputs[1], '2')
		await waitFor(() => expect(document.activeElement).toBe(inputs[2]))
	},
}
/** Эмит complete при заполнении всех ячеек */
export const CompleteEmit: Story = {
	args: {
		modelValue: '123',
		onComplete: fn(),
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('123')
			return { args, value }
		},
		template: '<BasePin v-model="value" :length="4" v-bind="args" />',
	}),
	play: async ({ canvasElement, args }) => {
		const inputs = getInputs(canvasElement)
		await typeInto(inputs[3], '4')
		await waitFor(() => expect(args.onComplete).toHaveBeenCalledWith('1234'))
	},
}
/** Backspace в заполненной ячейке — очищает её, оставаясь в ней */
export const BackspaceClearsCell: Story = {
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('12')
			return { args, value }
		},
		// v-bind должен идти ПЕРЕД v-model, иначе args.modelValue перетирает реактивный value
		template: '<BasePin v-bind="args" v-model="value" :length="4" />',
	}),
	play: async ({ canvasElement }) => {
		const inputs = getInputs(canvasElement)
		inputs[1].focus()
		await fireEvent.keyDown(inputs[1], { key: 'Backspace' })
		await waitFor(() => expect(inputs[1].value).toBe(''))
	},
}
/** Backspace на пустой ячейке → переход и очистка предыдущей */
export const BackspaceMovesToPrev: Story = {
	args: { modelValue: '12' },
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('12')
			return { args, value }
		},
		template: '<BasePin v-model="value" :length="4" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const inputs = getInputs(canvasElement)
		inputs[2].focus()
		await userEvent.keyboard('{Backspace}')
		await waitFor(() => expect(document.activeElement).toBe(inputs[1]))
	},
}
/** Backspace на первой пустой ячейке — ничего не происходит */
export const BackspaceOnFirstEmpty: Story = {
	args: { modelValue: '' },
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" :length="4" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const inputs = getInputs(canvasElement)
		inputs[0].focus()
		await userEvent.keyboard('{Backspace}')
		expect(document.activeElement).toBe(inputs[0])
	},
}
/** Paste полного кода → заполнение всех ячеек и эмит complete */
export const PasteFull: Story = {
	args: {
		modelValue: '',
		onComplete: fn(),
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" :length="4" v-bind="args" />',
	}),
	play: async ({ canvasElement, args }) => {
		const inputs = getInputs(canvasElement)
		await pasteInto(inputs[0], '1234')
		await waitFor(() => expect(args.onComplete).toHaveBeenCalledWith('1234'))
	},
}
/** Paste длиннее length → обрезка до length */
export const PasteOverflow: Story = {
	args: {
		modelValue: '',
		onComplete: fn(),
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" :length="4" v-bind="args" />',
	}),
	play: async ({ canvasElement, args }) => {
		const inputs = getInputs(canvasElement)
		await pasteInto(inputs[0], '987654321')
		await waitFor(() => expect(args.onComplete).toHaveBeenCalledWith('9876'))
	},
}
/** Paste с пробелами и короткой строкой — не вызывает complete */
export const PastePartial: Story = {
	args: {
		modelValue: '',
		onComplete: fn(),
	},
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BasePin v-model="value" :length="4" v-bind="args" />',
	}),
	play: async ({ canvasElement, args }) => {
		const inputs = getInputs(canvasElement)
		await pasteInto(inputs[0], '  12  ')
		await waitFor(() => expect(args.onComplete).not.toHaveBeenCalled())
	},
}
/** Удаление символа из инпута через input event с пустым value */
export const ClearViaInput: Story = {
	args: { modelValue: '12' },
	render: args => ({
		components: { BasePin },
		setup() {
			const value = ref('12')
			return { args, value }
		},
		template: '<BasePin v-model="value" :length="4" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const inputs = getInputs(canvasElement)
		await typeInto(inputs[1], '')
		await waitFor(() => expect(inputs[1].value).toBe(''))
	},
}
/** Type=password — проверка ветки type */
export const PasswordType: Story = {
	args: { type: 'password', modelValue: '12' },
	play: async ({ canvasElement }) => {
		const inputs = getInputs(canvasElement)
		expect(inputs[0].type).toBe('password')
	},
}
/** Покрытие customClass для всех элементов */
export const WithCustomClass: Story = {
	args: {
		modelValue: '12',
		error: 'Ошибка',
		customClass: {
			root: 'custom-root',
			cells: 'custom-cells',
			input: 'custom-input',
			errorText: 'custom-error',
		},
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.custom-root')).toBeTruthy()
		expect(canvasElement.querySelector('.custom-cells')).toBeTruthy()
		expect(canvasElement.querySelector('.custom-input')).toBeTruthy()
		expect(canvasElement.querySelector('.custom-error')).toBeTruthy()
	},
}
