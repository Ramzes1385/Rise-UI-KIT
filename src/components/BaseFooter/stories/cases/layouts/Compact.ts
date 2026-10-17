import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseFooter.stories'
import BaseFooter from '../../../ui/BaseFooter.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const ROW_LAYOUT_MIN_VIEWPORT = 768

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
			description: {
				story: 'Компактный (`isCompact`): отступ 12px вместо 24px — строка внизу рабочего экрана приложения; до 768 px блоки встают в колонку.',
			},
			source: staticStorySource({ template, imports: ['BaseFooter', 'BaseLink'] }),
		},
		controls: { disable: true },
	},
	render: args => ({ components: { BaseFooter, BaseLink }, setup: useStorySetup(args), template }),
	play: async ({ canvas }) => {
		const footer = canvas.getByRole('contentinfo')
		const inner = footer.querySelector('.base-footer__inner') as HTMLElement
		await expect(getComputedStyle(inner).paddingTop).toBe('12px')
		if (window.innerWidth >= ROW_LAYOUT_MIN_VIEWPORT) await expect(footer.getBoundingClientRect().height).toBeLessThan(60)
	},
}
