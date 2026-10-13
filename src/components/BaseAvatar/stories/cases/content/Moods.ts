import { expect } from 'storybook/test'
import { CONTENT_ARGS } from '../../shared'
import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { AVATAR_MOODS } from '../../../types/BaseAvatar.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const moods = AVATAR_MOODS

const template = `
	<div class="story-row">
		<div v-for="mood in moods" :key="mood" class="story-col">
			<BaseAvatar v-bind="args" :mood="mood" :alt="mood" />
			<span class="story-label">{{ mood }}</span>
		</div>
	</div>
`

export const Moods: StoryObj<typeof meta> = {
	name: 'Настроения',
	parameters: {
		controls: { include: ['mascot', 'variant', 'sizeScale', 'shape'] },
		docs: {
			description: {
				story: [
					'`mood` — выражение персонажа: `idle`, `happy`, `surprised`, `sad`, `sleepy`, `thinking`. Рот и брови — кривые',
					'с одинаковым набором точек, поэтому при смене настроения они перетекают, а не подменяются. `sad`, `sleepy`',
					'и `thinking` ещё и уводят взгляд. Ненадолго показать настроение — метод `react(mood, ms)` (история «Анимации»).',
					'При `prefers-reduced-motion` настроение меняется сразу, зрачки — в центре.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAvatar'],
				script: `const moods = ${literal(moods)} as const`,
				omit: [...CONTENT_ARGS, 'mood'],
			}),
		},
	},
	args: { mascot: 'droplet', sizeScale: 200 },
	render: args => ({
		components: { BaseAvatar },
		setup: useStorySetup(args, { data: { moods }, slots: [...CONTENT_ARGS, 'mood'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		for (const mood of moods) await expect(canvasElement.querySelector(`.base-avatar__mascot--mood-${mood}`)).not.toBeNull()
	},
}
