import { setup } from './Overview.setup'
import type meta from '../Dashboard.stories'
import { BaseKbd } from '@components/BaseKbd'
import { BaseCard } from '@components/BaseCard'
import { BaseLink } from '@components/BaseLink'
import { BaseStat } from '@components/BaseStat'
import { BaseUser } from '@components/BaseUser'
import setupSource from './Overview.setup.ts?raw'
import { BaseTable } from '@components/BaseTable'
import { BaseButton } from '@components/BaseButton'
import { BaseHeader } from '@components/BaseHeader'
import { BaseLayout } from '@components/BaseLayout'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseHeatmap } from '@components/BaseHeatmap'
import { BaseSideBar } from '@components/BaseSideBar'
import { BasePieChart } from '@components/BasePieChart'
import { BaseTimeline } from '@components/BaseTimeline'
import { BaseSparkline } from '@components/BaseSparkline'
import { screen, waitFor, within, expect } from 'storybook/test'
import { BaseCommandPalette } from '@components/BaseCommandPalette'
import { scriptImports, scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseLayout is-header-sticky>
		<template #header>
			<BaseHeader title="Rise CRM" href="#overview">
				<template #end>
					<div class="blk-dash__header-end">
						<BaseButton variant="outline" aria-keyshortcuts="Control+K Meta+K" @click="isPaletteOpen = true">
							Поиск
							<span aria-hidden="true"><BaseKbd value="meta" /><BaseKbd value="K" /></span>
						</BaseButton>
						<BaseUser name="Анна Петрова" description="Администратор" />
					</div>
				</template>
				<template #menu="{ close }">
					<nav aria-label="Разделы (меню)" class="story-stack">
						<BaseLink v-for="section in sections" :key="section.key" :href="'#' + section.key" @click="close">{{ section.label }}</BaseLink>
					</nav>
				</template>
			</BaseHeader>
		</template>
		<template #sidebar>
			<BaseSideBar :items="sections" :active-key="active" aria-label="Разделы" />
		</template>
		<div class="blk-page blk-dash">
			<div class="blk-dash__head">
				<div>
					<h1 class="blk-title">Обзор</h1>
					<p class="blk-muted">Сентябрь 2026 · обновлено 5 минут назад</p>
				</div>
				<p role="status" class="blk-muted">{{ message }}</p>
			</div>
			<section aria-labelledby="blk-dash-kpis">
				<h2 id="blk-dash-kpis" class="blk-sr-only">Показатели</h2>
				<div class="blk-dash__kpis">
					<BaseStat
						v-for="kpi in kpis"
						:key="kpi.id"
						:label="kpi.label"
						:value="kpi.value"
						:value-format="kpi.valueFormat"
						:change="kpi.change"
						:change-format="kpi.changeFormat"
						:change-label="kpi.changeLabel"
						:is-inverse="kpi.isInverse">
						<template #chart>
							<BaseSparkline
								:values="kpi.trend"
								:labels="weeks"
								:label="kpi.label + ' по неделям'"
								:format-value="kpi.format"
								variant="area"
								:height="40" />
						</template>
					</BaseStat>
				</div>
			</section>
			<section aria-labelledby="blk-dash-charts">
				<h2 id="blk-dash-charts" class="blk-sr-only">Каналы и активность</h2>
				<div class="blk-dash__grid blk-dash__grid--charts">
					<BaseCard title="Выручка по каналам" subtitle="Сентябрь">
						<BasePieChart :segments="channels" label="Выручка" :size="176" :format-value="formatMillions" />
					</BaseCard>
					<BaseCard title="Активность команды" subtitle="Закрытые задачи за 20 недель">
						<BaseHeatmap :data="activity" :end-date="activityEnd" :weeks="activityWeeks" label="Закрытые задачи по дням" />
					</BaseCard>
				</div>
			</section>
			<section aria-labelledby="blk-dash-latest">
				<h2 id="blk-dash-latest" class="blk-sr-only">Последние события</h2>
				<div class="blk-dash__grid blk-dash__grid--wide">
					<BaseCard title="Последние заказы">
						<BaseTable :columns="orderColumns" :rows="orderRows" />
					</BaseCard>
					<BaseCard title="Лента">
						<BaseTimeline :items="events" />
					</BaseCard>
				</div>
			</section>
		</div>
		<BaseCommandPalette v-model:is-open="isPaletteOpen" :commands="commands" @select="choose" />
	</BaseLayout>
`

export const Overview: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Дашборд магазина: каркас BaseLayout с липкой шапкой и боковым меню, показатели BaseStat со спарклайнами,',
					'доли выручки по каналам, календарь активности, последние заказы и лента событий. «Поиск» и ⌘K (Ctrl+K)',
					'открывают палитру команд: раздел из палитры подсвечивается в боковом меню.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				...scriptImports(setupSource, {
					imports: [
						'BaseButton',
						'BaseCard',
						'BaseCommandPalette',
						'BaseHeader',
						'BaseHeatmap',
						'BaseKbd',
						'BaseLayout',
						'BaseLink',
						'BasePieChart',
						'BaseSideBar',
						'BaseSparkline',
						'BaseStat',
						'BaseTable',
						'BaseTimeline',
						'BaseUser',
					],
				}),
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: {
			BaseButton,
			BaseCard,
			BaseCommandPalette,
			BaseHeader,
			BaseHeatmap,
			BaseKbd,
			BaseLayout,
			BaseLink,
			BasePieChart,
			BaseSideBar,
			BaseSparkline,
			BaseStat,
			BaseTable,
			BaseTimeline,
			BaseUser,
		},
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvas.getByRole('heading', { level: 1, name: 'Обзор' })).toBeVisible()
		const sidebar = canvasElement.querySelector('.base-layout__sidebar') as HTMLElement
		if (window.innerWidth >= 768) await expect(sidebar.getBoundingClientRect().width).toBeGreaterThan(200)
		await expect(
			canvas.getByText('4,82 млн ₽', { selector: '.base-stat__content', normalizer: text => text.replace(/\s+/g, ' ').trim() }),
		).toBeVisible()

		await userEvent.click(canvas.getByRole('button', { name: 'Поиск' }))
		const dialog = await screen.findByRole('dialog', { name: 'Палитра команд' })
		const search = within(dialog).getByRole('combobox', { name: 'Поиск команды' })
		await waitFor(() => expect(search).toHaveFocus())
		await userEvent.keyboard('зак')
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByText('Открыт раздел «Заказы»')).toHaveAttribute('role', 'status'))
		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
	},
}
