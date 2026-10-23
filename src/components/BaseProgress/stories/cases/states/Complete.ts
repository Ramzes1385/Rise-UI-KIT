import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../../BaseProgress.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseProgress from '../../../ui/BaseProgress.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseProgress v-bind="args" :value="value" aria-label="Загрузка файла" />
		<div>
			<BaseButton variant="outline" @click="add">Загрузить ещё 20%</BaseButton>
		</div>
	</div>
`

const script = `
	const value = ref(60)

	function add() {
		value.value = Math.min(value.value + 20, 100)
	}
`

export const Complete: StoryObj<typeof meta> = {
	args: { hasLabel: true, value: 60 },
	parameters: {
		controls: { include: ['sizeScale', 'shape'] },
		docs: {
			description: {
				story: [
					'Событие `complete` приходит, когда значение доходит до `max` (не по округлению процента): например, чтобы показать',
					'«Готово». Смонтированный сразу на максимуме прогресс присылает `complete` один раз.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseProgress', 'BaseButton'], vue: ['ref'], script, omit: ['default', 'value'] }),
		},
	},
	render: args => {
		const value = ref(args.value)
		const add = (): void => {
			value.value = Math.min(value.value + 20, 100)
		}
		return {
			components: { BaseProgress, BaseButton },
			setup: useStorySetup(args, { slots: ['default', 'value'], data: { value, add } }),
			template,
		}
	},
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Загрузить ещё 20%' })
		await userEvent.click(button)
		await expect(args.onComplete).not.toHaveBeenCalled()
		await userEvent.click(button)
		const progressbar = canvas.getByRole('progressbar', { name: 'Загрузка файла' })
		await expect(progressbar).toHaveAttribute('aria-valuenow', '100')
		await expect(progressbar).toHaveAttribute('aria-valuetext', 'Выполнено 100%')
		await expect(args.onComplete).toHaveBeenCalledOnce()
	},
}
