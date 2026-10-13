import type meta from '../../BaseBanner.stories'
import { expect, waitFor } from 'storybook/test'
import BaseBanner from '../../../ui/BaseBanner.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseBanner v-bind="args" v-model:is-open="isOpen" label="Объявление %preset%" />
	`,
	state: { isOpen: true },
	action: 'isOpen = !isOpen',
	trigger: 'Показать или скрыть',
	components: { BaseBanner, BaseButton },
	imports: ['BaseBanner'],
	slots: ['default'],
	omit: ['default', 'isOpen', 'label'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { type: 'success', isClosable: true, text: 'Изменения сохранены. Нажмите «Закрыть», чтобы увидеть уход.' },
	parameters: {
		controls: { include: ['type', 'variant'] },
		docs: {
			description: {
				story: [
					'Появление и уход в четырёх пресетах движения: «Закрыть» или кнопка сверху. Полоса сама анимирует `v-if` внутри себя:',
					'высота, отступы и прозрачность меняются за `--rise-duration`, оборачивать её в `<Transition>` не нужно.',
					'Показом управляет `v-model:is-open`. В `none` и при «уменьшить движение» полоса появляется и уходит сразу.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getAllByRole('button', { name: 'Закрыть' })[0])
		await waitFor(() => expect(canvas.queryAllByRole('region')).toHaveLength(0))
		await userEvent.click(canvas.getByRole('button', { name: 'Показать или скрыть' }))
		await waitFor(() => expect(canvas.getAllByRole('region')).toHaveLength(4))
	},
}
