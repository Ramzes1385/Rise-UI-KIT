import { ref } from 'vue'
import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseSlideover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseSlideover from '../../../ui/BaseSlideover.vue'

export const Contained: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Панель внутри блока (`isContained`): рендерится на месте и перекрывает только родителя с `position: relative`.',
					'Диалог немодальный — страница за пределами блока доступна, прокрутка не блокируется.',
					'`container` делает то же для блока в другом месте страницы (CSS-селектор или элемент).',
				].join('\n'),
			},
		},
		controls: { include: ['side', 'width', 'closeOnOverlay', 'closeOnEscape'] },
	},
	render: args => ({
		components: { BaseSlideover, BaseButton, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS]), isOpen: ref(false) }),
		template: `
			<div class="story-frame" style="height: 240px;">
				<BaseButton variant="outline" @click="isOpen = true">Открыть в блоке</BaseButton>
				<BaseSlideover v-bind="props" v-model:is-open="isOpen" is-contained title="Панель в блоке">
					<BaseText>Панель перекрывает только этот блок.</BaseText>
				</BaseSlideover>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть в блоке' }))
		const dialog = await canvas.findByRole('dialog', { name: 'Панель в блоке' })
		await expect(dialog).not.toHaveAttribute('aria-modal')
		await expect(document.body.style.overflow).toBe('')

		const frame = (dialog.closest('.story-frame') as HTMLElement).getBoundingClientRect()
		await waitFor(() => expect(dialog.getBoundingClientRect().right).toBeLessThanOrEqual(frame.right))
		await expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(frame.bottom)

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument())
	},
}
