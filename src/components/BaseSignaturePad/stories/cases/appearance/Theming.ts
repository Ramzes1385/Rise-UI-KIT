import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseSignaturePad.stories'
import BaseSignaturePad from '../../../ui/BaseSignaturePad.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-signature', surface: 'story-themed-surface' }

const template = `
	<div class="story-stack">
		<BaseSignaturePad v-bind="args" label="По умолчанию" />
		<div style="--rise-signature-pad-surface-radius: var(--rise-radius-2xl); --rise-signature-pad-surface-bg: var(--rise-bg-elevated); --rise-signature-pad-surface-border: var(--rise-primary); --rise-signature-pad-text: var(--rise-primary);">
			<BaseSignaturePad v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseSignaturePad v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { height: 120 },
	parameters: {
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены компонента `--rise-signature-pad-*` (цвет линии по умолчанию, отступы, фон, рамка и',
					'радиус поля, линия «×», подсказка, промежуток кнопок) кит только читает: задайте их на `:root`, в теме или на',
					'контейнере — как здесь. Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `label`,',
					'`surface`, `baseline`, `hint`, `canvas`, `ink`, `toolbar`, `error`) — для утилитарного CSS; глобально —',
					'`defaults.BaseSignaturePad.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSignaturePad'], script: `const ui = ${literal(ui)}`, omit: ['label'] }),
		},
		controls: { include: ['variant', 'lineWidth', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseSignaturePad },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const surfaceOf = (name: string) => canvas.getByRole('group', { name }).querySelector('.base-signature-pad__surface')!
		const plain = surfaceOf('По умолчанию')
		const themed = surfaceOf('Токены на контейнере')
		const classed = canvas.getByRole('group', { name: 'Классы через ui' })

		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		await expect(getComputedStyle(plain).borderTopLeftRadius).not.toBe('16px')
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(classed).toHaveClass('base-signature-pad', 'story-themed-signature')
		await expect(classed.querySelector('.base-signature-pad__surface')).toHaveClass('story-themed-surface')
	},
}
