import type { TourStep } from '../types/BaseTour.types'

export const STEPS: TourStep[] = [
	{ target: '#tour-create', title: 'Новый проект', content: 'Создайте проект, чтобы загрузить серии и распределить роли.' },
	{ target: '#tour-import', title: 'Импорт', content: 'Загрузите видео и субтитры из файла или по ссылке.' },
	{ target: '#tour-settings', title: 'Настройки', content: 'Здесь меняются язык озвучки, голоса и формат экспорта.' },
]

export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}
