import { BaseLink } from '@components/BaseLink'
import { BaseText } from '@components/BaseText'
import type { Meta } from '@storybook/vue3-vite'
import BaseHoverCard from '../ui/BaseHoverCard.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { isOpen: 'isOpen' }

const template = `
	<BaseHoverCard v-bind="args" v-model:is-open="isOpen">
		<template #trigger>
			<BaseLink href="#" label="@anna.smirnova" />
		</template>
		<BaseText>Анна Смирнова, дизайнер продукта. Ведёт дизайн-систему и ревью макетов.</BaseText>
	</BaseHoverCard>
`

export const source = storySource({ template, imports: ['BaseHoverCard', 'BaseLink', 'BaseText'], models })

export const render = (args => ({
	components: { BaseHoverCard, BaseLink, BaseText },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseHoverCard>['render']
