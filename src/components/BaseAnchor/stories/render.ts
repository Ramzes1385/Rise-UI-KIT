import { sections } from './shared'
import BaseAnchor from '../ui/BaseAnchor.vue'
import type { Meta } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row" style="align-items: flex-start">
		<BaseAnchor v-bind="args" :target="'#' + boxId" style="width: 200px" />
		<div :id="boxId" tabindex="0" role="region" aria-label="Руководство" style="flex: 1; box-sizing: border-box; height: 320px; overflow: auto; padding: 0 16px 160px; border: 1px solid var(--rise-border); border-radius: 8px">
			<section v-for="section in sections" :key="section.key">
				<component :is="section.tag" :id="boxId + '-' + section.key">{{ section.title }}</component>
				<p style="min-height: 120px">{{ section.text }}</p>
			</section>
		</div>
	</div>
`

export const source = storySource({
	template,
	imports: ['BaseAnchor'],
	script: `
		const boxId = 'guide'
		const sections = ${literal(sections)}
	`,
})

export const render = ((args, { id }) => ({
	components: { BaseAnchor },
	setup: useStorySetup(args, { data: { sections, boxId: `guide-${id}` } }),
	template,
})) satisfies Meta<typeof BaseAnchor>['render']
