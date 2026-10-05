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

export const Password: StoryObj<typeof meta> = {
	name: 'Пароль',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'shape', 'ring'] },
		docs: {
			description: {
				story: [
					'Росток — SVG-персонаж кита (`mascot="sprout"`). Глаза следят за курсором по всей странице: поводите мышью вокруг.',
					'`isEyesClosed` плавно закрывает глаза — здесь, пока фокус в поле пароля, как на странице входа.',
					'При `prefers-reduced-motion` персонаж смотрит прямо, не реагирует на курсор и закрывает глаза сразу.',
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
		const pupil = canvasElement.querySelector('.base-avatar__mascot-pupil')
		const eyes = canvasElement.querySelector('.base-avatar__mascot-eyes')
		document.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.right + 400, clientY: rect.top + rect.height / 2 }))
		await waitFor(() => expect(pupil).toHaveAttribute('transform', isReduced ? 'translate(0 0)' : 'translate(3 0)'), { timeout: 3000 })
		await userEvent.tab()
		await expect(canvas.getByLabelText('Пароль')).toHaveFocus()
		await waitFor(() => expect(eyes).toHaveAttribute('opacity', '0'), { timeout: 3000 })
		await userEvent.tab()
		await waitFor(() => expect(eyes).toHaveAttribute('opacity', '1'), { timeout: 3000 })
	},
}
