import { ref } from 'vue'
import { expect, fn, waitFor } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import BasePagination from '../ui/BasePagination.vue'
import { PAGINATION_VARIANTS } from '../types/BasePagination.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Ключи args, которые витрины задают сами (у каждого экземпляра своя страница). */
const MODEL_KEYS = ['modelValue', 'onUpdate:modelValue']

const meta = {
	title: 'Navigation/BasePagination',
	component: BasePagination,
	parameters: {
		docs: {
			description: {
				component: [
					'Пагинация переключает страницы списка или таблицы: стрелки «назад»/«вперёд», первая и последняя страницы,',
					'соседние с текущей и многоточия между разрывами.',
					'',
					'- `v-model` — номер текущей страницы (с 1); `total` и `pageSize` задают число страниц.',
					'- Кнопки — `BaseButton` высотой 32px. `variant` задаёт вид стрелок и номеров (при `default` — ghost),',
					'  текущая страница всегда залита основным цветом и помечена `aria-current="page"`.',
					'- Стрелки блокируются на краях и когда страниц нет; со страницы вне диапазона «назад» ведёт на последнюю.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: PAGINATION_VARIANTS }),
		modelValue: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.content) },
		total: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.content) },
		pageSize: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.content) },
		maxVisible: { control: { type: 'number', min: 3, max: 15 }, table: propGroup(ARG_GROUP.behavior) },
		showLastPage: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	},
	args: {
		modelValue: 1,
		total: 120,
		pageSize: 10,
		maxVisible: 7,
		showLastPage: true,
		variant: 'default',
		sizeScale: 100,
		'onUpdate:modelValue': fn(),
		onChange: fn(),
	},
	// Страница хранится в args: клик по странице обновляет Controls, а изменение в Controls — пагинацию.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BasePagination },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<BasePagination v-bind="props" @update:model-value="onUpdate" />',
		}
	},
} satisfies Meta<typeof BasePagination>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: клик по номеру или стрелке меняет страницу — значение синхронизировано с Controls. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('button', { name: 'Предыдущая страница' })).toBeDisabled()

		await userEvent.click(canvas.getByRole('button', { name: '3' }))
		await expect(args.onChange).toHaveBeenCalledWith(3)
		// Страница живёт в args: aria-current переходит на «3», когда значение вернулось в v-model
		await waitFor(() => expect(canvas.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page'))

		await userEvent.click(canvas.getByRole('button', { name: 'Следующая страница' }))
		await expect(args.onChange).toHaveBeenLastCalledWith(4)
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Варианты задают вид стрелок и неактивных страниц: `default` — ghost, остальные — одноимённый вариант BaseButton.
 * Текущая страница всегда залита основным цветом.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'total', 'pageSize'] },
		docs: {
			source: {
				code: PAGINATION_VARIANTS.map(variant => `<BasePagination v-model="page" :total="120" variant="${variant}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BasePagination },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...MODEL_KEYS, 'variant']),
			variants: PAGINATION_VARIANTS,
			pages: ref<Record<string, number>>(Object.fromEntries(PAGINATION_VARIANTS.map(variant => [variant, 5]))),
		}),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BasePagination v-bind="props" v-model="pages[variant]" :variant="variant" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: кнопки 24, 28, 32, 36 и 40px — как у BaseButton того же размера. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(p => `<BasePagination v-model="page" :total="120" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BasePagination },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...MODEL_KEYS, 'sizeScale']),
			presets: SIZE_PRESETS,
			sizeLabel,
			pages: ref<Record<string, number>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 5]))),
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BasePagination v-bind="props" v-model="pages[preset.name]" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: `bg`/`text` c ключами `base` и `hover` красят стрелки и номера страниц,
 * `active` — текущую страницу.
 */
export const CustomColor: Story = {
	args: {
		modelValue: 4,
		color: {
			bg: { base: '#eff6ff', hover: '#dbeafe', active: '#1d4ed8' },
			text: { base: '#1e3a8a', active: '#ffffff' },
		},
	},
	play: async ({ canvas }) => {
		await expect(getComputedStyle(canvas.getByRole('button', { name: '4' })).backgroundColor).toBe('rgb(29, 78, 216)')
		await expect(getComputedStyle(canvas.getByRole('button', { name: '3' })).color).toBe('rgb(30, 58, 138)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Нет данных (`total` = 0): номеров нет, обе стрелки заблокированы. */
export const Empty: Story = {
	args: { total: 0 },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Предыдущая страница' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Следующая страница' })).toBeDisabled()
		await expect(canvas.queryByRole('button', { current: 'page' })).toBeNull()
	},
}

/**
 * Текущая страница вне диапазона (например, после фильтрации их стало меньше): «вперёд» заблокирована,
 * «назад» ведёт на последнюю существующую страницу.
 */
export const OutOfRange: Story = {
	args: { modelValue: 7, total: 30 },
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('button', { name: 'Следующая страница' })).toBeDisabled()
		await userEvent.click(canvas.getByRole('button', { name: 'Предыдущая страница' }))
		await expect(args.onChange).toHaveBeenCalledWith(3)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Много страниц: вокруг текущей — соседние номера, по краям — первая и последняя, разрывы заменяет «…». */
export const ManyPages: Story = {
	args: { modelValue: 25, total: 500 },
	play: async ({ canvas }) => {
		await expect(canvas.getAllByText('…')).toHaveLength(2)
		await expect(canvas.getByRole('button', { name: '50' })).toBeVisible()
	},
}

/** `showLastPage: false` — последняя страница не показывается: удобно, когда общее число страниц неизвестно или огромно. */
export const WithoutLastPage: Story = {
	args: { modelValue: 3, total: 500, showLastPage: false },
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('button', { name: '50' })).toBeNull()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: кнопки страниц и стрелки достижимы по Tab (заблокированная стрелка пропускается), Enter переключает
 * страницу. Кольцо фокуса видно только при навигации с клавиатуры.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const second = canvas.getByRole('button', { name: '2' })
		await tabTo(second, userEvent)
		await expect(getComputedStyle(second).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(args.onChange).toHaveBeenCalledWith(2)
		await waitFor(() => expect(canvas.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page'))
	},
}
