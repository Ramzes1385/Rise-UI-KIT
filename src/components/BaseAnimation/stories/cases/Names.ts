import { ref } from 'vue'
import type meta from '../BaseAnimation.stories'
import { waitFor, expect } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAnimation from '../../ui/BaseAnimation.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { ANIMATION_NAMES } from '../../types/BaseAnimation.types'

const SINGLE_NAMES = ANIMATION_NAMES.filter(name => name !== 'list')

export const Names: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['mode'] },
		docs: {
			description: {
				story: 'Все анимации одиночного элемента: кнопка скрывает и показывает все примеры сразу. `list` — в story List.',
			},
			source: { code: SINGLE_NAMES.map(name => `<BaseAnimation :show="isVisible" name="${name}">…</BaseAnimation>`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseAnimation, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'show', 'name', 'isGroup', 'tag', 'onAfter-enter', 'onAfter-leave']),
			names: SINGLE_NAMES,
			isVisible: ref(true),
		}),
		template: `
			<div class="story-stack">
				<div>
					<BaseButton variant="outline" @click="isVisible = !isVisible">{{ isVisible ? 'Скрыть все' : 'Показать все' }}</BaseButton>
				</div>
				<div class="story-grid" style="--story-grid-min: 140px;">
					<div v-for="name in names" :key="name" style="min-height: 56px;">
						<BaseAnimation v-bind="props" :name="name" :show="isVisible">
							<div class="story-frame">{{ name }}</div>
						</BaseAnimation>
					</div>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Скрыть все' }))
		await waitFor(() => expect(canvas.queryByText('fade')).not.toBeInTheDocument())
		await waitFor(() => expect(canvas.queryByText('collapse')).not.toBeInTheDocument())
		await userEvent.click(canvas.getByRole('button', { name: 'Показать все' }))
		for (const name of SINGLE_NAMES) {
			await waitFor(() => expect(canvas.getByText(name)).toBeVisible())
		}
	},
}
