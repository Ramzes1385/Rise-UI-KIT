import { expect } from 'storybook/test'
import { CONTENT_ARGS } from '../../shared'
import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-avatar', initials: 'story-themed-initials' }

const template = `
	<div class="story-row">
		<BaseAvatar v-bind="args" name="Анна Смирнова" />
		<div style="--rise-avatar-width: 48px; --rise-avatar-bg: var(--rise-primary-soft); --rise-avatar-text: var(--rise-primary-text); --rise-avatar-font-weight: var(--rise-font-weight-bold); --rise-avatar-online-bg: var(--rise-info);">
			<BaseAvatar v-bind="args" name="Иван Петров" />
		</div>
		<BaseAvatar v-bind="args" name="Мария Кузнецова" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	args: { isOnline: true },
	parameters: {
		controls: { include: ['variant', 'shape', 'sizeScale', 'isOnline'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-avatar-*` кит только читает: `width`, `height` (по умолчанию = `width`), `bg`,',
					'`text`, `border`, `radius` (форма `square`), `shadow`, `font-size`, `font-weight`, `online-bg` — задайте их на `:root`,',
					'в теме или на контейнере, как здесь. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `content`, `img`, `initials`, `online`, `mascot`);',
					'глобально — `defaults.BaseAvatar.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseAvatar'], script: `const ui = ${literal(ui)}`, omit: CONTENT_ARGS }),
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup: useStorySetup(args, { data: { ui }, slots: CONTENT_ARGS }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-avatar')]
		const content = (avatar: HTMLElement) => getComputedStyle(avatar.querySelector('.base-avatar__content')!)
		const online = (avatar: HTMLElement) => getComputedStyle(avatar.querySelector('.base-avatar__online')!).backgroundColor

		await expect(getComputedStyle(themed).width).toBe('48px')
		await expect(getComputedStyle(themed).height).toBe('48px')
		await expect(getComputedStyle(plain).width).toBe('36px')
		await expect(content(themed).backgroundColor).not.toBe(content(plain).backgroundColor)
		await expect(content(themed).fontWeight).toBe('700')
		await expect(online(themed)).not.toBe(online(plain))
		await expect(classed).toHaveClass('base-avatar', 'story-themed-avatar')
		await expect(classed.querySelector('.base-avatar__initials')).toHaveClass('story-themed-initials')
	},
}
