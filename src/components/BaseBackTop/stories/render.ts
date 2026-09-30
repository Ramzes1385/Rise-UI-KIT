import BaseBackTop from '../ui/BaseBackTop.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const news = Array.from({ length: 40 }, (_, index) => `Новость ${index + 1}: склад в Волгограде принял ${20 + index} поставок`)

const template = `
	<div style="position: relative; max-width: 480px">
		<div :id="listId" tabindex="0" role="region" aria-label="Лента новостей" style="height: 280px; overflow: auto; border: 1px solid var(--rise-border); border-radius: 8px">
			<ul style="margin: 0; padding: 8px 16px; list-style: none; display: grid; gap: 12px">
				<li v-for="item in news" :key="item">{{ item }}</li>
			</ul>
		</div>
		<BaseBackTop v-bind="args" :target="'#' + listId" />
	</div>
`

export const source = storySource({
	template,
	imports: ['BaseBackTop'],
	script: `
		const news = Array.from({ length: 40 }, (_, index) => \`Новость \${index + 1}: склад в Волгограде принял \${20 + index} поставок\`)
		const listId = 'news'
	`,
})

export const render = ((args, { id }) => ({
	components: { BaseBackTop },
	setup: useStorySetup(args, { data: { news, listId: `news-${id}` } }),
	template,
})) satisfies Meta<typeof BaseBackTop>['render']
