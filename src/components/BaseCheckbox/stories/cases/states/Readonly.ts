import { expect } from 'storybook/test'
import type meta from '../../BaseCheckbox.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCheckbox from '../../../ui/BaseCheckbox.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { off: false, on: true }

const template = `
	<div class="story-col">
		<BaseCheckbox v-bind="args" v-model="off" label="Согласие не получено" is-readonly />
		<BaseCheckbox v-bind="args" v-model="on" label="Договор подписан" is-readonly />
	</div>
`

export const Readonly: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Режим «только чтение» (`isReadonly`): значение видно, но клик, пробел и клик по подписи его не меняют.',
					'В отличие от `isDisabled`, флажок не затемняется и остаётся в порядке Tab; скринридер слышит `aria-readonly`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCheckbox'],
				state,
				omit: ['modelValue', 'label', 'isReadonly', 'onUpdate:modelValue'],
			}),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseCheckbox },
		setup: useStorySetup(args, { state, slots: ['modelValue', 'label', 'isReadonly', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const off = canvas.getByRole('checkbox', { name: 'Согласие не получено' })
		await expect(off).toHaveAttribute('aria-readonly', 'true')
		await expect(off).toBeEnabled()
		await userEvent.click(canvas.getByText('Согласие не получено'))
		await expect(off).not.toBeChecked()
		await userEvent.tab()
		await expect(off).toHaveFocus()
		await expect(canvas.getByRole('checkbox', { name: 'Договор подписан' })).toBeChecked()
	},
}
