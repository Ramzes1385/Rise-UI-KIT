import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseFooter.stories'
import BaseFooter from '../../../ui/BaseFooter.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFooter variant="soft" is-compact>
		<template #start>Rise CRM · версия 2.4.1</template>
		<template #end>
			<BaseLink href="#help">Помощь</BaseLink>
			<BaseLink href="#status">Статус сервиса</BaseLink>
		</template>
	</BaseFooter>
`

export const Compact: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Компактный (`isCompact`): отступ 12px вместо 24px — строка внизу рабочего экрана приложения.' },
			source: staticStorySource({ template, imports: ['BaseFooter', 'BaseLink'] }),
		},
		controls: { disable: true },
	},
	render: args => ({ components: { BaseFooter, BaseLink }, setup: useStorySetup(args), template }),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('contentinfo').getBoundingClientRect().height).toBeLessThan(60)
	},
}
