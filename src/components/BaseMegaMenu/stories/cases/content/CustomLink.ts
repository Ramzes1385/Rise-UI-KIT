import { expect } from 'storybook/test'
import { BaseBadge } from '@components/BaseBadge'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { FRAME_STYLE, SLOT_KEYS } from '../../shared'
import BaseMegaMenu from '../../../ui/BaseMegaMenu.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const frameStyle = FRAME_STYLE

const models = { openKey: 'openKey' }

const template = `
	<div :style="frameStyle">
		<BaseMegaMenu v-bind="args" v-model:open-key="openKey">
			<template #link="{ link, group }">
				<span class="story-col" style="gap: 2px;">
					<span>{{ link.label }}</span>
					<BaseBadge variant="soft" :label="group.title ?? 'Раздел'" :size-scale="80" />
				</span>
			</template>

			<template #promo="{ promo }">
				<p style="margin: 0; font-weight: 600;">{{ promo.title }}</p>
				<p style="margin: 0; color: var(--rise-text-muted);">Своё содержимое промо-блока через слот promo.</p>
			</template>
		</BaseMegaMenu>
	</div>
`

export const CustomLink: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Слоты `link` и `promo`: своё содержимое ссылки (внутри `<a>`, со ссылкой, колонкой и разделом в параметрах)',
					'и промо-блока. Ссылка, фокус и клавиатура остаются от меню.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseBadge', 'BaseMegaMenu'],
				models,
				script: `const frameStyle = ${literal(frameStyle)}`,
				omit: SLOT_KEYS,
			}),
		},
	},
	render: args => ({
		components: { BaseMegaMenu, BaseBadge },
		setup: useStorySetup(args, { models, data: { frameStyle }, slots: SLOT_KEYS }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: /Аналитика\s*Платформа/ })).toHaveAttribute('href', '/analytics')
		await expect(canvas.getByText('Своё содержимое промо-блока через слот promo.')).toBeVisible()
	},
}
