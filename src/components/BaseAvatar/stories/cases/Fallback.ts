import type meta from '../BaseAvatar.stories'
import { CONTENT_ARGS, ivan } from '../shared'
import BaseAvatar from '../../ui/BaseAvatar.vue'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { BROKEN_IMAGE_SRC, literal, storySource, useStorySetup } from '@/stories/helpers'

const brokenSrc = BROKEN_IMAGE_SRC

const template = `
	<div class="story-row" style="align-items: flex-start;">
		<div class="story-col" style="align-items: center; text-align: center;">
			<BaseAvatar v-bind="args" :src="brokenSrc" :name="ivan.name" />
			<span class="story-label">Ошибка загрузки</span>
		</div>
		<div class="story-col" style="align-items: center; text-align: center;">
			<BaseAvatar v-bind="args" :name="ivan.name" />
			<span class="story-label">Без изображения</span>
		</div>
		<div class="story-col" style="align-items: center; text-align: center;">
			<BaseAvatar v-bind="args" />
			<span class="story-label">Без имени</span>
		</div>
	</div>
`

export const Fallback: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Запасное содержимое: изображение не загрузилось — инициалы из `name`; нет изображения — тоже инициалы;',
					'нет ни изображения, ни имени — «?».',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAvatar'],
				script: [`const brokenSrc = ${literal(brokenSrc)}`, `const ivan = ${literal(ivan)}`].join('\n'),
				omit: CONTENT_ARGS,
			}),
		},
		controls: { include: ['variant', 'sizeScale', 'shape'] },
	},
	render: args => ({
		components: { BaseAvatar },
		setup: useStorySetup(args, { data: { brokenSrc, ivan }, slots: CONTENT_ARGS }),
		template,
	}),
	play: async ({ canvas }) => {
		await waitFor(() => expect(canvas.getAllByText('ИП')).toHaveLength(2))
		await expect(canvas.queryByRole('img')).not.toBeInTheDocument()
		await expect(canvas.getByText('?')).toBeVisible()
	},
}
