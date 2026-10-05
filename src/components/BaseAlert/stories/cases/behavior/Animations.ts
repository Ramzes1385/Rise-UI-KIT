import type meta from '../../BaseAlert.stories'
import { expect, waitFor } from 'storybook/test'
import BaseAlert from '../../../ui/BaseAlert.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseAlert :key="replay" v-bind="args" />
	`,
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
					'Уход при закрытии в четырёх пресетах движения: нажмите «Закрыть» в каждой колонке, «Повторить» вернёт алерты.',
					'Уход — прозрачность и масштаб (`--rise-duration-fast`, `--rise-ease-in`, `--rise-motion-scale-from`); событие `close`',
					'приходит после анимации. В `none` и при «уменьшить движение» алерт исчезает сразу и `close` приходит в том же клике.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		for (const close of canvas.getAllByRole('button', { name: 'Закрыть' })) await userEvent.click(close)
		await waitFor(() => expect(canvas.queryAllByRole('status')).toHaveLength(0))
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByRole('status')).toHaveLength(4))
	},
}
