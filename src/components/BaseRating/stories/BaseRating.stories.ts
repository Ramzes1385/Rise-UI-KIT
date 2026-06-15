/**
 * Stories для компонента BaseRating.
 * Демонстрирует выбор оценки, варианты, размеры, readonly и тёмную тему.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test'
import { ref, watch } from 'vue'

import { buildArgTypes } from '@utils/storybookUtils'

import { RATING_VARIANTS } from '../model/BaseRating.types'
import BaseRating from '../ui/BaseRating.vue'

const meta: Meta<typeof BaseRating> = {
	title: 'UI/BaseRating',
	component: BaseRating,

	argTypes: buildArgTypes({
		props: {
			modelValue: {
				control: { type: 'number', min: 0, max: 10 },
				description: 'Текущая оценка',
			},
			max: {
				control: { type: 'number', min: 1, max: 10 },
				description: 'Количество звёзд',
			},
			step: {
				control: { type: 'number', min: 0.1, max: 1, step: 0.1 },
				description: 'Шаг выбора (1 — целые, 0.5 — половинки, 0.1 — десятые)',
			},
			isHoverSmooth: {
				control: 'boolean',
				description: 'Плавный предпросмотр при наведении (попиксельно, игнорируя step)',
			},
			variant: {
				control: 'inline-radio',
				options: RATING_VARIANTS,
				description: 'Вариант отображения',
			},
			isReadonly: {
				control: 'boolean',
				description: 'Только для чтения',
			},
			isDisabled: {
				control: 'boolean',
				description: 'Заблокирован',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
		},
	}),

	args: {
		modelValue: 3,
		max: 5,
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseRating>

/** Базовый рейтинг (управляется через Controls и клик по звёздам) */
export const Default: Story = {
	args: {
		modelValue: 3,
		onChange: fn(),
	},
	render: args => ({
		components: { BaseRating },
		setup() {
			const value = ref(args.modelValue)
			watch(
				() => args.modelValue,
				next => {
					value.value = next
				},
			)
			return { args, value }
		},
		template: '<BaseRating v-bind="args" v-model="value" />',
	}),
	play: async ({ canvasElement, args }) => {
		const stars = canvasElement.querySelectorAll<HTMLElement>('.base-rating__star')
		await userEvent.click(stars[4])

		await expect(args.onChange).toHaveBeenCalled()
		const value = (args.onChange as ReturnType<typeof fn>).mock.calls.at(-1)?.[0] as number
		await expect(value).toBeGreaterThan(3)
		await expect(value).toBeLessThanOrEqual(5)
	},
}

/** Только для чтения */
export const Readonly: Story = {
	args: {
		isReadonly: true,
		modelValue: 4,
	},
	render: args => ({
		components: { BaseRating },
		setup() {
			return { args }
		},
		template: '<BaseRating v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const slider = canvas.getByRole('slider')
		await expect(slider).toHaveAttribute('tabindex', '-1')

		const fills = canvasElement.querySelectorAll<HTMLElement>('.base-rating__star-fill')
		const fullStars = Array.from(fills).filter(f => f.style.width === '100%')
		await expect(fullStars).toHaveLength(4)

		const star = canvasElement.querySelectorAll<HTMLElement>('.base-rating__star')[0]
		await fireEvent.mouseMove(star, { clientX: 5 })
		await fireEvent.click(star, { clientX: 5 })
		await fireEvent.keyDown(slider, { key: 'ArrowRight' })
		await expect(fills[0].style.width).toBe('100%')
	},
}

/** Заблокированное состояние не реагирует на наведение, клик и клавиатуру */
export const Disabled: Story = {
	args: {
		isDisabled: true,
		modelValue: 2,
		onChange: fn(),
	},
	render: args => ({
		components: { BaseRating },
		setup() {
			return { args }
		},
		template: '<BaseRating v-bind="args" />',
	}),
	play: async ({ canvasElement, args }) => {
		const stars = canvasElement.querySelectorAll<HTMLElement>('.base-rating__star')
		const slider = within(canvasElement).getByRole('slider')

		await fireEvent.mouseMove(stars[4], { clientX: 10 })
		await fireEvent.click(stars[4], { clientX: 10 })
		await fireEvent.keyDown(slider, { key: 'ArrowRight' })

		const fills = canvasElement.querySelectorAll<HTMLElement>('.base-rating__star-fill')
		await expect(fills[3].style.width).toBe('0%')
		await expect(args.onChange).not.toHaveBeenCalled()
	},
}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseRating },
		setup() {
			return { args, variants: RATING_VARIANTS }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start;">
				<BaseRating v-for="v in variants" :key="v" v-bind="args" :variant="v" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const groups = canvasElement.querySelectorAll('.base-rating')
		await expect(groups.length).toBe(RATING_VARIANTS.length)
	},
}

/** Масштабирование sizeScale */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseRating },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:24px;align-items:center;">
				<BaseRating v-for="scale in [75, 100, 150]" :key="scale" v-bind="args" :size-scale="scale" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const groups = canvasElement.querySelectorAll('.base-rating')
		await expect(groups.length).toBe(3)
	},
}

/** Тёмная тема */
export const DarkTheme: Story = {
	render: args => ({
		components: { BaseRating },
		setup() {
			return { args }
		},
		template: `
			<div data-theme="dark" style="padding:16px;background:var(--color-bg);border-radius:var(--border-radius-base);">
				<BaseRating v-bind="args" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const group = canvasElement.querySelector('.base-rating')
		await expect(group).toBeInTheDocument()
	},
}

/** Кастомные иконки для пустого и заполненного состояний */
export const CustomIcons: Story = {
	args: {
		modelValue: 3,
		icon: 'x-circle',
		iconFilled: 'check-circle',
		onChange: fn(),
	},
	render: args => ({
		components: { BaseRating },
		setup() {
			return { args }
		},
		template: '<BaseRating v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const star = canvasElement.querySelector('.base-rating__star')!
		const emptyHref = star.querySelector(':scope > .base-icon use')?.getAttribute('href') ?? ''
		const filledHref = star.querySelector('.base-rating__star-fill use')?.getAttribute('href') ?? ''
		await expect(emptyHref).toContain('x-circle')
		await expect(filledHref).toContain('check-circle')
	},
}

/** Дробное значение (read-only средняя оценка) */
export const FractionalReadonly: Story = {
	args: {
		modelValue: 4.3,
		step: 0.1,
		isReadonly: true,
	},
	render: args => ({
		components: { BaseRating },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;align-items:center;gap:12px;">
				<BaseRating v-bind="args" />
				<span style="color:var(--color-text-muted);">{{ args.modelValue }}</span>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const fill = canvasElement.querySelectorAll<HTMLElement>('.base-rating__star-fill')[4]
		await expect(fill.style.width).toBe('30%')
	},
}

/** Выбор половинками */
export const HalfStep: Story = {
	args: {
		modelValue: 2.5,
		step: 0.5,
	},
	render: args => ({
		components: { BaseRating },
		setup() {
			const value = ref(args.modelValue)
			watch(
				() => args.modelValue,
				next => {
					value.value = next
				},
			)
			return { args, value }
		},
		template: `
			<div>
				<BaseRating v-bind="args" v-model="value" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Оценка: {{ value }}</p>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const fill = canvasElement.querySelectorAll<HTMLElement>('.base-rating__star-fill')[2]
		await expect(fill.style.width).toBe('50%')
	},
}

/** Интерактивный выбор с клавиатуры */
export const Interactive: Story = {
	args: {
		modelValue: 2,
		onChange: fn(),
	},
	render: args => ({
		components: { BaseRating },
		setup() {
			const value = ref(args.modelValue)
			watch(
				() => args.modelValue,
				next => {
					value.value = next
				},
			)
			return { args, value }
		},
		template: `
			<div>
				<BaseRating v-bind="args" v-model="value" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Оценка: {{ value }}</p>
			</div>
		`,
	}),
	play: async ({ canvasElement, args, step }) => {
		const canvas = within(canvasElement)
		const slider = canvas.getByRole('slider')

		await step('увеличение оценки по ArrowRight эмитит change(3)', async () => {
			slider.focus()
			await userEvent.keyboard('{ArrowRight}')
			await expect(args.onChange).toHaveBeenCalledWith(3)
		})

		await step('значение отражается рядом', async () => {
			await waitFor(() => expect(canvasElement.textContent).toContain('Оценка: 3'))
		})

		await step('уменьшение по ArrowLeft возвращает к 2', async () => {
			await userEvent.keyboard('{ArrowLeft}')
			await waitFor(() => expect(canvasElement.textContent).toContain('Оценка: 2'))
		})

		await step('увеличение по ArrowUp', async () => {
			await userEvent.keyboard('{ArrowUp}')
			await waitFor(() => expect(canvasElement.textContent).toContain('Оценка: 3'))
		})

		await step('уменьшение по ArrowDown', async () => {
			await userEvent.keyboard('{ArrowDown}')
			await waitFor(() => expect(canvasElement.textContent).toContain('Оценка: 2'))
		})

		await step('прочие клавиши игнорируются', async () => {
			await userEvent.keyboard('{Enter}')
			await waitFor(() => expect(canvasElement.textContent).toContain('Оценка: 2'))
		})
	},
}

/** Выбор по клику с привязкой к шагу (isHoverSmooth=false) */
export const SteppedClick: Story = {
	args: {
		modelValue: 0,
		step: 0.5,
		isHoverSmooth: false,
		onChange: fn(),
	},
	render: args => ({
		components: { BaseRating },
		setup() {
			const value = ref(args.modelValue)
			watch(
				() => args.modelValue,
				next => {
					value.value = next
				},
			)
			return { args, value }
		},
		template: `
			<div>
				<BaseRating v-bind="args" v-model="value" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Оценка: {{ value }}</p>
			</div>
		`,
	}),
	play: async ({ canvasElement, args }) => {
		const star = canvasElement.querySelectorAll<HTMLElement>('.base-rating__star')[2]
		const rect = star.getBoundingClientRect()
		const leftX = rect.left + rect.width * 0.2
		const midY = rect.top + rect.height / 2

		await userEvent.pointer({ target: star, coords: { x: leftX, y: midY } })
		await fireEvent.click(star, { clientX: leftX, clientY: midY })

		await expect(args.onChange).toHaveBeenCalled()
		const value = (args.onChange as ReturnType<typeof fn>).mock.calls.at(-1)?.[0] as number
		await expect(value).toBe(2.5)

		await userEvent.unhover(star)
		await waitFor(() => {
			const fill = star.querySelector<HTMLElement>('.base-rating__star-fill')!
			expect(fill.style.width).toBe('50%')
		})
	},
}

/** Плавный предпросмотр при наведении (step=1, заливка следует за курсором) */
export const SmoothHover: Story = {
	args: {
		modelValue: 0,
		step: 1,
		isHoverSmooth: true,
	},
	render: args => ({
		components: { BaseRating },
		setup() {
			return { args }
		},
		template: `
			<div>
				<BaseRating v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Наведите курсор на середину звезды — заливка следует за курсором</p>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const star = canvasElement.querySelectorAll<HTMLElement>('.base-rating__star')[2]
		const rect = star.getBoundingClientRect()
		await userEvent.pointer({ target: star, coords: { x: rect.left + rect.width * 0.5, y: rect.top + rect.height / 2 } })

		const fill = star.querySelector<HTMLElement>('.base-rating__star-fill')!
		const width = Number.parseFloat(fill.style.width)
		await expect(width).toBeGreaterThan(0)
		await expect(width).toBeLessThan(100)

		await userEvent.unhover(star)
		await waitFor(() => expect(fill.style.width).toBe('0%'))
	},
}
