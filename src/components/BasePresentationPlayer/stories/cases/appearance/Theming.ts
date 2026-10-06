import { notedSlides } from '../../shared'
import { PRESENTATION_IMPORTS } from '../../render'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import type meta from '../../BasePresentationPlayer.stories'
import BasePresentationPlayer from '../../../ui/BasePresentationPlayer.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-presentation', stage: 'story-themed-stage', notes: 'story-themed-notes' }

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px">
		<BasePresentationPlayer v-bind="args" title="По умолчанию" />
		<div style="--rise-presentation-player-next-ring: var(--rise-success); --rise-presentation-player-notes-text: var(--rise-media-accent-light); --rise-presentation-player-notes-padding-x: 32px; --rise-presentation-player-notes-padding-y: 24px; --rise-presentation-player-notes-font-size: var(--rise-font-size-lg); --rise-presentation-player-done-bg: var(--rise-media-scrim);">
			<BasePresentationPlayer v-bind="args" title="Токены на контейнере" />
		</div>
		<BasePresentationPlayer v-bind="args" title="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { navigation: 'linear', slides: notedSlides({ minDuration: 30 }) },
	parameters: {
		a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
		maxWidth: 1400,
		controls: { include: ['navigation', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-presentation-player-*` кит только читает — задайте их на `:root`, в теме или',
					'на контейнере: кольцо замка у «Далее» — `next-ring`; экран «Пройдено» — `done-bg`, `done-gap`, `done-padding`,',
					'`done-icon-size`, `done-title-font-size`, `done-title-font-weight`; стенограмма — `notes-text`, `notes-padding-x`,',
					'`notes-padding-y`, `notes-font-size` (список — docs/design/COMPONENT_TOKENS.md). Оболочка плеера — токены',
					'`--rise-media-player-*` BaseMediaPlayer, цвета поверх слайдов — медиа-токены темы `--rise-media-*`. Отступы экрана',
					'«Пройдено» и стенограммы умножаются на плотность темы `--rise-density`. Проп `ui` добавляет классы к частям',
					'(`root`, `stage`, `slide`, `next`, `done`, `panel`, `notes`… — `PRESENTATION_PLAYER_PARTS`); для всех плееров',
					'приложения — `defaults.BasePresentationPlayer.ui` плагина. Проверка: у каждого плеера открыта «Стенограмма».',
					'Одинаковые экземпляры для сравнения — регионы с одним именем, поэтому правило axe `landmark-unique` у этой истории выключено.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: PRESENTATION_IMPORTS,
				script: `const ui = ${literal(ui)}`,
				omit: ['title'],
			}),
		},
	},
	render: args => ({
		components: { BasePresentationPlayer },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement, userEvent }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-presentation-player')]
		const part = (player: HTMLElement, name: string) => player.querySelector<HTMLElement>(`.base-presentation-player__${name}`)!

		await waitFor(() => expect(part(themed, 'ring-fill')).toBeInTheDocument())
		await expect(getComputedStyle(part(themed, 'ring-fill')).stroke).not.toBe(getComputedStyle(part(plain, 'ring-fill')).stroke)

		for (const player of [plain, themed, classed]) await userEvent.click(within(player).getByRole('button', { name: 'Стенограмма' }))
		await waitFor(() => expect(part(themed, 'notes')).toBeVisible())
		await waitFor(() => expect(part(plain, 'notes')).toBeVisible())
		await expect(getComputedStyle(part(themed, 'notes')).color).not.toBe(getComputedStyle(part(plain, 'notes')).color)
		await expect(getComputedStyle(part(themed, 'notes')).paddingLeft).not.toBe(getComputedStyle(part(plain, 'notes')).paddingLeft)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(part(plain, 'notes')).paddingLeft).toBe('20px')
			await expect(getComputedStyle(part(themed, 'notes')).paddingLeft).toBe('32px')
			await expect(getComputedStyle(part(plain, 'notes')).fontSize).toBe('15px')
			await expect(getComputedStyle(part(themed, 'notes')).fontSize).toBe('18px')
		}
		await expect(classed).toHaveClass('base-presentation-player', 'base-media-player', 'story-themed-presentation')
		await expect(part(classed, 'stage')).toHaveClass('story-themed-stage')
		await waitFor(() => expect(part(classed, 'notes')).toHaveClass('base-presentation-player__notes', 'story-themed-notes'))
	},
}
