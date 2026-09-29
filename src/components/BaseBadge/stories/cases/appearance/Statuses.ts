import { expect } from 'storybook/test'
import type meta from '../../BaseBadge.stories'
import BaseBadge from '../../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

const STATUSES = [
	{ label: 'Новый', role: 'info' },
	{ label: 'Оплачен', role: 'success' },
	{ label: 'Ждёт оплаты', role: 'warning' },
	{ label: 'Отменён', role: 'error' },
] as const

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
			source: {
				code: STATUSES.map(
					({ label, role }) =>
						`<BaseBadge label="${label}" :color="{ bg: { base: 'var(--rise-${role}-soft)' }, text: { base: 'var(--rise-${role}-text)' } }" />`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseBadge },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label', 'variant']), statuses: STATUSES }),
		template: `
			<div class="story-row">
				<BaseBadge
					v-for="status in statuses"
					:key="status.role"
					v-bind="props"
					:label="status.label"
					:color="{ bg: { base: 'var(--rise-' + status.role + '-soft)' }, text: { base: 'var(--rise-' + status.role + '-text)' } }" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const paid = canvas.getByText('Оплачен').closest('.base-badge') as HTMLElement
		await expect(paid.style.getPropertyValue('--custom-bg')).toBe('var(--rise-success-soft)')
		await expect(paid.style.getPropertyValue('--custom-text')).toBe('var(--rise-success-text)')
	},
}
