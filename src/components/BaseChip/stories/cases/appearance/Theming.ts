import { expect } from 'storybook/test'
import type meta from '../../BaseChip.stories'
import BaseChip from '../../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-chip', badge: 'story-themed-badge' }

const template = `
	<div class="story-row" style="padding: 12px; gap: 32px;">
		<BaseChip v-bind="args">
			<BaseButton variant="outline" aria-label="По умолчанию" :padding="{ x: 5, y: 5 }"><BaseIcon name="inbox" /></BaseButton>
		</BaseChip>
		<div style="--rise-chip-badge-bg: var(--rise-success); --rise-chip-badge-radius: var(--rise-radius-sm); --rise-chip-badge-height: 22px; --rise-chip-badge-font-weight: var(--rise-font-weight-bold);">
			<BaseChip v-bind="args">
				<BaseButton variant="outline" aria-label="Токены на контейнере" :padding="{ x: 5, y: 5 }"><BaseIcon name="inbox" /></BaseButton>
			</BaseChip>
		</div>
		<BaseChip v-bind="args" :ui="ui">
			<BaseButton variant="outline" aria-label="Классы через ui" :padding="{ x: 5, y: 5 }"><BaseIcon name="inbox" /></BaseButton>
		</BaseChip>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['content', 'variant', 'placement', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены индикатора `--rise-chip-badge-*` — `bg`, `text`, `border`, `radius`, `shadow`',
					'(кольцо вокруг индикатора), `height`, `padding-x`, `font-size`, `font-weight` — кит только читает: задайте их на `:root`,',
					'в теме или на контейнере — как здесь. Проп `ui` добавляет классы к частям (`root`, `badge`);',
					'глобально — `defaults.BaseChip.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseChip', 'BaseButton', 'BaseIcon'],
				script: `const ui = ${literal(ui)}`,
			}),
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const badge = (name: string) =>
			canvas.getByRole('button', { name }).closest('.base-chip')!.querySelector<HTMLElement>('.base-chip__badge')!
		const plain = getComputedStyle(badge('По умолчанию'))
		const themed = getComputedStyle(badge('Токены на контейнере'))

		await expect(themed.backgroundColor).not.toBe(plain.backgroundColor)
		await expect(themed.height).toBe('22px')
		await expect(plain.height).toBe('18px')
		await expect(themed.fontWeight).toBe('700')
		await expect(badge('Классы через ui')).toHaveClass('base-chip__badge', 'story-themed-badge')
		await expect(badge('Классы через ui').closest('.base-chip')).toHaveClass('story-themed-chip')
	},
}
