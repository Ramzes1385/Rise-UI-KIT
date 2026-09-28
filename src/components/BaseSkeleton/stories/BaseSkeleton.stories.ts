import { expect } from 'storybook/test'
import BaseSkeleton from '../ui/BaseSkeleton.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ARG_GROUP, hiddenArgTypes, propGroup, SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

const SKELETON_SHAPES = ['text', 'rect', 'circle'] as const

const meta = {
	title: 'Element/BaseSkeleton',
	component: BaseSkeleton,
	parameters: {
		docs: {
			description: {
				component: [
					'Заглушка на месте содержимого, которое загружается: повторяет его форму, чтобы страница не прыгала.',
					'Если форма содержимого неизвестна — `BaseLoader`.',
					'',
					'- Формы: `text` — строка 16px, `rect` — блок (изображение, карточка), `circle` — аватар. Размеры — `width`/`height`.',
					'- Шиммер (`isAnimated`, по умолчанию) и мерцание (`isPulse`) отключаются при системной настройке «уменьшить движение».',
					'- Скелетон скрыт от скринридеров (`aria-hidden`): о загрузке сообщает контейнер — `aria-busy="true"` и подпись.',
				].join('\n'),
			},
		},
	},
	decorators: [() => ({ template: '<div class="story-medium"><story /></div>' })],
	argTypes: {
		...hiddenArgTypes('variant', 'default'),
		shape: { control: 'inline-radio', options: SKELETON_SHAPES, table: propGroup(ARG_GROUP.appearance) },
		width: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
		height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
		color: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
		sizeScale: { control: { type: 'range', min: 50, max: 200, step: 12.5 }, table: propGroup(ARG_GROUP.appearance) },
		customClass: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
		isAnimated: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isPulse: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	},
	args: {
		shape: 'text',
		width: '60%',
		isAnimated: true,
		isPulse: false,
		sizeScale: 100,
	},
} satisfies Meta<typeof BaseSkeleton>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте props в панели Controls. Скелетон декоративный и скрыт от скринридеров. */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const skeleton = canvasElement.querySelector('.base-skeleton') as HTMLElement
		await expect(skeleton).toHaveAttribute('aria-hidden', 'true')
		await expect(skeleton.getBoundingClientRect().height).toBe(16)
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Три формы: строки текста (`text`), блок (`rect`) — изображение или карточка, круг (`circle`) — аватар. */
export const Shapes: Story = {
	parameters: {
		controls: { include: ['isAnimated', 'isPulse', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseSkeleton shape="text" width="80%" />',
					'<BaseSkeleton shape="rect" width="100%" :height="120" />',
					'<BaseSkeleton shape="circle" :width="40" :height="40" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'shape', 'width', 'height']) }),
		template: `
			<div class="story-stack">
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">text</span>
					<BaseSkeleton v-bind="props" shape="text" width="80%" />
				</div>
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">rect</span>
					<BaseSkeleton v-bind="props" shape="rect" width="100%" :height="120" />
				</div>
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">circle</span>
					<BaseSkeleton v-bind="props" shape="circle" :width="40" :height="40" />
				</div>
			</div>
		`,
	}),
}

/** Движение: шиммер (`isAnimated`, по умолчанию), мерцание (`isPulse`) или статичная заглушка. */
export const Animations: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'color'] },
		docs: {
			source: {
				code: [
					'<BaseSkeleton width="100%" :height="32" />',
					'<BaseSkeleton width="100%" :height="32" :is-animated="false" is-pulse />',
					'<BaseSkeleton width="100%" :height="32" :is-animated="false" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'shape', 'width', 'height', 'isAnimated', 'isPulse']) }),
		template: `
			<div class="story-stack">
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">Шиммер</span>
					<BaseSkeleton v-bind="props" width="100%" :height="32" />
				</div>
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">Мерцание</span>
					<BaseSkeleton v-bind="props" width="100%" :height="32" :is-animated="false" is-pulse />
				</div>
				<div class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">Без движения</span>
					<BaseSkeleton v-bind="props" width="100%" :height="32" :is-animated="false" />
				</div>
			</div>
		`,
	}),
}

/** Размеры задаются `sizeScale`: он масштабирует `width`/`height`, высоту строки `text` и скругления. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['isAnimated', 'isPulse'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseSkeleton shape="text" :width="160" :size-scale="${preset.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'shape', 'width', 'height', 'sizeScale']),
			presets: SIZE_PRESETS,
			sizeLabel,
		}),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseSkeleton v-bind="props" shape="circle" :width="32" :height="32" :size-scale="preset.sizeScale" />
					<BaseSkeleton v-bind="props" shape="text" :width="160" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}

/** Свой цвет фона `color` (строка CSS) — например, заглушка на цветной карточке. Здесь — токен мягкого основного цвета. */
export const CustomColor: Story = {
	args: { shape: 'rect', width: '100%', height: 64, color: 'var(--rise-primary-soft)' },
	play: async ({ canvasElement }) => {
		const skeleton = canvasElement.querySelector('.base-skeleton') as HTMLElement
		await expect(skeleton.style.backgroundColor).toBe('var(--rise-primary-soft)')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Заглушка карточки профиля: скелетоны повторяют аватар, имя, должность и описание. Контейнер помечен
 * `aria-busy="true"` и назван «Загрузка профиля» — так скринридер знает, что содержимое ещё грузится.
 */
export const CardPlaceholder: Story = {
	parameters: {
		controls: { include: ['isAnimated', 'isPulse', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<div aria-busy="true" aria-label="Загрузка профиля" role="group">',
					'  <BaseSkeleton shape="circle" :width="40" :height="40" />',
					'  <BaseSkeleton shape="text" width="40%" />',
					'  <BaseSkeleton shape="text" width="25%" :height="12" />',
					'  <BaseSkeleton shape="rect" width="100%" :height="72" />',
					'</div>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSkeleton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'shape', 'width', 'height']) }),
		template: `
			<div class="story-frame" role="group" aria-busy="true" aria-label="Загрузка профиля">
				<div class="story-stack">
					<div class="story-row" style="flex-wrap: nowrap;">
						<BaseSkeleton v-bind="props" shape="circle" :width="40" :height="40" />
						<div class="story-stack" style="gap: 8px;">
							<BaseSkeleton v-bind="props" shape="text" width="40%" />
							<BaseSkeleton v-bind="props" shape="text" width="25%" :height="12" />
						</div>
					</div>
					<BaseSkeleton v-bind="props" shape="rect" width="100%" :height="72" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('group', { name: 'Загрузка профиля' })).toHaveAttribute('aria-busy', 'true')
		for (const skeleton of canvasElement.querySelectorAll('.base-skeleton')) {
			await expect(skeleton).toHaveAttribute('aria-hidden', 'true')
		}
	},
}
