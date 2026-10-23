import { expect } from 'storybook/test'
import type meta from '../../BaseImage.stories'
import BaseImage from '../../../ui/BaseImage.vue'
import { expectImagesVisible } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-image', img: 'story-themed-img' }

const template = `
	<div class="story-row">
		<BaseImage v-bind="args" />
		<div style="--rise-image-radius: var(--rise-radius-full); --rise-image-bg: var(--rise-bg-muted);">
			<BaseImage v-bind="args" />
		</div>
		<BaseImage v-bind="args" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { width: 200, height: 200 },
	parameters: {
		controls: { include: ['src', 'fit', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-image-*` кит только читает —',
					'задайте их на `:root`, в теме или на контейнере: `radius`, `bg`, `placeholder-bg`, `error-bg`, `error-text`; окно просмотра —',
					'`zoom-bg`, `zoom-text`, `zoom-toolbar-bg`, `zoom-toolbar-radius`, `zoom-thumb-ring-selected`. Окно просмотра телепортируется',
					'в `body`, поэтому его токены задавайте на `:root` или в теме. Проп `borderRadius` сильнее токена. Проп `ui` добавляет классы',
					'к частям (`root`, `placeholder`, `img`, `zoom`, `zoom-toolbar`… — список в `IMAGE_PARTS`); глобально — `defaults.BaseImage.ui`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseImage'], script: `const ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseImage },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		await expectImagesVisible(canvasElement, 3)
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-image')]

		if (!isStoryBranded()) await expect(getComputedStyle(plain).borderTopLeftRadius).toBe('6px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(classed).toHaveClass('base-image', 'story-themed-image')
		await expect(classed.querySelector('.base-image__img')).toHaveClass('story-themed-img')
	},
}
