import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../../BaseProgress.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseProgress from '../../../ui/BaseProgress.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Complete: StoryObj<typeof meta> = {
	args: { hasLabel: true, value: 60 },
	parameters: {
		controls: { include: ['sizeScale', 'shape'] },
		docs: {
			description: { story: 'Событие `complete` приходит, когда прогресс доходит до 100%: например, чтобы показать «Готово».' },
			source: { code: '<BaseProgress :value="uploaded" has-label aria-label="Загрузка файла" @complete="onUploaded" />' },
		},
	},
	render: args => ({
		components: { BaseProgress, BaseButton },
		setup: () => {
			const value = ref(args.value)
			const add = (): void => {
				value.value = Math.min(value.value + 20, 100)
			}
			return { props: useArgsWithoutSlots(args, ['default', 'value']), value, add }
		},
		template: `
			<div class="story-stack">
				<BaseProgress v-bind="props" :value="value" aria-label="Загрузка файла" />
				<div>
					<BaseButton variant="outline" @click="add">Загрузить ещё 20%</BaseButton>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Загрузить ещё 20%' })
		await userEvent.click(button)
		await expect(args.onComplete).not.toHaveBeenCalled()
		await userEvent.click(button)
		await expect(canvas.getByRole('progressbar', { name: 'Загрузка файла' })).toHaveAttribute('aria-valuenow', '100')
		await expect(args.onComplete).toHaveBeenCalledOnce()
	},
}
