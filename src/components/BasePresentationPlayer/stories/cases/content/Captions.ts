import { captionedSlides } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import { PRESENTATION_IMPORTS } from '../../render'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePresentationPlayer.stories'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import BasePresentationPlayer from '../../../ui/BasePresentationPlayer.vue'

const models = { current: 'slide', isCaptionsOn: 'isCaptionsOn' }

const template = `
	<BasePresentationPlayer v-bind="args" v-model:slide="current" v-model:is-captions-on="isCaptionsOn" />
`

const FIRST_CUE = 'Мы делаем курсы для новых сотрудников'

export const Captions: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Субтитры озвучки: `slides[].captions` — адрес файла WebVTT или SRT, время — от начала слайда (у общей дорожки',
					'`audio` — проп `captions`, время от начала дорожки). Вид — плашка субтитров BaseMediaPlayer внизу кадра.',
					'Кнопка «Субтитры» и клавиша C появляются, когда субтитры есть хотя бы у одного слайда; включены —',
					'`v-model:is-captions-on` (по умолчанию да). Файлы здесь — локальные `.vtt` рядом с озвучкой.',
					'Проверка: Tab до «Субтитры», Enter выключает их, клавиша C включает снова.',
				].join('\n'),
			},
			source: storySource({ template, imports: [], importsFrom: PRESENTATION_IMPORTS, models }),
		},
	},
	args: {
		slides: captionedSlides(),
		isCaptionsOn: true,
	},
	render: args => ({
		components: { BasePresentationPlayer },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const button = await canvas.findByRole('button', { name: 'Субтитры' })
		await expect(button).toHaveAttribute('aria-pressed', 'true')
		await waitFor(() => expect(canvas.getByText(FIRST_CUE)).toBeVisible())

		await tabTo(button, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'false'))
		await waitFor(() => expect(canvas.queryByText(FIRST_CUE)).not.toBeInTheDocument())

		await userEvent.keyboard('c')
		await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'))
		await waitFor(() => expect(canvas.getByText(FIRST_CUE)).toBeVisible())
	},
}
