import { expect } from 'storybook/test'
import type meta from '../BaseIcon.stories'
import BaseIcon from '../../ui/BaseIcon.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['name', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Цвет: без `color` иконка берёт цвет текста вокруг (`currentColor`), с `color` — заданный.',
					'Используйте токены: `var(--rise-text-muted)` для второстепенных иконок, цвет роли для статусов.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseIcon name="info" color="var(--rise-info)" />',
					'<BaseIcon name="check-circle" color="var(--rise-success)" />',
					'<BaseIcon name="alert-triangle" color="var(--rise-warning)" />',
					'<BaseIcon name="x-circle" color="var(--rise-error)" />',
					'<BaseIcon name="search" color="var(--rise-text-muted)" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseIcon },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['name', 'color']),
			samples: [
				{ name: 'info', token: '--rise-info' },
				{ name: 'check-circle', token: '--rise-success' },
				{ name: 'alert-triangle', token: '--rise-warning' },
				{ name: 'x-circle', token: '--rise-error' },
				{ name: 'search', token: '--rise-text-muted' },
			],
		}),
		template: `
			<div class="story-col">
				<div v-for="sample in samples" :key="sample.token" class="story-row">
					<BaseIcon v-bind="props" :name="sample.name" :color="'var(' + sample.token + ')'" />
					<span class="story-label">{{ sample.token }}</span>
				</div>
				<div class="story-row" style="gap: 6px; color: var(--rise-primary);">
					<BaseIcon v-bind="props" name="star" />
					<span>Без color — цвет текста вокруг</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [info, , , error] = canvasElement.querySelectorAll('svg')
		await expect(error.style.color).toBe('var(--rise-error)')
		await expect(getComputedStyle(error).color).not.toBe(getComputedStyle(info).color)
	},
}
