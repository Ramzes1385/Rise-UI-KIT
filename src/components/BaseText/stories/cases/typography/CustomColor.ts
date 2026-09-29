import { expect } from 'storybook/test'
import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'weight'] },
		docs: {
			description: {
				story: [
					'Цвет через `color: { text: { base } }`. Берите токены темы — тогда цвет меняется вместе с темой:',
					'`--rise-text-highlighted` для заголовков, `--rise-text-muted` для подписей, цвет роли для статусов.',
				].join('\n'),
			},
			source: {
				code: [
					`<BaseText :color="{ text: { base: 'var(--rise-text-highlighted)' } }">Заголовок</BaseText>`,
					`<BaseText :color="{ text: { base: 'var(--rise-text-muted)' } }">Подпись</BaseText>`,
					`<BaseText :color="{ text: { base: 'var(--rise-success)' } }">Оплачено</BaseText>`,
					`<BaseText :color="{ text: { base: 'var(--rise-error)' } }">Просрочено</BaseText>`,
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseText },
		setup: () => ({
			props: useArgsWithoutSlots(args),
			samples: [
				{ token: '--rise-text-highlighted', label: 'Заголовок' },
				{ token: '--rise-text', label: 'Основной текст' },
				{ token: '--rise-text-muted', label: 'Подпись' },
				{ token: '--rise-primary', label: 'Акцент' },
				{ token: '--rise-success', label: 'Оплачено' },
				{ token: '--rise-error', label: 'Просрочено' },
			],
		}),
		template: `
			<div class="story-col">
				<div v-for="sample in samples" :key="sample.token" class="story-row">
					<span class="story-label">{{ sample.token }}</span>
					<BaseText v-bind="props" :color="{ text: { base: 'var(' + sample.token + ')' } }">{{ sample.label }}</BaseText>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const overdue = canvas.getByText('Просрочено')
		await expect(overdue.style.getPropertyValue('--custom-text')).toBe('var(--rise-error)')
		await expect(getComputedStyle(overdue).color).not.toBe(getComputedStyle(canvas.getByText('Основной текст')).color)
	},
}
