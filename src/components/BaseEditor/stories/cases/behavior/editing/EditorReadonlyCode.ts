import type meta from '../../../BaseEditor.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseEditor from '../../../../ui/BaseEditor.vue'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { html: 'modelValue' }
const state = { isLocked: false }

const template = `
	<div class="story-medium story-stack">
		<BaseEditor v-bind="args" v-model="html" label="Текст" :is-readonly="isLocked" />
		<BaseButton @click="isLocked = true">Только чтение</BaseButton>
	</div>
`

export const EditorReadonlyCode: StoryObj<typeof meta> = {
	parameters: {
		controls: { exclude: ['modelValue', 'isReadonly'] },
		docs: {
			description: {
				story: [
					'Режим кода и «только чтение». Как только редактор становится `isReadonly` (или `isDisabled`), он выходит из режима кода:',
					'панель инструментов скрыта, и выйти из режима кода вручную было бы нельзя. Поле кода при этом само только для чтения,',
					'а значение, пришедшее снаружи в режиме кода, попадает в поле и не теряется при выходе.',
				].join(' '),
			},
			source: storySource({ template, imports: ['BaseEditor', 'BaseButton'], models, state, omit: ['toolbar'] }),
		},
	},
	args: { modelValue: '<p>Текст <strong>статьи</strong></p>' },
	render: args => ({
		components: { BaseEditor, BaseButton },
		setup: useStorySetup(args, { models, state, slots: ['toolbar'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Режим кода' }))
		await expect(canvas.getByRole('textbox', { name: 'HTML-код' })).toHaveValue('<p>Текст <strong>статьи</strong></p>')

		await userEvent.click(canvas.getByRole('button', { name: 'Только чтение' }))
		await waitFor(() => expect(canvas.queryByRole('textbox', { name: 'HTML-код' })).toBeNull())
		const textbox = canvas.getByRole('textbox', { name: 'Текст' })
		await expect(textbox).toHaveAttribute('aria-readonly', 'true')
		await expect(within(textbox).getByText('статьи')).toBeVisible()
		await expect(canvas.queryByRole('toolbar')).toBeNull()
	},
}
