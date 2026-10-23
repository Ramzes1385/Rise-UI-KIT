import { BaseText } from '@components/BaseText'
import type meta from '../../BaseDrawer.stories'
import BaseDrawer from '../../../ui/BaseDrawer.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { MOTION_PRESETS } from '@composables/app/useMotion/types/useMotion.types'

const OWN_ARGS = ['isOpen', 'title', 'description', 'onUpdate:isOpen']

const presets = [...MOTION_PRESETS]

const state = { openPreset: null }

const template = `
	<div class="story-motion">
		<div class="story-motion__presets">
			<div v-for="preset in presets" :key="preset" class="story-motion__preset" :data-rise-motion="preset">
				<span class="story-label">{{ preset }}</span>
				<BaseButton variant="outline" @click="openPreset = preset">{{ 'Открыть: ' + preset }}</BaseButton>
				<BaseDrawer v-bind="args" :title="'Пресет ' + preset" :is-open="openPreset === preset" @update:is-open="openPreset = null">
					<BaseText>Появление и уход.</BaseText>
				</BaseDrawer>
			</div>
		</div>
	</div>
`

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'slide' },
	parameters: {
		controls: { include: ['animation', 'direction'] },
		docs: {
			description: {
				story: [
					'Появление и уход панели в четырёх пресетах движения: кнопка колонки открывает панель, панель берёт пресет',
					'`data-rise-motion` своей колонки. Проп `animation`: `slide` (по умолчанию) — въезд со своего края на всю панель,',
					'`fade` — прозрачность, `scale` — масштаб от своего края, `pop` — масштаб с пружиной (перелёт — в `expressive`), `none` — сразу.',
					'Длительности — токены движения; в `none` и при «уменьшить движение» панель появляется сразу.',
					"Для всего приложения — `createUiKitPlugin({ defaults: { BaseDrawer: { animation: 'fade' } } })`.",
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseDrawer', 'BaseButton', 'BaseText'],
				state,
				types: { openPreset: 'string | null' },
				script: `const presets = ${literal(presets)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseDrawer, BaseButton, BaseText },
		setup: useStorySetup(args, { state, data: { presets }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть: standard' }))
		const dialog = await screen.findByRole('dialog', { name: 'Пресет standard' })
		const root = dialog.closest('.base-drawer') as HTMLElement
		await expect(root).toHaveAttribute('data-rise-motion', 'standard')
		await expect(root).toHaveClass('base-drawer--animation-slide')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}
