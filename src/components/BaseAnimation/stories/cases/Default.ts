import type meta from '../BaseAnimation.stories'
import { waitFor, expect } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAnimation from '../../ui/BaseAnimation.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { isVisible: 'show' } as const

const template = `
	<div class="story-col" style="min-height: 120px;">
		<BaseButton variant="outline" @click="isVisible = !isVisible">{{ isVisible ? 'Скрыть' : 'Показать' }}</BaseButton>
		<BaseAnimation v-bind="args" :show="isVisible">
			<div class="story-frame">Отчёт за май готов</div>
		</BaseAnimation>
	</div>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		controls: { exclude: ['isGroup', 'tag'] },
		docs: {
			description: {
				story: [
					'Песочница: кнопка переключает `show` (значение синхронизировано с Controls), в Controls выбирается анимация.',
					'После завершения анимации приходят события `after-leave` и `after-enter`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseAnimation', 'BaseButton'], models: MODELS }),
		},
	},
	render: args => ({
		components: { BaseAnimation, BaseButton },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Скрыть' }))
		await waitFor(() => expect(canvas.queryByText('Отчёт за май готов')).not.toBeInTheDocument())
		await waitFor(() => expect(args['onAfter-leave']).toHaveBeenCalled())
		await userEvent.click(canvas.getByRole('button', { name: 'Показать' }))
		await waitFor(() => expect(canvas.getByText('Отчёт за май готов')).toBeVisible())
		await waitFor(() => expect(args['onAfter-enter']).toHaveBeenCalled())
	},
}
