import type BaseMap from '../ui/BaseMap.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Карта с общим API для разных поставщиков: центр (`v-model:center`), масштаб (`v-model:zoom`), метки (`markers`),',
				'события `click`, `marker-click`, `update:selected`, `locate`, `locate-error`, `ready`, `error`.',
				'',
				'- Скрипт поставщика загружается по требованию — только когда есть `apiKey`, один раз на страницу. Без ключа — заглушка',
				'  (слот `placeholder`). Ключ задаётся пропом или для всех карт настройкой плагина `defaults: { BaseMap: { apiKey } }`.',
				'- В Storybook ключ Яндекс Карт берётся из `.env.local` (`STORYBOOK_YANDEX_MAPS_API_KEY`) и подаётся как `defaults: { BaseMap: { apiKey } }` в историю «Default» —',
				'  только на dev-сервере: в статическую сборку ключ не попадает. «Default», «Markers», «Loading» и истории ниже с демо-поставщиком на этой странице открываются в своих рамках:',
				'  `window.ymaps3` один на страницу, и демо-поставщик историй с метками и загрузкой не подменяет настоящий API.',
				'- Поставщики: `yandex` — Яндекс Карты API v3, `google` — Google Maps JavaScript API (обязателен Map ID `mapId`).',
				'  Язык подписей — по языку кита или `language`. Если API уже загружено приложением, скрипт не загружается повторно.',
				'- Метки — кнопки с подписью: Tab, Enter; область карты — `role="region"` с именем «Карта» (`ariaLabel`).',
				'- Метки: `icon` и `size` меняют значок, слот `marker` рисует свою разметку, слот `balloon` с `v-model:selected` открывает окно над выбранной меткой (Esc и клик по карте закрывают), `isClustered` собирает близкие метки в группы.',
				'- Графика: `polylines` и `polygons` (подписи фигур — в скрытом списке для экранного диктора), `scheme` (`light`, `dark`, `auto` — по теме кита) и `layer` (схема, спутник, гибрид).',
				'- Управление: `hasControls` (масштаб и «моё местоположение»), `fitMarkers` с `boundsPadding`, `isDraggable`, `isScrollZoom` (колесо только с Ctrl), `staticPreview` — картинка, пока карта грузится.',
				'- В историях сеть не используется: без ключа — заглушка, в историях с метками и загрузкой — демо-поставщик.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseMap>['parameters']
