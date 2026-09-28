import type meta from '../BaseAnimation.stories'
import { waitFor, expect } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAnimation from '../../ui/BaseAnimation.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

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
			source: {
				code: [
					'<BaseButton variant="outline" @click="isVisible = !isVisible">{{ isVisible ? \'Скрыть\' : \'Показать\' }}</BaseButton>',
					'<BaseAnimation :show="isVisible" name="slide-down">',
					'  <div class="banner">Отчёт за май готов</div>',
					'</BaseAnimation>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const setShow = useModelArg('show')
		return {
			components: { BaseAnimation, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args), args, toggle: () => setShow(!args.show) }),
			template: `
				<div class="story-col" style="min-height: 120px;">
					<BaseButton variant="outline" @click="toggle">{{ args.show ? 'Скрыть' : 'Показать' }}</BaseButton>
					<BaseAnimation v-bind="props">
						<div class="story-frame">Отчёт за май готов</div>
					</BaseAnimation>
				</div>
			`,
		}
	},
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Скрыть' }))
		await waitFor(() => expect(canvas.queryByText('Отчёт за май готов')).not.toBeInTheDocument())
		await waitFor(() => expect(args['onAfter-leave']).toHaveBeenCalled())
		await userEvent.click(canvas.getByRole('button', { name: 'Показать' }))
		await waitFor(() => expect(canvas.getByText('Отчёт за май готов')).toBeVisible())
		await waitFor(() => expect(args['onAfter-enter']).toHaveBeenCalled())
	},
}
