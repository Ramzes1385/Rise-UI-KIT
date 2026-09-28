import './foundations.scss'
import { ref } from 'vue'
import { expect } from 'storybook/test'
import { BaseAlert } from '@components/BaseAlert'
import { BaseBadge } from '@components/BaseBadge'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseSwitch } from '@components/BaseSwitch'
import { BaseCheckbox } from '@components/BaseCheckbox'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Foundations/Theming',
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				component: [
					'Тема — это значения токенов. Светлая действует по умолчанию, тёмная включается атрибутом `data-theme="dark"`',
					'на `<html>` или на любом контейнере. Внутри тёмной области можно вернуть светлую — `data-theme="light"`.',
					'',
					'Бренд перекрашивается палитрой `--rise-color-primary-50 … 950`: на `:root` — для всего приложения,',
					'на элементе с `data-theme` — для части интерфейса. Скругления всего интерфейса задаёт одна база `--rise-radius`.',
				].join('\n'),
			},
		},
	},
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Одинаковый набор компонентов, который показывают все примеры страницы. */
const Sample = {
	components: { BaseAlert, BaseBadge, BaseButton, BaseCheckbox, BaseInput, BaseSwitch },
	setup: () => ({ text: ref('Анна'), on: ref(true), checked: ref(true) }),
	template: `
		<div class="story-col" style="width: 100%;">
			<div class="story-row">
				<BaseButton>Сохранить</BaseButton>
				<BaseButton variant="soft">Черновик</BaseButton>
				<BaseButton variant="outline">Отмена</BaseButton>
				<BaseBadge label="Новый" variant="soft" />
			</div>
			<BaseInput v-model="text" label="Имя" style="max-width: 280px;" />
			<div class="story-row">
				<BaseSwitch v-model="on" label="Уведомления" />
				<BaseCheckbox v-model="checked" label="Согласен с условиями" />
			</div>
			<BaseAlert type="info" title="Доступно обновление" description="Новая версия ускоряет загрузку отчётов." />
		</div>
	`,
}

/**
 * Светлая и тёмная тема рядом. Каждая панель задаёт свой `data-theme`, поэтому показывает свою тему
 * независимо от переключателя на панели инструментов.
 */
export const LightAndDark: Story = {
	parameters: {
		docs: {
			source: {
				code: [
					'<!-- тема всего приложения -->',
					'<html data-theme="dark">',
					'',
					'<!-- тема части интерфейса -->',
					'<section data-theme="light">…</section>',
				].join('\n'),
			},
		},
	},
	render: () => ({
		components: { Sample },
		template: `
			<div class="fnd-themes">
				<div class="fnd-themes__panel" data-theme="light"><span class="story-label">data-theme="light"</span><Sample /></div>
				<div class="fnd-themes__panel" data-theme="dark"><span class="story-label">data-theme="dark"</span><Sample /></div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [light, dark] = [...canvasElement.querySelectorAll<HTMLElement>('.fnd-themes__panel')]
		await expect(getComputedStyle(light).backgroundColor).toBe('rgb(255, 255, 255)')
		await expect(getComputedStyle(dark).backgroundColor).toBe('rgb(24, 24, 27)')
	},
}

/**
 * Перекраска бренда: палитра primary переопределена на контейнере с `data-theme` — кнопки, бейдж, переключатель,
 * чекбокс и фокус получают фиолетовый бренд без правок стилей компонентов.
 */
export const BrandColor: Story = {
	parameters: {
		docs: {
			source: {
				code: [
					':root {',
					'  --rise-color-primary-50: #f5f3ff;',
					'  --rise-color-primary-100: #ede9fe;',
					'  --rise-color-primary-200: #ddd6fe;',
					'  --rise-color-primary-300: #c4b5fd;',
					'  --rise-color-primary-400: #a78bfa;',
					'  --rise-color-primary-700: #6d28d9;',
					'  --rise-color-primary-800: #5b21b6;',
					'  /* …и остальные оттенки 500–950 */',
					'}',
				].join('\n'),
			},
		},
	},
	render: () => ({
		components: { Sample },
		template: `
			<div
				class="fnd-themes__panel"
				data-theme="light"
				style="--rise-color-primary-50: #f5f3ff; --rise-color-primary-100: #ede9fe; --rise-color-primary-200: #ddd6fe; --rise-color-primary-300: #c4b5fd; --rise-color-primary-400: #a78bfa; --rise-color-primary-500: #8b5cf6; --rise-color-primary-600: #7c3aed; --rise-color-primary-700: #6d28d9; --rise-color-primary-800: #5b21b6; --rise-color-primary-900: #4c1d95; --rise-color-primary-950: #2e1065;">
				<Sample />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Сохранить' })).backgroundColor).toBe('rgb(109, 40, 217)')
	},
}

/** Скругления: база `--rise-radius` на контейнере — 0 для строгого интерфейса и 8px для мягкого (по умолчанию 4px). */
export const Radius: Story = {
	parameters: {
		docs: { source: { code: ':root {\n  --rise-radius: 0px; /* или 8px */\n}' } },
	},
	render: () => ({
		components: { Sample },
		template: `
			<div class="fnd-themes">
				<div class="fnd-themes__panel" data-theme="light" style="--rise-radius: 0px;"><span class="story-label">--rise-radius: 0px</span><Sample /></div>
				<div class="fnd-themes__panel" data-theme="light" style="--rise-radius: 8px;"><span class="story-label">--rise-radius: 8px</span><Sample /></div>
			</div>
		`,
	}),
}
