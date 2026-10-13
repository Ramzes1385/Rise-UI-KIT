import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAvatarGroup.stories'
import BaseAvatarGroup from '../../../ui/BaseAvatarGroup.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-group', more: 'story-themed-more' }

const template = `
	<div class="story-col">
		<BaseAvatarGroup v-bind="args" aria-label="По умолчанию" />
		<div style="--rise-avatar-group-ring: var(--rise-primary); --rise-avatar-group-more-bg: var(--rise-primary-soft); --rise-avatar-group-more-text: var(--rise-primary-text); --rise-avatar-group-more-font-weight: var(--rise-font-weight-bold);">
			<BaseAvatarGroup v-bind="args" aria-label="Токены на контейнере" />
		</div>
		<BaseAvatarGroup v-bind="args" aria-label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'shape', 'max', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-avatar-group-*` кит только читает: `ring` (кольцо между аватарами), `more-bg`,',
					'`more-text`, `more-radius` (форма `square`), `more-width`, `more-height`, `more-font-size`, `more-font-weight` —',
					'задайте их на `:root`, в теме или на контейнере, как здесь. Сами аватары — токены `--rise-avatar-*`.',
					'Проп `ui` добавляет классы к частям (`root`, `item`, `name`, `more`, `count`); глобально — `defaults.BaseAvatarGroup.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseAvatarGroup'], script: `const ui = ${literal(ui)}`, omit: ['ariaLabel'] }),
		},
	},
	render: args => ({
		components: { BaseAvatarGroup },
		setup: useStorySetup(args, { data: { ui }, slots: [] }),
		template,
	}),
	play: async ({ canvas }) => {
		const group = (name: string) => canvas.getByRole('list', { name })
		const more = (name: string) => getComputedStyle(group(name).querySelector('.base-avatar-group__more')!)
		const plain = 'По умолчанию'
		const themed = 'Токены на контейнере'

		await expect(more(themed).backgroundColor).not.toBe(more(plain).backgroundColor)
		await expect(more(themed).boxShadow).not.toBe(more(plain).boxShadow)
		await expect(more(themed).fontWeight).toBe('700')
		await expect(group('Классы через ui')).toHaveClass('base-avatar-group', 'story-themed-group')
		await expect(group('Классы через ui').querySelector('.base-avatar-group__more')).toHaveClass('story-themed-more')
	},
}
