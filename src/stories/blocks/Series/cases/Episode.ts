import { setup } from './Episode.setup'
import type meta from '../Series.stories'
import { BaseTabs } from '@components/BaseTabs'
import { BaseUser } from '@components/BaseUser'
import setupSource from './Episode.setup.ts?raw'
import { waitFor, expect } from 'storybook/test'
import { BaseBadge } from '@components/BaseBadge'
import { BaseRating } from '@components/BaseRating'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseBreadcrumbs } from '@components/BaseBreadcrumbs'
import { BaseMediaPlayer } from '@components/BaseMediaPlayer'
import { scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<main class="blk-page blk-series">
		<BaseBreadcrumbs :items="crumbs" />
		<BaseMediaPlayer
			v-model:episode="episode"
			:playlists="playlists"
			:poster="seriesMedia.cover"
			title="Демо-сериал"
			class="blk-series__player"
			@update:episode="syncSeason" />
		<div class="blk-series__info">
			<h1 class="blk-title">Демо-сериал</h1>
			<ul class="blk-series__meta" aria-label="О сериале">
				<li v-for="genre in genres" :key="genre"><BaseBadge variant="outline" :label="genre" /></li>
			</ul>
			<BaseRating :model-value="4.5" is-readonly is-value-shown />
			<p class="blk-muted">
				Команда разработчиков собирает видеоплеер мечты: спорит о кнопках, теряет субтитры и находит их в последней серии.
			</p>
		</div>
		<section class="blk-series__section" aria-labelledby="series-episodes">
			<h2 id="series-episodes" class="blk-series__heading">Серии</h2>
			<BaseTabs v-model="season" :items="seasons">
				<ul class="blk-series__episodes">
					<li v-for="item in episodes" :key="item.id">
						<button
							type="button"
							class="blk-series__episode"
							:aria-current="item.id === episode ? 'true' : undefined"
							@click="select(item.id)">
							<img :src="item.poster" alt="" class="blk-series__poster" />
							<span class="blk-series__episode-title">{{ item.title }}</span>
							<span class="blk-muted">{{ item.description }}</span>
						</button>
					</li>
				</ul>
			</BaseTabs>
		</section>
		<section class="blk-series__section" aria-labelledby="series-cast">
			<h2 id="series-cast" class="blk-series__heading">В ролях</h2>
			<ul class="blk-series__cast">
				<li v-for="actor in cast" :key="actor.name">
					<BaseUser :name="actor.name" :description="actor.role" :src="actor.photo" />
				</li>
			</ul>
		</section>
	</main>
`

export const Episode: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Страница серии: хлебные крошки, плеер с сезонами, название, жанры, рейтинг и описание. Вкладки сезонов',
					'показывают серии карточками-кнопками, текущая отмечена `aria-current`. Щелчок по серии переключает плеер,',
					'смена серии в плеере (например, «Следующая серия») переключает вкладку сезона. Ниже — актёры BaseUser.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseBadge', 'BaseBreadcrumbs', 'BaseRating', 'BaseTabs', 'BaseUser', 'type BreadcrumbItem', 'type TabItem'],
				importsFrom: {
					'@ramzes1385/rise-ui-kit/media': ['BaseMediaPlayer', 'type MediaEpisode', 'type MediaPlaylist'],
					'./media': ['seriesMedia'],
				},
				vue: ['computed', 'ref'],
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseBadge, BaseBreadcrumbs, BaseMediaPlayer, BaseRating, BaseTabs, BaseUser },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('heading', { level: 1, name: 'Демо-сериал' })).toBeVisible()
		await expect(canvas.getByRole('region', { name: 'Демо-сериал. Серия 1. Начало' })).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: /^Серия 1\. Начало/ })).toHaveAttribute('aria-current', 'true')

		await userEvent.click(canvas.getByRole('button', { name: /^Серия 2\. Дорога/ }))
		await waitFor(() => expect(canvas.getByRole('region', { name: 'Демо-сериал. Серия 2. Дорога' })).toBeInTheDocument())
		await expect(canvas.getByRole('button', { name: /^Серия 2\. Дорога/ })).toHaveAttribute('aria-current', 'true')

		canvas.getByRole('tab', { name: 'Сезон 1' }).focus()
		await userEvent.keyboard('{ArrowRight}{Enter}')
		await waitFor(() => expect(canvas.getByRole('tab', { name: 'Сезон 2' })).toHaveAttribute('aria-selected', 'true'))
		await userEvent.click(canvas.getByRole('button', { name: /^Серия 1\. Возвращение/ }))
		await waitFor(() => expect(canvas.getByRole('region', { name: 'Демо-сериал. Серия 1. Возвращение' })).toBeInTheDocument())
	},
}
