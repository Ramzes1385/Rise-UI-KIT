import { screen, expect } from 'storybook/test'
import type meta from '../../BaseTooltip.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTooltip from '../../../ui/BaseTooltip.vue'
import { storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const template = `
	<div style="position: relative; width: 240px; height: 96px; border: 1px dashed var(--rise-border)">
		<BaseTooltip v-bind="args" is-wrapperless>
			<BaseButton variant="outline" style="position: absolute; top: 24px; left: 56px">Сохранить копию</BaseButton>
		</BaseTooltip>
	</div>
`

export const Wrapperless: StoryObj<typeof meta> = {
	args: {
		isAlwaysVisible: true,
		position: 'bottom',
		text: 'Сохранить копию проекта',
	},
	parameters: {
		controls: { include: ['text', 'position', 'variant', 'sizeScale'] },
		docs: {
			...docsFrame(200),
			description: {
				story: [
					'`isWrapperless` — подсказка вешается на сам элемент слота, обёртки `span.base-tooltip` нет: `class`, стили и позиция',
					'кнопки остаются как есть (здесь кнопка позиционирована абсолютно). `aria-describedby` ставится на кнопку,',
					'кроме случая, когда её доступное имя совпадает с текстом подсказки.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTooltip', 'BaseButton'] }),
		},
	},
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
	play: async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Сохранить копию' })
		const tooltip = await screen.findByRole('tooltip')
		await expect(button.closest('.base-tooltip')).toBeNull()
		await expect(button.parentElement).not.toHaveClass('base-tooltip')
		await expect(button).toHaveAttribute('aria-describedby', tooltip.id)
	},
}
