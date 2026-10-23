import BaseAffix from '../ui/BaseAffix.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div id="story-affix-default" tabindex="0" role="region" aria-label="Прокручиваемая страница" style="height: 240px; overflow: auto; border: 1px dashed var(--rise-border-accented); border-radius: 8px">
		<div style="padding: 24px 16px">Прокрутите вниз: панель прилипнет к верху области.</div>
		<BaseAffix v-bind="args" target="#story-affix-default">
			<template #default="{ isFixed }">
				<div style="padding: 12px 16px; border-bottom: 1px solid var(--rise-border); background: var(--rise-bg-elevated)">{{ isFixed ? 'Панель закреплена' : 'Панель на своём месте' }}</div>
			</template>
		</BaseAffix>
		<div v-for="n in 10" :key="n" style="padding: 12px 16px 0">Раздел {{ n }}. Содержимое раздела прокручивается под панелью.</div>
	</div>
`

export const source = storySource({ template, imports: ['BaseAffix'] })

export const render = (args => ({
	components: { BaseAffix },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseAffix>['render']
