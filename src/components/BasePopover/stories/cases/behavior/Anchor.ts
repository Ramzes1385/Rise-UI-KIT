import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BasePopover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopover from '../../../ui/BasePopover.vue'
import { screen, expect, waitFor } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { isOpen: false, anchor: { x: 0, y: 0 } }

const types = { anchor: '{ x: number; y: number }' }

const template = `
	<div class="story-frame story-medium">
		<BaseButton
			variant="outline"
			@click="anchor = { x: $event.clientX, y: $event.clientY }; isOpen = true">
			Показать у точки клика
		</BaseButton>
		<BasePopover v-bind="args" v-model:is-open="isOpen" :anchor="anchor" aria-label="Окно у точки клика">
			<p>Окно привязано к координатам клика, а не к кнопке.</p>
		</BasePopover>
	</div>
`

export const Anchor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`anchor` — виртуальный якорь вместо триггера: точка `{ x, y }`, прямоугольник `{ x, y, width, height }` в координатах окна',
					'или виртуальный элемент `{ getBoundingClientRect }`, как в Floating UI. Слот `trigger` не нужен, имя диалога — `ariaLabel`.',
					'Окно переворачивается и сдвигается у края экрана так же, как у обычного триггера.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BasePopover', 'BaseButton'], state, types, omit: [...SHOWCASE_OWN_ARGS] }),
		},
		controls: { include: ['position', 'variant'] },
	},
	render: args => ({
		components: { BasePopover, BaseButton },
		setup: useStorySetup(args, { state, slots: [...SHOWCASE_OWN_ARGS] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Показать у точки клика' }))
		const dialog = await screen.findByRole('dialog', { name: 'Окно у точки клика' })
		await waitFor(() => expect(dialog.closest<HTMLElement>('.base-dropdown__panel')?.style.top).not.toBe(''))
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Окно у точки клика' })).not.toBeInTheDocument())
	},
}
