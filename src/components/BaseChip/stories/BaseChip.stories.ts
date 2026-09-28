import { ref } from 'vue'
import { expect, fn } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'
import BaseChip from '../ui/BaseChip.vue'
import { CHIP_VARIANTS } from '../types/BaseChip.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const PLACEMENTS = ['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const

/** Квадратная кнопка-иконка 32 × 32, над которой стоит индикатор */
const ICON_BUTTON = `
	<BaseButton variant="outline" aria-label="Уведомления" :padding="{ x: 5, y: 5 }">
		<BaseIcon name="inbox" />
	</BaseButton>
`

const meta = {
	title: 'Element/BaseChip',
	component: BaseChip,
	parameters: {
		docs: {
			description: {
				component: [
					'Индикатор в углу элемента: число непрочитанных у кнопки, метка «Новое» у пункта, статус у аватара.',
					'Оборачивает элемент (слот по умолчанию) и ставит над его углом пилюлю с `content`.',
					'',
					'- `placement` — угол; `hasOverflow` + `maxValue` показывают «99+»; `isHiddenOnZero` прячет индикатор при нуле.',
					'- Варианты как у кнопки: `default` — заливка основным цветом, `soft` — мягкий фон, `outline`, `ghost`, `shadow` — нейтральные.',
					'  Красный счётчик — проп `color` с токенами роли error.',
					'- Индикатор не получает фокус: если число важно, продублируйте его в доступном имени элемента.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: CHIP_VARIANTS }),
		content: { control: 'text', table: propGroup(ARG_GROUP.content) },
		placement: { control: 'inline-radio', options: PLACEMENTS, table: propGroup(ARG_GROUP.appearance) },
		hasOverflow: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		maxValue: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		isHiddenOnZero: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		default: { control: false },
	},
	args: {
		content: 5,
		placement: 'top-right',
		variant: 'default',
		hasOverflow: false,
		maxValue: 99,
		isHiddenOnZero: false,
		sizeScale: 100,
		'onClick-badge': fn(),
	},
	// Отступ вокруг примера: индикатор выходит за угол элемента на половину своей высоты.
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `<div style="padding: 12px;"><BaseChip v-bind="props">${ICON_BUTTON}</BaseChip></div>`,
	}),
} satisfies Meta<typeof BaseChip>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте props в панели Controls. Клик по индикатору вызывает событие `click-badge`. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		const badge = canvas.getByText('5')
		await expect(badge.getBoundingClientRect().height).toBe(18)
		await userEvent.click(badge)
		await expect(args['onClick-badge']).toHaveBeenCalledOnce()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Пять вариантов оформления индикатора. Размер и расположение из Controls применяются ко всем примерам. */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'placement'] },
		docs: {
			source: {
				code: ['default', 'soft', 'outline', 'ghost', 'shadow']
					.map(variant => `<BaseChip variant="${variant}" :content="3">…</BaseChip>`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: ['default', 'soft', 'outline', 'ghost', 'shadow'] }),
		template: `
			<div class="story-row" style="gap: 32px; padding: 12px;">
				<div v-for="variant in variants" :key="variant" class="story-col" style="align-items: center;">
					<BaseChip v-bind="props" :variant="variant" :content="3">${ICON_BUTTON}</BaseChip>
					<span class="story-label" style="min-width: 0;">{{ variant }}</span>
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: при 100 индикатор высотой 18px. Кнопка здесь того же размера. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant', 'placement'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseChip :size-scale="${preset.sizeScale}" :content="3">…</BaseChip>`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-row" style="align-items: flex-end; gap: 32px; padding: 12px;">
				<div v-for="preset in presets" :key="preset.name" class="story-col" style="align-items: center;">
					<BaseChip v-bind="props" :size-scale="preset.sizeScale" :content="3">
						<BaseButton variant="outline" aria-label="Уведомления" :size-scale="preset.sizeScale" :padding="{ x: 5, y: 5 }">
							<BaseIcon name="inbox" />
						</BaseButton>
					</BaseChip>
					<span class="story-label" style="min-width: 0;">{{ sizeLabel(preset) }}</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const heights = canvas.getAllByText('3').map(badge => badge.getBoundingClientRect().height)
		await expect(heights[2]).toBe(18)
		await expect(heights[0]).toBeLessThan(heights[4])
	},
}

/** Расположение `placement`: центр индикатора стоит на выбранном углу элемента. */
export const Placements: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: { source: { code: PLACEMENTS.map(placement => `<BaseChip placement="${placement}" :content="7">…</BaseChip>`).join('\n') } },
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args), placements: PLACEMENTS }),
		template: `
			<div class="story-row" style="gap: 40px; padding: 12px;">
				<div v-for="placement in placements" :key="placement" class="story-col" style="align-items: center; gap: 16px;">
					<BaseChip v-bind="props" :placement="placement" :content="7">${ICON_BUTTON}</BaseChip>
					<span class="story-label" style="min-width: 0;">{{ placement }}</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [topRight, , , bottomLeft] = canvas.getAllByText('7')
		const [button] = canvas.getAllByRole('button')
		const buttonRect = button.getBoundingClientRect()
		const badgeRect = topRight.getBoundingClientRect()
		await expect(badgeRect.top + badgeRect.height / 2).toBeCloseTo(buttonRect.top, 0)
		await expect(badgeRect.left + badgeRect.width / 2).toBeCloseTo(buttonRect.right, 0)
		await expect(bottomLeft).toHaveClass('base-chip__badge--bottom-left')
	},
}

/**
 * Кастомный цвет через `color`. Привычный красный счётчик — токены роли error:
 * `{ bg: { base: 'var(--rise-error)' }, text: { base: 'var(--rise-on-error)' } }`, они меняются вместе с темой.
 * Цвет применяется только к индикатору — кнопка в слоте остаётся своего цвета.
 */
export const CustomColor: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'placement'] },
		docs: {
			source: {
				code: `<BaseChip :content="5" :color="{ bg: { base: 'var(--rise-error)' }, text: { base: 'var(--rise-on-error)' } }">…</BaseChip>`,
			},
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'color']) }),
		template: `
			<div class="story-row" style="gap: 32px; padding: 12px;">
				<BaseChip v-bind="props" :content="5">${ICON_BUTTON}</BaseChip>
				<BaseChip v-bind="props" :content="12" :color="{ bg: { base: 'var(--rise-error)' }, text: { base: 'var(--rise-on-error)' } }">
					${ICON_BUTTON}
				</BaseChip>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const primary = canvas.getByText('5')
		const error = canvas.getByText('12')
		await expect(error.style.getPropertyValue('--custom-bg')).toBe('var(--rise-error)')
		await expect(getComputedStyle(error).backgroundColor).not.toBe(getComputedStyle(primary).backgroundColor)
		const [plainButton, coloredButton] = canvas.getAllByRole('button')
		await expect(getComputedStyle(coloredButton).backgroundColor).toBe(getComputedStyle(plainButton).backgroundColor)
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Переполнение: с `hasOverflow` число больше `maxValue` показывается как «99+» (или «9+» при `maxValue` = 9). */
export const Overflow: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseChip :content="8" has-overflow>…</BaseChip>',
					'<BaseChip :content="120" has-overflow>…</BaseChip>',
					'<BaseChip :content="12" has-overflow :max-value="9">…</BaseChip>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'content', 'hasOverflow', 'maxValue']) }),
		template: `
			<div class="story-row" style="gap: 32px; padding: 12px;">
				<BaseChip v-bind="props" :content="8" has-overflow>${ICON_BUTTON}</BaseChip>
				<BaseChip v-bind="props" :content="120" has-overflow>${ICON_BUTTON}</BaseChip>
				<BaseChip v-bind="props" :content="12" has-overflow :max-value="9">${ICON_BUTTON}</BaseChip>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('8')).toBeVisible()
		await expect(canvas.getByText('99+')).toBeVisible()
		await expect(canvas.getByText('9+')).toBeVisible()
	},
}

/** Ноль: по умолчанию «0» виден, с `isHiddenOnZero` индикатор скрыт (слева — без флага, справа — с флагом). */
export const HiddenOnZero: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: ['<BaseChip :content="0">…</BaseChip>', '<BaseChip :content="0" is-hidden-on-zero>…</BaseChip>'].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'content', 'isHiddenOnZero']) }),
		template: `
			<div class="story-row" style="gap: 32px; padding: 12px;">
				<BaseChip v-bind="props" :content="0">${ICON_BUTTON}</BaseChip>
				<BaseChip v-bind="props" :content="0" is-hidden-on-zero>${ICON_BUTTON}</BaseChip>
			</div>
		`,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByText('0')).toBeVisible()
		await expect(canvasElement.querySelectorAll('.base-chip__badge')).toHaveLength(1)
	},
}

/** Текст вместо числа: индикатор растягивается по ширине текста и не переносит его на вторую строку. */
export const LongContent: Story = {
	args: { content: 'Новое обновление' },
	render: args => ({
		components: { BaseChip, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div style="padding: 12px 64px 12px 12px;">
				<BaseChip v-bind="props"><BaseButton variant="outline">Журнал изменений</BaseButton></BaseChip>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const badge = canvas.getByText('Новое обновление')
		const { width, height } = badge.getBoundingClientRect()
		await expect(height).toBe(18)
		await expect(width).toBeGreaterThan(height)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Счётчик корзины: число растёт по клику, пустая корзина без индикатора (`isHiddenOnZero`),
 * больше 9 товаров — «9+». Количество продублировано в доступном имени кнопки.
 */
export const Counter: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'placement'] },
		docs: {
			source: {
				code: [
					'<BaseChip :content="count" is-hidden-on-zero has-overflow :max-value="9">',
					'  <BaseButton variant="outline" :aria-label="`Корзина, товаров: ${count}`" @click="count++">…</BaseButton>',
					'</BaseChip>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'content', 'isHiddenOnZero', 'hasOverflow', 'maxValue']),
			count: ref(0),
		}),
		template: `
			<div style="padding: 12px;">
				<BaseChip v-bind="props" :content="count" is-hidden-on-zero has-overflow :max-value="9">
					<BaseButton variant="outline" :aria-label="'Корзина, товаров: ' + count" :padding="{ x: 5, y: 5 }" @click="count++">
						<BaseIcon name="plus" />
					</BaseButton>
				</BaseChip>
			</div>
		`,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvasElement.querySelector('.base-chip__badge')).toBeNull()
		const button = canvas.getByRole('button', { name: 'Корзина, товаров: 0' })
		await userEvent.click(button)
		await expect(canvas.getByText('1')).toBeVisible()
		await expect(button).toHaveAccessibleName('Корзина, товаров: 1')
	},
}
