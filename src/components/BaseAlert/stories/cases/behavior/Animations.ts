import type meta from '../../BaseAlert.stories'
import { expect, waitFor } from 'storybook/test'
import BaseAlert from '../../../ui/BaseAlert.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<Transition name="base-alert">
			<BaseAlert v-if="isOpen" v-bind="args" @close="isOpen = false" />
		</Transition>
	`,
	state: { isOpen: true },
	action: 'isOpen = !isOpen',
	trigger: 'Показать или скрыть',
	components: { BaseAlert, BaseButton },
	imports: ['BaseAlert'],
	slots: ['default', 'actions'],
	omit: ['default', 'actions'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { type: 'success', isClosable: true, title: 'Изменения сохранены', description: 'Нажмите «Закрыть», чтобы увидеть уход.' },
	parameters: {
		controls: { include: ['type', 'variant'] },
		docs: {
			description: {
				story: [
					'Появление и уход в четырёх пресетах движения: «Закрыть» или кнопка сверху. Рецепт: `<Transition name="base-alert">`',
					'вокруг `v-if` — классы перехода на токенах есть в ките: прозрачность и масштаб (`--rise-duration`, `--rise-duration-fast`,',
					'`--rise-motion-scale-from`). Событие `close` приходит сразу, скрывает алерт приложение. В `none` и при «уменьшить движение» — сразу.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getAllByRole('button', { name: 'Закрыть' })[0])
		await waitFor(() => expect(canvas.queryAllByRole('status')).toHaveLength(0))
		await userEvent.click(canvas.getByRole('button', { name: 'Показать или скрыть' }))
		await waitFor(() => expect(canvas.getAllByRole('status')).toHaveLength(4))
	},
}
