import { expect } from 'storybook/test'
import type meta from '../../BaseUser.stories'
import BaseUser from '../../../ui/BaseUser.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-user', name: 'story-themed-name' }

const template = `
	<div class="story-stack">
		<BaseUser v-bind="args" description="По умолчанию" />
		<div style="--rise-user-gap: calc(var(--rise-control-gap) * 2); --rise-user-text: var(--rise-primary-text); --rise-user-name-font-weight: var(--rise-font-weight-bold); --rise-user-description-text: var(--rise-text-toned);">
			<BaseUser v-bind="args" description="Токены на контейнере" />
		</div>
		<BaseUser v-bind="args" description="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['name', 'isOnline', 'orientation', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены компонента кит только читает: задайте их на `:root`, в теме или на контейнере — как здесь.',
					'Блок: `--rise-user-gap` (отступ аватара, умножается на плотность темы), `--rise-user-text` (цвет имени),',
					'`--rise-user-radius` (скругление ссылки); имя: `--rise-user-name-font-size`, `--rise-user-name-font-weight`;',
					'подпись: `--rise-user-description-font-size`, `--rise-user-description-text`. Аватар настраивается своими токенами',
					'`--rise-avatar-*` — BaseUser их не перекрывает. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `avatar`, `text`, `name`, `status`, `description`);',
					'глобально — `defaults.BaseUser.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseUser'], script: `const ui = ${literal(ui)}`, omit: ['description'] }),
		},
	},
	render: args => ({
		components: { BaseUser },
		setup: useStorySetup(args, { data: { ui }, slots: [] }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByText('По умолчанию').closest('.base-user')!
		const themed = canvas.getByText('Токены на контейнере').closest('.base-user')!
		const classed = canvas.getByText('Классы через ui').closest('.base-user')!
		const plainName = plain.querySelector('.base-user__name')!
		const themedName = themed.querySelector('.base-user__name')!

		await expect(getComputedStyle(plain).columnGap).toBe('8px')
		await expect(getComputedStyle(themed).columnGap).toBe('12px')
		await expect(getComputedStyle(themedName).color).not.toBe(getComputedStyle(plainName).color)
		await expect(getComputedStyle(themedName).fontWeight).toBe('700')
		await expect(getComputedStyle(plainName).fontWeight).toBe('500')
		await expect(classed).toHaveClass('base-user', 'story-themed-user')
		await expect(classed.querySelector('.base-user__name')).toHaveClass('story-themed-name')
	},
}
