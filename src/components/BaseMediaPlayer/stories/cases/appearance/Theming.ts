import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import BaseMediaPlayer from '../../../ui/BaseMediaPlayer.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-player', controls: 'story-themed-controls', title: 'story-themed-title' }

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px">
		<BaseMediaPlayer v-bind="args" title="По умолчанию" />
		<div style="--rise-media-player-radius: var(--rise-radius-2xl); --rise-media-player-progress-bg: var(--rise-success); --rise-media-player-thumb-bg: var(--rise-success); --rise-media-player-title-font-size: var(--rise-font-size-sm); --rise-media-player-title-font-weight: var(--rise-font-weight-medium);">
			<BaseMediaPlayer v-bind="args" title="Токены на контейнере" />
		</div>
		<BaseMediaPlayer v-bind="args" title="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-media-player-*` кит только читает — задайте их на `:root`, в теме или на',
					'контейнере: `radius`, `bg`, `text`; панели и меню — `panel-bg`, `dialog-bg`, `menu-radius`, шторка серий —',
					'`episodes-bg`; шкала — `progress-bg`, `thumb-bg`; название — `title-font-size`, `title-font-weight` (список —',
					'docs/design/COMPONENT_TOKENS.md). Общие цвета поверх видео — медиа-токены темы `--rise-media-*`: акцент',
					'`--rise-media-accent`, панели `--rise-media-panel`, реклама `--rise-media-ad`, тени и затемнения — от',
					'`--rise-media-shade`. Проп `ui` добавляет классы к частям (`root`, `media`, `controls`, `seek`, `title`… —',
					'`MEDIA_PLAYER_PARTS`); для всех плееров приложения — `defaults.BaseMediaPlayer.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/media': ['BaseMediaPlayer'] },
				script: `const ui = ${literal(ui)}`,
				omit: ['title'],
			}),
		},
	},
	render: args => ({
		components: { BaseMediaPlayer },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-media-player')]
		const part = (player: HTMLElement, name: string) => player.querySelector<HTMLElement>(`.base-media-player__${name}`)!

		await waitFor(() => expect(part(themed, 'slider-fill')).toBeInTheDocument())
		await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe(getComputedStyle(plain).borderTopLeftRadius)
		await expect(getComputedStyle(part(themed, 'slider-fill')).backgroundColor).not.toBe(
			getComputedStyle(part(plain, 'slider-fill')).backgroundColor,
		)
		await expect(getComputedStyle(part(themed, 'title')).fontWeight).not.toBe(getComputedStyle(part(plain, 'title')).fontWeight)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(plain).borderTopLeftRadius).toBe('12px')
			await expect(getComputedStyle(part(plain, 'title')).fontSize).toBe('18px')
			await expect(getComputedStyle(part(themed, 'title')).fontSize).toBe('14px')
		}
		await expect(classed).toHaveClass('base-media-player', 'story-themed-player')
		await expect(part(classed, 'controls')).toHaveClass('story-themed-controls')
		await expect(part(classed, 'title')).toHaveClass('base-media-player__title', 'story-themed-title')
	},
}
