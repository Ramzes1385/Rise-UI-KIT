/**
 * BasePin — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты, размеры, цвет) →
 * состояния (пусто, ошибка, disabled) → сценарии (скрытый ввод, вставка кода) → клавиатура.
 */

import { expect, fn, waitFor } from 'storybook/test'
import { ref } from 'vue'
import {
	ARG_GROUP,
	baseArgTypes,
	hiddenArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	tabTo,
	useArgsWithoutSlots,
	useModelArg,
} from '@/stories/helpers'
import { PIN_VARIANTS } from '../model/BasePin.types'
import BasePin from '../ui/BasePin.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BasePin',
	component: BasePin,
	parameters: {
		docs: {
			description: {
				component: [
					'Ввод кода по ячейкам: PIN, код из СМС или письма. Ячейка — поле 32×32 (как инпут высотой 32px).',
					'',
					'- Ввод символа переводит фокус в следующую ячейку, Backspace очищает ячейку и возвращает назад, ←/→ — переход между ячейками.',
					'- Вставка из буфера заполняет все ячейки; когда заполнены все, приходит событие `complete`.',
					'- Ячейки подписаны «Символ 1 из 4»; имя всей группе даёт `aria-label` на компоненте или обёртка `BaseFormField`.',
					'- Ошибка (`error`) помечает ячейки `aria-invalid` и связана с ними через `aria-describedby`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: PIN_VARIANTS }),
		modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
		length: { control: { type: 'number', min: 1, max: 8 }, table: propGroup(ARG_GROUP.behavior) },
		type: { control: 'inline-radio', options: ['text', 'password', 'number'], table: propGroup(ARG_GROUP.behavior) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		// Слот default объявлен в типах, но компонент его не выводит.
		...hiddenArgTypes('default'),
	},
	args: {
		modelValue: '',
		length: 4,
		type: 'text',
		variant: 'default',
		sizeScale: 100,
		error: '',
		isDisabled: false,
		'onUpdate:modelValue': fn(),
		onComplete: fn(),
	},
	// Значение хранится в args: ввод обновляет Controls, а изменение в Controls — ячейки.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BasePin },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<BasePin v-bind="props" aria-label="Код из СМС" @update:model-value="onUpdate" />',
		}
	},
} satisfies Meta<typeof BasePin>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: введите код — фокус переходит по ячейкам, после последней приходит `complete`. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('textbox', { name: 'Символ 1 из 4' }))
		await userEvent.keyboard('4829')
		await waitFor(() => expect(args.onComplete).toHaveBeenCalledWith('4829'))
		await expect(canvas.getByRole('textbox', { name: 'Символ 4 из 4' })).toHaveValue('9')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Пять вариантов, как у `BaseInput`: `default`, `outline` — без фона, `soft` — мягкий фон, `ghost` — без рамки, `shadow` — с тенью. */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'length', 'isDisabled', 'error'] },
		docs: { source: { code: PIN_VARIANTS.map(variant => `<BasePin v-model="code" variant="${variant}" />`).join('\n') } },
	},
	render: args => ({
		components: { BasePin },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'variant', 'onUpdate:modelValue']),
			variants: PIN_VARIANTS,
			values: ref<Record<string, string>>(Object.fromEntries(PIN_VARIANTS.map(variant => [variant, '48']))),
		}),
		template: `
			<div class="story-col">
				<div v-for="variant in variants" :key="variant" class="story-row">
					<span class="story-label">{{ variant }}</span>
					<BasePin v-bind="props" v-model="values[variant]" :variant="variant" :aria-label="'Код, вариант ' + variant" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: ячейки 24, 28, 32, 36 и 40px — такие же, как высота инпута и кнопки того же размера. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant', 'length'] },
		docs: { source: { code: SIZE_PRESETS.map(p => `<BasePin v-model="code" :size-scale="${p.sizeScale}" />`).join('\n') } },
	},
	render: args => ({
		components: { BasePin },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, '48']))),
		}),
		template: `
			<div class="story-col">
				<div v-for="preset in presets" :key="preset.name" class="story-row">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BasePin v-bind="props" v-model="values[preset.name]" :size-scale="preset.sizeScale" :aria-label="'Код, размер ' + preset.name" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const heights = ['xs', 'md', 'xl'].map(
			name =>
				canvas
					.getByRole('group', { name: `Код, размер ${name}` })
					.querySelector('input')!
					.getBoundingClientRect().height,
		)
		await expect(heights).toEqual([24, 32, 40])
	},
}

/** Кастомный цвет фона и текста ячеек через `color`. */
export const CustomColor: Story = {
	args: { modelValue: '4829', color: { bg: { base: '#eff6ff' }, text: { base: '#1e40af' } } },
	play: async ({ canvas }) => {
		const cell = canvas.getByRole('textbox', { name: 'Символ 1 из 4' })
		await expect(getComputedStyle(cell).backgroundColor).toBe('rgb(239, 246, 255)')
		await expect(getComputedStyle(cell).color).toBe('rgb(30, 64, 175)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Пустой код: все ячейки пустые, у каждой — доступное имя с позицией. */
export const Empty: Story = {
	play: async ({ canvas }) => {
		const cells = canvas.getAllByRole('textbox')
		await expect(cells).toHaveLength(4)
		for (const cell of cells) {
			await expect(cell).toHaveValue('')
		}
		await expect(canvas.getByRole('group')).toHaveAccessibleName('Код из СМС')
	},
}

/** Ошибка: красная рамка ячеек и текст под ними; ячейки помечены `aria-invalid` и описаны текстом ошибки. */
export const WithError: Story = {
	args: { modelValue: '4830', error: 'Неверный код. Осталось 2 попытки' },
	play: async ({ canvas }) => {
		const cell = canvas.getByRole('textbox', { name: 'Символ 1 из 4' })
		await expect(cell).toHaveAttribute('aria-invalid', 'true')
		await expect(cell).toHaveAccessibleDescription('Неверный код. Осталось 2 попытки')
	},
}

/** Отключённый ввод: ячейки приглушены и не принимают фокус. */
export const Disabled: Story = {
	args: { modelValue: '48', isDisabled: true },
	play: async ({ canvas }) => {
		for (const cell of canvas.getAllByRole('textbox')) {
			await expect(cell).toBeDisabled()
		}
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Скрытый ввод `type="password"`: символы заменяются точками — для PIN-кода карты или приложения. */
export const Password: Story = {
	args: { type: 'password', modelValue: '48' },
	play: async ({ canvasElement }) => {
		const cells = canvasElement.querySelectorAll('input')
		await expect(cells).toHaveLength(4)
		for (const cell of Array.from(cells)) {
			await expect(cell).toHaveAttribute('type', 'password')
		}
	},
}

/** Вставка кода из буфера (здесь `length` = 6): все ячейки заполняются сразу и приходит `complete`. */
export const Paste: Story = {
	args: { length: 6 },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('textbox', { name: 'Символ 1 из 6' }))
		await userEvent.paste('482 913')
		await waitFor(() => expect(args.onComplete).toHaveBeenCalledWith('482913'))
		await expect(canvas.getByRole('textbox', { name: 'Символ 6 из 6' })).toHaveValue('3')
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab ставит фокус в первую ячейку (видно кольцо), → и ← переходят между ячейками,
 * Backspace в пустой ячейке стирает предыдущий символ и возвращает фокус назад.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { modelValue: '48' },
	play: async ({ canvas, userEvent }) => {
		const first = canvas.getByRole('textbox', { name: 'Символ 1 из 4' })
		const second = canvas.getByRole('textbox', { name: 'Символ 2 из 4' })
		const third = canvas.getByRole('textbox', { name: 'Символ 3 из 4' })
		await tabTo(first, userEvent)
		await expect(getComputedStyle(first).boxShadow).not.toBe('none')
		await userEvent.keyboard('{ArrowRight}{ArrowRight}')
		await expect(third).toHaveFocus()
		await userEvent.keyboard('{Backspace}')
		await expect(second).toHaveFocus()
		await expect(second).toHaveValue('')
		await userEvent.keyboard('{ArrowLeft}')
		await expect(first).toHaveFocus()
	},
}
