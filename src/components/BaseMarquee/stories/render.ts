import BaseMarquee from '../ui/BaseMarquee.vue'
import type { MarqueeStoryArgs } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { isPaused: 'isPaused' }

const template = `
	<BaseMarquee v-bind="args" v-model:is-paused="isPaused">
		Скидка 20% на всё до воскресенья · Бесплатная доставка от 3000 ₽ · Новая коллекция уже в магазинах
	</BaseMarquee>
`

export const source = storySource({ template, imports: ['BaseMarquee'], models })

export const render = (args => ({
	components: { BaseMarquee },
	setup: useStorySetup(args, { models }),
	template,
})) satisfies Meta<MarqueeStoryArgs>['render']
