import { expect } from 'storybook/test'
import BaseContainer from '../ui/BaseContainer.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CONTAINER_SIZES } from '../types/BaseContainer.types'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup, useArgsWithoutSlots } from '@/stories/helpers'

const DEMO_STYLE = 'padding: 16px; border: 1px dashed var(--rise-border-accented); border-radius: 8px'

const meta = {
	title: 'Layout/BaseContainer',
	component: BaseContainer,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: [
					'Контейнер страницы: ограничивает ширину содержимого, центрирует его и даёт боковые отступы.',
					'',
					'- `size` — наибольшая ширина вместе с отступами: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `full` — без ограничения.',
					'- Боковые отступы растут с экраном: 16px, от 640px — 24px, от 1024px — 32px (`sizeScale` масштабирует их).',
					'- `tag` — тег корня: `section`, `article`…',
					'',
					'Ту же ширину принимают BaseHeader и BaseFooter (`containerSize`), чтобы шапка, содержимое и подвал были на одной линии.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes(),
		...hiddenArgTypes('variant', 'color'),
		size: { control: 'inline-radio', options: CONTAINER_SIZES, table: propGroup(ARG_GROUP.appearance) },
		tag: { control: 'text', table: propGroup(ARG_GROUP.content) },
	},
	args: {
		size: 'md',
		tag: 'div',
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseContainer },
		setup: () => ({ props: useArgsWithoutSlots(args), demoStyle: DEMO_STYLE }),
		template: `
			<BaseContainer v-bind="props">
				<div :style="demoStyle">
					<h2 style="margin: 0 0 8px">Отчёт за сентябрь</h2>
					<p style="margin: 0">Текст не растягивается на всю ширину широкого экрана: строки остаются удобной длины.</p>
				</div>
			</BaseContainer>
		`,
	}),
} satisfies Meta<typeof BaseContainer>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте `size` в Controls. */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const container = canvasElement.querySelector('.base-container') as HTMLElement
		await expect(getComputedStyle(container).maxWidth).toBe('768px')
		await expect(getComputedStyle(container).marginLeft).toBe(getComputedStyle(container).marginRight)
	},
}

// ─── Ширины ────────────────────────────────────────────────────────────────────

/** Все ширины: на экране уже 1280px `xl` и `full` совпадают. */
export const Sizes: Story = {
	parameters: { controls: { include: ['sizeScale'] } },
	render: args => ({
		components: { BaseContainer },
		setup: () => ({ props: useArgsWithoutSlots(args, ['size']), sizes: CONTAINER_SIZES, demoStyle: DEMO_STYLE }),
		template: `
			<div class="story-stack">
				<BaseContainer v-for="size in sizes" :key="size" v-bind="props" :size="size">
					<div :style="demoStyle">{{ size }}</div>
				</BaseContainer>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const small = canvasElement.querySelector('.base-container--sm') as HTMLElement
		await expect(getComputedStyle(small).maxWidth).toBe('640px')
	},
}
