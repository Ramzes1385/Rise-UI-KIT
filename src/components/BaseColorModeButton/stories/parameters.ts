import type { Meta } from '@storybook/vue3-vite'
import type BaseColorModeButton from '../ui/BaseColorModeButton.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Кнопка тёмной темы для шапки приложения: переключает светлую и тёмную тему и запоминает выбор.',
				'',
				'- Управляет темой приложения через `useColorMode()`: ставит `data-theme` на `<html>` и сохраняет выбор',
				'  в localStorage. Режим «как в системе» (`data-theme="system"`) — `useColorMode().mode.value = \'system\'`.',
				'- Кнопка-переключатель: имя «Тёмная тема» не меняется, нажатое состояние (`aria-pressed`) — тёмная тема.',
				'  Иконка показывает текущую тему: солнце или луна.',
				'- Квадратная кнопка-иконка 32 × 32px при `sizeScale` = 100, варианты — как у BaseButton, по умолчанию `ghost`.',
				'- `colorMode` — свой экземпляр из `createColorMode({ target })`, чтобы переключать тему части интерфейса.',
			].join('\n'),
		},
		source: { code: '<BaseColorModeButton />' },
	},
} satisfies Meta<typeof BaseColorModeButton>['parameters']
