import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	layout: 'padded',
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'Конструктор темы: входы `createTheme()` — цвет бренда, нейтраль, скругление, плотность, тени, движение и шрифт —',
				'и сразу вид компонентов кита в светлой и тёмной теме, контраст по WCAG 2.2 AA и готовый код.',
				'',
				'Тема в приложении — `data-rise-theme` и `data-theme` на одном элементе: `applyTheme(theme)` ставит оба на `<html>`,',
				'`applyTheme(theme, { target })` — на часть интерфейса. В Storybook то же делают переключатели панели: «Тема» —',
				'режим (светлая или тёмная), «Бренд» — тема `createTheme()` поверх него: `rise` (кит как есть), пресеты',
				'`corporate`, `playful`, `minimal` и `custom` — последняя тема этого конструктора.',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
