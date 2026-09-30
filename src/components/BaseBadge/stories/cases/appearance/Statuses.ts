import { expect } from 'storybook/test'
import type meta from '../../BaseBadge.stories'
import BaseBadge from '../../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const STATUSES = [
	{ label: 'Новый', role: 'info' },
	{ label: 'Оплачен', role: 'success' },
	{ label: 'Ждёт оплаты', role: 'warning' },
	{ label: 'Отменён', role: 'error' },
] as const

const statuses = STATUSES

const template = `
	<div class="story-row">
		<BaseBadge
			v-for="status in statuses"
			:key="status.role"
			v-bind="args"
			:label="status.label"
			:color="{ bg: { base: 'var(--rise-' + status.role + '-soft)' }, text: { base: 'var(--rise-' + status.role + '-text)' } }" />
	</div>
`

export const Statuses: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Статусы: мягкий фон и текст роли через `color` с токенами `--rise-{роль}-soft` и `--rise-{роль}-text`.',
					'Токены пересчитываются в тёмной теме, контраст текста — не ниже 4.5:1.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseBadge'],
				script: `const statuses = ${literal(statuses)}`,
				omit: ['default', 'label', 'variant'],
			}),
		},
	},
	render: args => ({
		components: { BaseBadge },
		setup: useStorySetup(args, { data: { statuses }, slots: ['default', 'label', 'variant'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const paid = canvas.getByText('Оплачен').closest('.base-badge') as HTMLElement
		await expect(paid.style.getPropertyValue('--custom-bg')).toBe('var(--rise-success-soft)')
		await expect(paid.style.getPropertyValue('--custom-text')).toBe('var(--rise-success-text)')
	},
}
