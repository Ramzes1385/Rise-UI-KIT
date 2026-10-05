import { docsFrame } from '../../shared'
import { BaseApp } from '@components/BaseApp'
import { expect, screen } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BasePopconfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopconfirm from '../../../ui/BasePopconfirm.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-popconfirm', actions: 'story-themed-actions' }

const template = `
	<div class="story-row" style="align-items: flex-end; gap: 32px; padding-top: 180px;">
		<BasePopconfirm v-bind="args" title="По умолчанию" is-open>
			<BaseButton variant="outline">Снять</BaseButton>
		</BasePopconfirm>
		<div style="--rise-popconfirm-padding: 16px; --rise-popconfirm-gap: 12px; --rise-popconfirm-width: 240px; --rise-popconfirm-title-font-weight: var(--rise-font-weight-bold); --rise-popconfirm-description-text: var(--rise-text);">
			<BaseApp teleport-to="#story-popconfirm-layer">
				<BasePopconfirm v-bind="args" title="Токены на контейнере" is-open>
					<BaseButton variant="outline">Снять</BaseButton>
				</BasePopconfirm>
				<div id="story-popconfirm-layer" />
			</BaseApp>
		</div>
		<BasePopconfirm v-bind="args" title="Классы через ui" is-open :ui="ui">
			<BaseButton variant="outline">Снять</BaseButton>
		</BasePopconfirm>
	</div>
`

const dialogOf = async (name: string): Promise<HTMLElement> => screen.findByRole('alertdialog', { name })

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'isDanger', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-popconfirm-*` кит только читает: `padding`, `gap`, `width` (наибольшая ширина),',
					'`title-text`, `title-font-weight`, `description-text`, `icon-text` (значок опасного действия) — задайте их на `:root`,',
					'в теме или на контейнере. Фон, рамка, радиус и тень панели — общие токены всплывающих панелей `--rise-dropdown-panel-*`.',
					'Панель телепортируется, поэтому токены контейнера доходят до неё, когда контейнер — цель телепорта',
					'(`<BaseApp teleport-to>`, как здесь) или его предок. Отступы умножаются на плотность темы `--rise-density`.',
					'Проп `ui` добавляет классы к частям (`root` — сам вопрос, `panel`, `arrow`, `header`, `icon`, `title`, `description`, `actions`);',
					'глобально — `defaults.BasePopconfirm.ui`.',
				].join('\n'),
			},
			...docsFrame(280),
			source: storySource({
				template,
				imports: ['BasePopconfirm', 'BaseButton', 'BaseApp'],
				script: `const ui = ${literal(ui)}`,
				omit: ['title', 'isOpen', 'onUpdate:isOpen'],
			}),
		},
	},
	render: args => ({
		components: { BasePopconfirm, BaseButton, BaseApp },
		setup: useStorySetup(args, { data: { ui }, slots: [] }),
		template,
	}),
	play: async () => {
		const plain = await dialogOf('По умолчанию')
		const themed = await dialogOf('Токены на контейнере')
		const classed = await dialogOf('Классы через ui')

		await expect(getComputedStyle(themed).paddingLeft).not.toBe(getComputedStyle(plain).paddingLeft)
		await expect(getComputedStyle(themed).rowGap).not.toBe(getComputedStyle(plain).rowGap)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingLeft).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingLeft).toBe('8px')
		await expect(classed).toHaveClass('base-popconfirm', 'story-themed-popconfirm')
		await expect(classed.querySelector('.base-popconfirm__actions')).toHaveClass('story-themed-actions')
	},
}
