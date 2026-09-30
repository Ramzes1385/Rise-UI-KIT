import type meta from '../BaseButtonGroup.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseButtonGroup from '../../ui/BaseButtonGroup.vue'
import { BaseSplitButton } from '@components/BaseSplitButton'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const items = [{ label: 'Сохранить как шаблон' }, { label: 'Сохранить копию' }]

const template = `
	<BaseButtonGroup v-bind="args" aria-label="Документ">
		<BaseButton variant="outline">Отмена</BaseButton>
		<BaseSplitButton variant="outline" label="Сохранить" :items="items" />
	</BaseButtonGroup>
`

export const WithSplitButton: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'С кнопкой меню: BaseSplitButton в группе получает общие скругления.' },
			source: storySource({
				template,
				imports: ['BaseButtonGroup', 'BaseButton', 'BaseSplitButton'],
				script: `const items = ${literal(items)}`,
				omit: ['ariaLabel'],
			}),
		},
	},
	render: args => ({
		components: { BaseButtonGroup, BaseButton, BaseSplitButton },
		setup: useStorySetup(args, { data: { items }, slots: ['ariaLabel'] }),
		template,
	}),
}
