import { ref } from 'vue'
import type meta from '../Dashboard.stories'
import { BaseKbd } from '@components/BaseKbd'
import { BaseCard } from '@components/BaseCard'
import { BaseLink } from '@components/BaseLink'
import { BaseUser } from '@components/BaseUser'
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
import type { CommandItem } from '@components/BaseCommandPalette'
import { BaseCommandPalette } from '@components/BaseCommandPalette'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'
import {
	KPIS,
	WEEKS,
	EVENTS,
	COMMANDS,
	CHANNELS,
	SECTIONS,
	ACTIVITY,
	ORDER_ROWS,
	ACTIVITY_END,
	ACTIVITY_WEEKS,
	ORDER_COLUMNS,
	formatMillions,
} from '../shared'

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
					<BaseCard v-for="kpi in kpis" :key="kpi.id">
						<div class="blk-dash__kpi">
							<p class="blk-muted">{{ kpi.label }}</p>
							<p class="blk-dash__value">{{ kpi.value }}</p>
							<p class="blk-muted">{{ kpi.delta }}</p>
							<BaseSparkline
								:values="kpi.trend"
								:labels="weeks"
								:label="kpi.label + ' по неделям'"
								:format-value="kpi.format"
								variant="area"
								:height="40" />
						</div>
					</BaseCard>
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

const script = `
const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })
const millions = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const formatRub = (value: unknown): string => rub.format(Number(value))
const formatMillions = (value: number): string => \`\${millions.format(value / 1_000_000)} млн ₽\`

const weeks = ${literal(WEEKS)}

const kpis = [
	{
		id: 'revenue',
		label: 'Выручка',
		value: '4,82 млн ₽',
		delta: '▲ 12% к августу',
		trend: [3.1, 3.4, 3.2, 3.8, 3.6, 4.0, 4.1, 3.9, 4.3, 4.5, 4.4, 4.82],
		format: (value: number) => \`\${millions.format(value)} млн ₽\`,
	},
	{
		id: 'orders',
		label: 'Заказы',
		value: '1 284',
		delta: '▲ 8% к августу',
		trend: [880, 910, 940, 1010, 990, 1050, 1080, 1120, 1150, 1190, 1230, 1284],
		format: (value: number) => \`\${value} заказов\`,
	},
	{
		id: 'check',
		label: 'Средний чек',
		value: '3 750 ₽',
		delta: '▲ 3% к августу',
		trend: [3520, 3560, 3490, 3610, 3580, 3640, 3600, 3660, 3700, 3680, 3720, 3750],
		format: (value: number) => formatRub(value),
	},
	{
		id: 'returns',
		label: 'Возвраты',
		value: '2,1%',
		delta: '▼ 0,4 п. п. к августу',
		trend: [3.2, 3.0, 2.9, 3.1, 2.8, 2.7, 2.6, 2.5, 2.5, 2.3, 2.2, 2.1],
		format: (value: number) => \`\${millions.format(value)}%\`,
	},
]

const channels = ${literal(CHANNELS)}

const activityEnd = ${literal(ACTIVITY_END)}
const activityWeeks = ${literal(ACTIVITY_WEEKS)}
const activity = Array.from({ length: activityWeeks * 7 }, (_, index) => {
	const date = new Date(Date.UTC(2026, 8, 30 - index))
	const weekday = date.getUTCDay()
	const isWeekend = weekday === 0 || weekday === 6
	return { date: date.toISOString().slice(0, 10), value: isWeekend ? index % 2 : (index * 7 + weekday * 3) % 12 }
})

const orderColumns: TableColumn[] = [
	{ key: 'number', label: 'Заказ', width: '96px' },
	{ key: 'customer', label: 'Покупатель' },
	{ key: 'status', label: 'Статус', width: '120px' },
	{ key: 'total', label: 'Сумма', align: 'right', width: '120px', formatter: formatRub },
]

const orderRows: TableRow[] = ${literal(ORDER_ROWS)}

const events: TimelineItem[] = ${literal(EVENTS)}

const sections = ${literal(SECTIONS)}

const commands: CommandItem[] = [
	...sections.map(section => ({ id: section.key, label: section.label, group: 'Разделы', icon: section.icon })),
	{ id: 'new-order', label: 'Новый заказ', group: 'Действия', icon: 'plus', shortcut: 'mod+shift+n', keywords: ['создать'] },
	{ id: 'export', label: 'Выгрузить отчёт', group: 'Действия', icon: 'download', keywords: ['excel', 'csv'] },
]

const active = ref('overview')
const message = ref('')
const isPaletteOpen = ref(false)

function choose(command: CommandItem): void {
	const isSection = sections.some(section => section.key === command.id)
	if (isSection) active.value = command.id
	message.value = isSection ? \`Открыт раздел «\${command.label}»\` : \`Выполнено: \${command.label}\`
}
`

export const Overview: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Дашборд магазина: каркас BaseLayout с липкой шапкой и боковым меню, карточки показателей со спарклайнами,',
					'доли выручки по каналам, календарь активности, последние заказы и лента событий. «Поиск» и ⌘K (Ctrl+K)',
					'открывают палитру команд: раздел из палитры подсвечивается в боковом меню.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
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
					'BaseTable',
					'BaseTimeline',
					'BaseUser',
					'type CommandItem',
					'type TableColumn',
					'type TableRow',
					'type TimelineItem',
				],
				vue: ['ref'],
				script,
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
			BaseTable,
			BaseTimeline,
			BaseUser,
		},
		setup: useStorySetup(args, {
			data: {
				kpis: KPIS,
				weeks: WEEKS,
				channels: CHANNELS,
				activity: ACTIVITY,
				activityEnd: ACTIVITY_END,
				activityWeeks: ACTIVITY_WEEKS,
				orderColumns: ORDER_COLUMNS,
				orderRows: ORDER_ROWS,
				events: EVENTS,
				sections: SECTIONS,
				commands: COMMANDS,
				formatMillions,
			},
			setup: () => {
				const active = ref('overview')
				const message = ref('')
				const isPaletteOpen = ref(false)
				const choose = (command: CommandItem): void => {
					const isSection = SECTIONS.some(section => section.key === command.id)
					if (isSection) active.value = command.id
					message.value = isSection ? `Открыт раздел «${command.label}»` : `Выполнено: ${command.label}`
				}
				return { active, message, isPaletteOpen, choose }
			},
		}),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvas.getByRole('heading', { level: 1, name: 'Обзор' })).toBeVisible()
		const sidebar = canvasElement.querySelector('.base-layout__sidebar') as HTMLElement
		if (window.innerWidth >= 768) await expect(sidebar.getBoundingClientRect().width).toBeGreaterThan(200)
		await expect(canvas.getByText('4,82 млн ₽', { selector: '.blk-dash__value' })).toBeVisible()

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
