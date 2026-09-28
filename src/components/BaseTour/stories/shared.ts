import type { TourStep } from '../types/BaseTour.types'

export const STEPS: TourStep[] = [
	{ target: '#tour-create', title: 'Новый проект', content: 'Создайте проект, чтобы загрузить серии и распределить роли.' },
	{ target: '#tour-import', title: 'Импорт', content: 'Загрузите видео и субтитры из файла или по ссылке.' },
	{ target: '#tour-settings', title: 'Настройки', content: 'Здесь меняются язык озвучки, голоса и формат экспорта.' },
]

export const DEMO_TOOLBAR = `
	<div class="story-row">
		<BaseButton id="tour-create">Создать проект</BaseButton>
		<BaseButton id="tour-import" variant="outline">Импорт</BaseButton>
		<BaseButton id="tour-settings" variant="ghost">Настройки</BaseButton>
	</div>
`

export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}
