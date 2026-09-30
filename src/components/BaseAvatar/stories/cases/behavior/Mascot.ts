import { CONTENT_ARGS } from '../../shared'
import type meta from '../../BaseAvatar.stories'
import { BaseInput } from '@components/BaseInput'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { password: '', isHiding: false }

const template = `
	<div class="story-col story-narrow">
		<BaseAvatar v-bind="args" mascot="sprout" alt="Росток" :is-eyes-closed="isHiding" />
		<BaseInput v-model="password" type="password" label="Пароль" @focus="isHiding = true" @blur="isHiding = false" />
	</div>
`

export const Mascot: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'shape', 'ring'] },
		docs: {
			description: {
				story: [
					'Росток — SVG-персонаж кита (`mascot="sprout"`). Глаза следят за курсором по всей странице: поводите мышью вокруг.',
					'`isEyesClosed` закрывает глаза — здесь, пока фокус в поле пароля, как на странице входа.',
					'При `prefers-reduced-motion` персонаж смотрит прямо и не реагирует на курсор.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAvatar', 'BaseInput'],
				state,
				omit: [...CONTENT_ARGS, 'mascot', 'isEyesClosed'],
			}),
		},
	},
	args: { sizeScale: 300 },
	render: args => ({
		components: { BaseAvatar, BaseInput },
		setup: useStorySetup(args, { state, slots: [...CONTENT_ARGS, 'mascot', 'isEyesClosed'] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const mascot = canvas.getByRole('img', { name: 'Росток' })
		const rect = mascot.getBoundingClientRect()
		const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches
		document.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.right + 400, clientY: rect.top + rect.height / 2 }))
		await waitFor(() =>
			expect(canvasElement.querySelector('.base-avatar__mascot-pupils')).toHaveAttribute(
				'transform',
				isReduced ? 'translate(0 0)' : 'translate(3 0)',
			),
		)
		await userEvent.tab()
		await expect(canvas.getByLabelText('Пароль')).toHaveFocus()
		await waitFor(() => expect(canvasElement.querySelector('.base-avatar__mascot-lids')).not.toBeNull())
		await userEvent.tab()
		await waitFor(() => expect(canvasElement.querySelector('.base-avatar__mascot-pupils')).not.toBeNull())
	},
}
