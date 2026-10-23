import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup, STORY_WAIT_TIMEOUT } from '@/stories/helpers'
import { proposalCard, reviewArgs, reviewControls, reviewImports, reviewModels, reviewTypes } from './reviewShared'

const rejectedTemplate = `
	<BaseRoadmap
		v-bind="args"
		v-model:data="data"
		v-model:mode="mode"
		v-model:review="review"
		:before-change="guardChange" />
`

const rejectedScript = `
// Приложение не даёт применять предложения
function guardChange({ command }: { command: string }): boolean {
	return command !== 'review'
}
`

function rejectedSetup() {
	return { guardChange: ({ command }: { command: string }): boolean => command !== 'review' }
}

export const ReviewRejected: StoryObj<typeof meta> = {
	parameters: {
		controls: reviewControls,
		docs: {
			description: {
				story: [
					'Хук `beforeChange` отвечает `false` на применение предложения. «Принять» ничего не меняет в данных, предложение остаётся открытым,',
					'а над вкладками панели «Правки» появляется плашка «Правка отменена обработчиком приложения» с кнопкой закрытия —',
					'отказ виден не только скринридеру. Закройте плашку, и она исчезнет; «Отклонить» хук не затрагивает.',
				].join('\n'),
			},
			source: storySource({
				template: rejectedTemplate,
				imports: reviewImports,
				models: reviewModels,
				types: reviewTypes,
				script: rejectedScript,
			}),
		},
	},
	args: reviewArgs,
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { models: reviewModels, slots: [], setup: rejectedSetup }),
		template: rejectedTemplate,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const panel = within(await canvas.findByRole('region', { name: 'Правки' }, { timeout: STORY_WAIT_TIMEOUT }))
		const area = within(canvasElement.querySelector('.base-roadmap__area') as HTMLElement)
		const card = proposalCard(canvasElement, 'Переименовать')
		await expect(canvasElement.querySelector('.base-roadmap__edit-reject')).toBeNull()

		await userEvent.click(within(card).getByRole('button', { name: 'Принять' }))
		await waitFor(() => expect(canvasElement.querySelector('.base-roadmap__edit-reject')).not.toBeNull(), {
			timeout: STORY_WAIT_TIMEOUT,
		})
		const notice = canvasElement.querySelector('.base-roadmap__edit-reject') as HTMLElement
		await expect(notice).toBeVisible()
		await expect(notice).toHaveTextContent('Правка отменена обработчиком приложения')
		await expect(notice).not.toHaveAttribute('role')
		await expect(card).not.toHaveTextContent('Принято')
		await expect(within(card).getByRole('button', { name: 'Принять' })).toBeVisible()
		await expect(area.queryByRole('button', { name: /^Vue Router/ })).toBeNull()
		await expect(area.getByRole('button', { name: /^Маршруты/ })).toBeVisible()
		await expect(panel.getByRole('tab', { name: /^Предложения/ })).toHaveTextContent('Предложения 4')

		await userEvent.click(within(notice).getByRole('button', { name: 'Закрыть сообщение' }))
		await waitFor(() => expect(canvasElement.querySelector('.base-roadmap__edit-reject')).toBeNull())
	},
}
