import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'Страница серии из компонентов кита: BaseBreadcrumbs, BaseMediaPlayer с сезонами (`playlists`, `v-model:episode`),',
				'BaseBadge, BaseRating, BaseTabs с сезонами, список серий и актёры BaseUser. Плеер и список серий связаны одним',
				'`episode`: выбор серии в списке переключает плеер, а переход к следующей серии в плеере — выделение в списке.',
				'Видео и картинки — локальные файлы из примеров BaseMediaPlayer. Код экрана — во вкладке «Show code».',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
