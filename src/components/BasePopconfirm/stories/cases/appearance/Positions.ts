import { BaseButton } from '@components/BaseButton'
import type meta from '../../BasePopconfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopconfirm from '../../../ui/BasePopconfirm.vue'
import { storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const OWN_ARGS = ['isOpen', 'position', 'description']

const template = `
	<div style="display: grid; grid-template-columns: repeat(3, auto); gap: 140px 24px; align-items: center; justify-items: center; padding: 120px 280px;">
		<span />
		<BasePopconfirm v-bind="args" :is-open="true" position="top" title="Сверху"><BaseButton variant="outline">top</BaseButton></BasePopconfirm>
		<span />
		<BasePopconfirm v-bind="args" :is-open="true" position="left" title="Слева"><BaseButton variant="outline">left</BaseButton></BasePopconfirm>
		<span />
		<BasePopconfirm v-bind="args" :is-open="true" position="right" title="Справа"><BaseButton variant="outline">right</BaseButton></BasePopconfirm>
		<span />
		<BasePopconfirm v-bind="args" :is-open="true" position="bottom" title="Снизу"><BaseButton variant="outline">bottom</BaseButton></BasePopconfirm>
		<span />
	</div>
`

export const Positions: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			...docsFrame(420),
			description: { story: 'Позиции: сверху (по умолчанию), снизу, слева, справа. У края окна панель переворачивается.' },
			source: storySource({ template, imports: ['BasePopconfirm', 'BaseButton'], omit: OWN_ARGS }),
		},
	},
	render: args => ({
		components: { BasePopconfirm, BaseButton },
		setup: useStorySetup(args, { slots: OWN_ARGS }),
		template,
	}),
}
