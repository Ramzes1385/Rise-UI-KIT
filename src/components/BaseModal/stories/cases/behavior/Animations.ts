import type meta from '../../BaseModal.stories'
import { BaseText } from '@components/BaseText'
import { expect, waitFor } from 'storybook/test'
import BaseModal from '../../../ui/BaseModal.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<div class="story-frame" style="align-self: stretch; height: 200px;">
			<BaseModal v-bind="args" v-model:is-open="isOpen" is-contained title="Окно">
				<BaseText>Появление и уход.</BaseText>
			</BaseModal>
		</div>
	`,
	state: { isOpen: true },
	action: 'isOpen = !isOpen',
	trigger: 'Открыть или закрыть',
	components: { BaseModal, BaseButton, BaseText },
	imports: ['BaseModal', 'BaseText'],
	slots: ['default', 'footer'],
	omit: ['default', 'isOpen', 'title', 'isContained', 'onUpdate:isOpen'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'scale' },
	parameters: {
		controls: { include: ['animation', 'variant'] },
		docs: {
			description: {
				story: [
					'Появление и уход окна в четырёх пресетах движения. Проп `animation`: `scale` (по умолчанию) — масштаб от центра,',
					'`fade` — прозрачность, `slide` — снизу на `--rise-motion-distance`, `pop` — масштаб с пружиной (перелёт — в `expressive`), `none` — сразу.',
					'Длительности — токены движения; в `none` и при «уменьшить движение» окно появляется сразу.',
					"Для всего приложения — `createUiKitPlugin({ defaults: { global: { animation: 'fade' } } })`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(canvas.getAllByRole('dialog')).toHaveLength(4))
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть или закрыть' }))
		await waitFor(() => expect(canvas.queryAllByRole('dialog')).toHaveLength(0))
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть или закрыть' }))
		await waitFor(() => expect(canvas.getAllByRole('dialog')).toHaveLength(4))
	},
}
