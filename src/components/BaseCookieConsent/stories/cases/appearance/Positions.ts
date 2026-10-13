import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCookieConsent.stories'
import BaseCookieConsent from '../../../ui/BaseCookieConsent.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { COOKIE_CONSENT_POSITIONS } from '../../../types/BaseCookieConsent.types'

const positions = [...COOKIE_CONSENT_POSITIONS]

const template = `
	<div class="story-stack">
		<div v-for="position in positions" :key="position">
			<span class="story-label">{{ position }}</span>
			<div class="story-frame" style="height: 280px; background: var(--rise-bg-muted)">
				<BaseCookieConsent v-bind="args" :position="position" />
			</div>
		</div>
	</div>
`

export const Positions: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Три положения: `bottom` — по центру внизу (ширина до 720px), `bottom-left` и `bottom-right` — компактное окно (до 420px) в углу.',
					'С `isContained` окно остаётся внутри рамки, без него — закреплено в окне браузера.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCookieConsent'], script: `const positions = ${literal(positions)}` }),
		},
	},
	render: args => ({
		components: { BaseCookieConsent },
		setup: useStorySetup(args, { data: { positions } }),
		template,
	}),
	play: async ({ canvas }) => {
		const [center, left, right] = canvas.getAllByRole('dialog').map(dialog => ({
			dialog: dialog.getBoundingClientRect(),
			frame: (dialog.parentElement as HTMLElement).getBoundingClientRect(),
		}))
		await expect(Math.abs(center.dialog.left - center.frame.left - (center.frame.right - center.dialog.right))).toBeLessThanOrEqual(1)
		await expect(left.dialog.left - left.frame.left).toBeLessThan(right.dialog.left - right.frame.left)
		await expect(left.dialog.left - left.frame.left).toBeLessThan(40)
		await expect(right.frame.right - right.dialog.right).toBeLessThan(40)
		await expect(left.dialog.bottom).toBeLessThanOrEqual(left.frame.bottom)
	},
}
