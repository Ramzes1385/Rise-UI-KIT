import type BaseImage from '../ui/BaseImage.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Изображение с плейсхолдером загрузки, состоянием ошибки, резервным `fallbackSrc` и просмотром (зумом) с галереей.',
				'',
				'- Размер — `width`/`height` (px или CSS-значение, масштабируются `sizeScale`) или `aspectRatio`; заполнение — `fit`.',
				'- Скругление по умолчанию — md из темы; `borderRadius` задаёт своё в px (9999 — круг).',
				'- `loading="lazy"`: таймаут `timeout` отсчитывается с момента, когда изображение попало в зону видимости.',
				'- `convertToWebp`/`convertToAvif` добавляют `<source>` с тем же именем и расширением .webp/.avif — только если такие',
				'  копии лежат рядом на сервере. Для `data:`/`blob:` и путей без расширения источники не строятся.',
				'- С `zoomConfig.hasZoom` изображение становится кнопкой (мышь, Enter, Space) и открывает модальный просмотр:',
				'  масштаб, поворот, мини-карта, галерея `gallery`. Фокус переходит в просмотр и возвращается после закрытия.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseImage>['parameters']
