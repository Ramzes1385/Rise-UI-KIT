import { setup } from './Animations.setup'
import { CONTENT_ARGS } from '../../shared'
import type meta from '../../BaseAvatar.stories'
import { expect, waitFor } from 'storybook/test'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import setupSource from './Animations.setup.ts?raw'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-col">
		<div class="story-row">
			<div v-for="preset in presets" :key="preset" :data-rise-motion="preset" class="story-col">
				<BaseAvatar ref="avatars" v-bind="args" alt="Росток" />
				<span class="story-label">{{ preset }}</span>
			</div>
		</div>
		<BaseButton @click="replay">Повторить</BaseButton>
	</div>
`

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['mascot', 'mood', 'sizeScale'] },
		docs: {
			description: {
				story: [
					"Движение персонажа в пресетах `data-rise-motion`. «Повторить» вызывает у каждого `react('surprised')`:",
					'удивление на 1,2 с, затем возврат к `mood`. Поводите курсором — зрачки и голова догоняют его на пружине.',
					'В `none` (и при `prefers-reduced-motion`) персонаж неподвижен: зрачки в центре, без наклона, дыхания и моргания,',
					'выражение меняется сразу.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAvatar', 'BaseButton', 'type BaseAvatarExpose'],
				vue: ['ref'],
				script: scriptSource(setupSource),
				omit: [...CONTENT_ARGS],
			}),
		},
	},
	args: { mascot: 'sprout', sizeScale: 200 },
	render: args => ({
		components: { BaseAvatar, BaseButton },
		setup: useStorySetup(args, { slots: [...CONTENT_ARGS], setup }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Повторить' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(canvasElement.querySelectorAll('.base-avatar__mascot--mood-surprised')).toHaveLength(4)
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-avatar__mascot--mood-idle')).toHaveLength(4), { timeout: 3000 })
	},
}
