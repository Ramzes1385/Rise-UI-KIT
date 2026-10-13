import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCookieConsent.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseCookieConsent from '../../../ui/BaseCookieConsent.vue'
import { COOKIE_CONSENT_VARIANTS } from '../../../types/BaseCookieConsent.types'

const template = `
	<div class="story-stack">
		<div v-for="variant in COOKIE_CONSENT_VARIANTS" :key="variant">
			<span class="story-label">{{ variant }}</span>
			<div class="story-frame" style="height: 240px; background: var(--rise-bg-muted)">
				<BaseCookieConsent v-bind="args" :variant="variant" :label="'Cookies ' + variant" />
			</div>
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['position', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Три варианта: `default` — карточка с рамкой и тенью, `outline` — рамка без тени, `soft` — мягкий фон без рамки и тени.',
					'Фон окна отличается от фона страницы (в примере — приглушённый фон рамки).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCookieConsent', 'COOKIE_CONSENT_VARIANTS'] }),
		},
	},
	render: args => ({
		components: { BaseCookieConsent },
		setup: useStorySetup(args, { data: { COOKIE_CONSENT_VARIANTS } }),
		template,
	}),
	play: async ({ canvas }) => {
		const [base, outline, soft] = canvas.getAllByRole('region')
		await expect(getComputedStyle(base).boxShadow).not.toBe('none')
		await expect(getComputedStyle(outline).boxShadow).toBe('none')
		await expect(getComputedStyle(soft).boxShadow).toBe('none')
	},
}
