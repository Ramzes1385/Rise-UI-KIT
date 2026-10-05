import type BaseIcon from '../ui/BaseIcon.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Иконка из SVG-спрайта библиотеки (`icons.svg`): `<BaseIcon name="search" />`. Имя — имя файла из `src/icons/svg`.',
				'',
				"- Размер 20px при `sizeScale` = 100. Типовые размеры — `calcIconScale('xs' | 'sm' | 'md' | 'lg' | 'xl', sizeScale)`: 12, 16, 20, 28 и 36px.",
				'- Цвет наследуется от текста (`currentColor`); проп `color` задаёт его явно — лучше токеном `var(--rise-…)`.',
				'- Без `ariaLabel` иконка декоративная (`aria-hidden`), с `ariaLabel` — изображение с доступным именем (`role="img"`).',
				'- Перекраска — токены `--rise-icon-*`, классы частей — проп `ui` (история «Токены»); движение — история «Анимации».',
				'',
				'Путь к спрайту в приложении задаёт `createUiKitPlugin({ iconSpritePath })`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseIcon>['parameters']
