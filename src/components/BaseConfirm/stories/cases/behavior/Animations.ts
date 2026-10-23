import type meta from '../../BaseConfirm.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseConfirm from '../../../ui/BaseConfirm.vue'
import { expect, screen, waitFor } from 'storybook/test'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { MOTION_PRESETS } from '@composables/app/useMotion/types/useMotion.types'

const OWN_ARGS = ['isOpen', 'title', 'onUpdate:isOpen']

const presets = [...MOTION_PRESETS]

const state = { openPreset: null }

const template = `
	<div class="story-motion">
		<div class="story-motion__presets">
			<div v-for="preset in presets" :key="preset" class="story-motion__preset" :data-rise-motion="preset">
				<span class="story-label">{{ preset }}</span>
				<BaseButton variant="outline" @click="openPreset = preset">{{ 'Открыть: ' + preset }}</BaseButton>
				<BaseConfirm v-bind="args" :title="'Пресет ' + preset" :is-open="openPreset === preset" @update:is-open="openPreset = null" />
			</div>
		</div>
	</div>
`

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'scale' },
	parameters: {
		controls: { include: ['animation', 'variant'] },
		docs: {
			description: {
				story: [
					'Появление и уход окна в четырёх пресетах движения: кнопка колонки открывает окно, окно берёт пресет',
					'`data-rise-motion` своей колонки. Проп `animation` передаётся BaseModal: `scale` (по умолчанию) — масштаб от центра,',
					'`fade` — прозрачность, `slide` — снизу на `--rise-motion-distance`, `pop` — масштаб с пружиной (перелёт — в `expressive`), `none` — сразу.',
					'Длительности — токены движения; в `none` и при «уменьшить движение» окно появляется сразу.',
					"Из кода — `confirm({ title, animation: 'fade' })`; для всего приложения — `defaults.BaseConfirm.animation` плагина.",
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseConfirm', 'BaseButton'],
				state,
				types: { openPreset: 'string | null' },
				script: `const presets = ${literal(presets)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseConfirm, BaseButton },
		setup: useStorySetup(args, { state, data: { presets }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть: standard' }))
		const dialog = await screen.findByRole('alertdialog', { name: 'Пресет standard' })
		const root = dialog.closest('.base-modal') as HTMLElement
		await expect(root).toHaveAttribute('data-rise-motion', 'standard')
		await expect(root).toHaveClass('base-modal--animation-scale')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
	},
}
