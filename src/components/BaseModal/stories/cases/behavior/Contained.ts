import type meta from '../../BaseModal.stories'
import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import BaseModal from '../../../ui/BaseModal.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { isOpen: false }

const template = `
	<div class="story-frame story-medium" style="height: 220px;">
		<BaseButton variant="outline" @click="isOpen = true">Открыть в блоке</BaseButton>
		<BaseModal v-bind="args" v-model:is-open="isOpen" is-contained title="Окно в блоке">
			<BaseText>Окно перекрывает только этот блок. Кнопки и поля за его пределами доступны.</BaseText>
		</BaseModal>
	</div>
`

export const Contained: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Окно внутри блока (`isContained`): рендерится на месте, перекрывает только родителя с `position: relative`',
					'и не выходит за его границы. Диалог немодальный — остальная страница доступна, прокрутка не блокируется.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseModal', 'BaseButton', 'BaseText'], state, omit: [...SHOWCASE_OWN_ARGS] }),
		},
		controls: { include: ['variant', 'sizeScale', 'closeOnOverlay'] },
	},
	render: args => ({
		components: { BaseModal, BaseButton, BaseText },
		setup: useStorySetup(args, { state, slots: [...SHOWCASE_OWN_ARGS] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть в блоке' }))
		const dialog = await canvas.findByRole('dialog', { name: 'Окно в блоке' })
		await expect(dialog).not.toHaveAttribute('aria-modal')
		await expect(document.body.style.overflow).toBe('')

		const frame = (dialog.closest('.story-frame') as HTMLElement).getBoundingClientRect()
		await waitFor(() => expect(getComputedStyle(dialog).transform).toBe('none'))
		const box = dialog.getBoundingClientRect()
		await expect(box.top).toBeGreaterThanOrEqual(frame.top)
		await expect(box.bottom).toBeLessThanOrEqual(frame.bottom)
	},
}
