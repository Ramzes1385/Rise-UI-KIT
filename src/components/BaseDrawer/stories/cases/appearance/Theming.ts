import { BaseApp } from '@components/BaseApp'
import { BaseText } from '@components/BaseText'
import type meta from '../../BaseDrawer.stories'
import BaseDrawer from '../../../ui/BaseDrawer.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const OWN_ARGS = ['isOpen', 'title', 'description', 'onUpdate:isOpen']

const ui = { panel: 'story-themed-drawer', title: 'story-themed-title' }

const state = { openFrame: null }

const template = `
	<div class="story-row">
		<div class="story-frame story-medium" style="height: 280px; overflow: hidden; transform: translateZ(0);">
			<BaseApp teleport-to="#drawer-theming-plain">
				<BaseButton variant="outline" @click="openFrame = 'plain'">По умолчанию</BaseButton>
				<BaseDrawer v-bind="args" title="По умолчанию" :is-open="openFrame === 'plain'" @update:is-open="openFrame = null">
					<BaseText>Панель без настроек.</BaseText>
				</BaseDrawer>
				<div id="drawer-theming-plain" />
			</BaseApp>
		</div>
		<div class="story-frame story-medium" style="height: 280px; overflow: hidden; transform: translateZ(0); --rise-drawer-panel-bg: var(--rise-primary-soft); --rise-drawer-panel-text: var(--rise-primary-text); --rise-drawer-panel-radius: var(--rise-radius-xl); --rise-drawer-panel-padding-x: 28px; --rise-drawer-title-font-size: var(--rise-font-size-lg); --rise-drawer-handle-bg: var(--rise-primary);">
			<BaseApp teleport-to="#drawer-theming-tokens">
				<BaseButton variant="outline" @click="openFrame = 'tokens'">Токены на контейнере</BaseButton>
				<BaseDrawer v-bind="args" title="Токены на контейнере" :is-open="openFrame === 'tokens'" @update:is-open="openFrame = null">
					<BaseText>Фон, текст, радиус, отступы и ручка.</BaseText>
				</BaseDrawer>
				<div id="drawer-theming-tokens" />
			</BaseApp>
		</div>
		<div class="story-frame story-medium" style="height: 280px; overflow: hidden; transform: translateZ(0);">
			<BaseApp teleport-to="#drawer-theming-ui">
				<BaseButton variant="outline" @click="openFrame = 'ui'">Классы через ui</BaseButton>
				<BaseDrawer v-bind="args" title="Классы через ui" :ui="ui" :is-open="openFrame === 'ui'" @update:is-open="openFrame = null">
					<BaseText>Классы добавлены к панели и заголовку.</BaseText>
				</BaseDrawer>
				<div id="drawer-theming-ui" />
			</BaseApp>
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['direction', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-drawer-*` кит только читает: `bg` (затемнение), `panel-bg`, `panel-text`,',
					'`panel-border`, `panel-radius`, `panel-shadow`, `panel-width` (боковая панель), `panel-padding-x` (шапка, описание, тело, подвал),',
					'`title-font-size`, `description-text`, `handle-bg` — задайте их на `:root`, в теме или на контейнере.',
					'Панель телепортируется: токены контейнера доходят до неё, только если слой внутри контейнера — здесь `<BaseApp teleport-to>`',
					'(а `transform` рамки держит панель в её пределах). Отступы умножаются на плотность темы `--rise-density`.',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `panel`, `handle`, `header`, `title`,',
					'`close`, `description`, `body`, `footer`); глобально — `defaults.BaseDrawer.ui` плагина.',
					'Панель из области с `data-rise-theme` или `data-rise-motion` наследует её тему и движение.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseApp', 'BaseDrawer', 'BaseButton', 'BaseText'],
				state,
				types: { openFrame: 'string | null' },
				script: `const ui = ${literal(ui)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseApp, BaseDrawer, BaseButton, BaseText },
		setup: useStorySetup(args, { state, data: { ui }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const open = async (name: string): Promise<HTMLElement> => {
			await userEvent.click(canvas.getByRole('button', { name }))
			return canvas.findByRole('dialog', { name })
		}
		const close = async (dialog: HTMLElement): Promise<void> => {
			await userEvent.click(within(dialog).getByRole('button', { name: 'Закрыть' }))
			await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument())
		}

		const plain = await open('По умолчанию')
		const { backgroundColor, borderTopLeftRadius } = getComputedStyle(plain)
		if (!isStoryBranded()) await expect(borderTopLeftRadius).toBe('16px')
		await close(plain)

		const themed = await open('Токены на контейнере')
		await expect(getComputedStyle(themed).backgroundColor).not.toBe(backgroundColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe(borderTopLeftRadius)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('12px')
		await close(themed)

		const classed = await open('Классы через ui')
		await expect(classed).toHaveClass('base-drawer__panel', 'story-themed-drawer')
		await expect(classed.querySelector('.base-drawer__title')).toHaveClass('story-themed-title')
		await close(classed)
	},
}
