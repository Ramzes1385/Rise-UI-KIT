/** 3D-карта BaseImageMap3D: подписи, переход в 2D и предупреждения о данных */
export const ruImageMap3d = {
	imageMap3d: {
		/** Тип области для скринридера (`aria-roledescription`) */
		ROLE: '3D-карта',
		/** Сообщение `role="status"`, когда вместо 3D показан план */
		FALLBACK_UNSUPPORTED: 'Браузер не поддерживает 3D — показан план',
		FALLBACK_ERROR: 'Не удалось запустить 3D — показан план',
		/** Группа кнопок камеры */
		CAMERA: 'Камера',
		ROTATE_LEFT: 'Повернуть влево',
		ROTATE_RIGHT: 'Повернуть вправо',
		RESET_CAMERA: 'Сбросить вид',
		/** Подсказка области карты для скринридера (`aria-describedby`) */
		KEYBOARD_HINT:
			'Стрелки — объекты, Home и End — первый и последний, Enter или пробел — открыть, Escape — снять фокус с объекта, PageUp и PageDown — этажи; Shift и стрелки — поворот и наклон, плюс и минус — масштаб, 0 — исходный вид, Ctrl или ⌘ с колесом мыши и щипок двумя пальцами — масштаб',
		/** Имя области карты из `ariaLabel` и этажа; `{label}` — `ariaLabel`, `{layer}` — текущий этаж */
		REGION_LABEL: '{label}, {layer}',
		/** Переключатель вида над картой */
		VIEW: 'Вид карты',
		VIEW_3D: '3D',
		VIEW_2D: '2D',
		/** Объявление `aria-live` при переходе стрелками; `{name}` — объект, `{layer}` — этаж */
		OBJECT_LIVE: '{name}, {layer}',
		/** Объявление `aria-live` при смене этажа */
		LAYER_LIVE: 'Показан этаж: {layer}',
		/** Предупреждение о поле данных; `{path}` — путь к полю, `{expected}` — одно из EXPECT_* */
		INVALID_FIELD: 'BaseImageMap3D: {path} = {value} не учтено — ожидается {expected}',
		/** Узел модели этажа не найден; `{layer}` — id слоя, `{name}` — имя узла, `{id}` — id объекта */
		MODEL_NODE_MISSING: 'BaseImageMap3D: в модели этажа «{layer}» нет узла «{name}» — объект «{id}» выдавлен по своей фигуре',
		/** Узел модели уже занят другим объектом (общий `meshName` или вложенный узел); `{layer}`, `{name}`, `{id}` — как выше */
		MODEL_NODE_SHARED:
			'BaseImageMap3D: меши узла «{name}» в модели этажа «{layer}» уже заняты другим объектом — объект «{id}» взял только свободные, а без них выдавлен по своей фигуре',
		/** Элемент SVG этажа не дал фигуры для 3D; `{layer}` — id слоя, `{element}` — `elementId`, `{id}` — id объекта */
		SVG_SHAPE_MISSING:
			'BaseImageMap3D: в SVG этажа «{layer}» нет фигуры для элемента «{element}» (элемента нет, он скрыт, без площади или не поддерживается) — объект «{id}» в 3D не показан',
		/** Элемент SVG части объекта не дал фигуры для 3D; `{layer}` — id слоя, `{element}` — `elementId` части, `{id}` — id объекта */
		SVG_PART_MISSING:
			'BaseImageMap3D: в SVG этажа «{layer}» нет фигуры для части «{element}» объекта «{id}» (элемента нет, он скрыт, без площади или не поддерживается) — часть в 3D не показана',
		/** Ссылки `use` в SVG этажа превысили предел копий; `{uses}` — предел ссылок, `{elements}` — предел скопированных элементов */
		SVG_USE_LIMIT:
			'BaseImageMap3D: SVG этажа раскрывает слишком много ссылок use (больше {uses} ссылок или {elements} копий элементов) — остальные ссылки use не показаны',
		/** План этажа (SVG, картинка или текстура) не загрузился; `{layer}` — id слоя, `{error}` — ошибка */
		LAYER_LOAD_FAILED: 'BaseImageMap3D: план этажа «{layer}» не загрузился — этаж показан без него. {error}',
		/** Сообщение на карте, если план этажа не загрузился; `{layers}` — названия этажей через запятую */
		LAYER_ERROR: 'Не удалось загрузить план этажа: {layers}',
		/** Модель этажа не загрузилась; `{layer}` — id слоя, `{url}` — адрес, `{error}` — ошибка */
		MODEL_LOAD_FAILED: 'BaseImageMap3D: модель этажа «{layer}» ({url}) не загрузилась — показан план. {error}',
		EXPECT_NUMBER: 'конечное число',
		EXPECT_POSITIVE: 'число больше 0',
		EXPECT_NON_NEGATIVE: 'число не меньше 0',
		EXPECT_TEXT: 'непустая строка',
		EXPECT_VECTOR: 'массив из трёх чисел [x, y, z]',
		EXPECT_MODEL: 'объект { url }',
		EXPECT_OBJECT: 'объект',
		EXPECT_LIST: 'массив',
		EXPECT_FLAG: 'true или false',
	},
}
