import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAvatarCropper.stories'
import BaseAvatarCropper from '../../../ui/BaseAvatarCropper.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-cropper', frame: 'story-themed-frame' }

const template = `
	<div class="story-row" style="align-items: flex-start">
		<BaseAvatarCropper v-bind="args" label="По умолчанию" />
		<div style="display: contents; --rise-avatar-cropper-area-radius: var(--rise-radius-2xl); --rise-avatar-cropper-area-bg: var(--rise-bg-elevated); --rise-avatar-cropper-frame-border: var(--rise-primary);">
			<BaseAvatarCropper v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseAvatarCropper v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { size: 200 },
	parameters: {
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены компонента `--rise-avatar-cropper-*` (отступы, фон и радиус области, рамка, радиус и',
					'затемнение кадра, фон и текст сообщения) кит только читает: задайте их на `:root`, в теме или на контейнере — как здесь.',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `area`, `image`, `frame`, `message`,',
					'`hint`, `zoom`, `zoom-label`, `range`) — для утилитарного CSS; глобально — `defaults.BaseAvatarCropper.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseAvatarCropper'], script: `const ui = ${literal(ui)}`, omit: ['label'] }),
		},
		controls: { include: ['shape', 'variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseAvatarCropper },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('group', { name: 'По умолчанию' })
		const themed = canvas.getByRole('group', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('group', { name: 'Классы через ui' })
		const frameOf = (area: HTMLElement) => area.querySelector('.base-avatar-cropper__frame')!

		await waitFor(() => expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px'))
		await expect(getComputedStyle(plain).borderTopLeftRadius).toBe('8px')
		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(frameOf(themed)).outlineColor).not.toBe(getComputedStyle(frameOf(plain)).outlineColor)
		await expect(classed.closest('.base-avatar-cropper')).toHaveClass('story-themed-cropper')
		await expect(frameOf(classed)).toHaveClass('base-avatar-cropper__frame', 'story-themed-frame')
	},
}
