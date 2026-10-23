/** Поля 3D узла */
export interface FlowNode3D {
	/** Модель: id встроенной (`db`, `gateway`, `cart`…), ключ `models` компонента или приложения; без него — `FlowNodeKindDef.model3d` вида, затем ключевые слова названия и меток */
	model?: string
	/** Своя модель GLB/GLTF по адресу (CORS) — вместо `model` */
	url?: string
	/** Поворот на сетке, градусы: 0, 90, 180, 270 (другое значение — к ближайшему) */
	rotation?: number
	/** Масштаб модели, > 0; по умолчанию 1 */
	scale?: number
	/** Подъём над землёй (ярусом), единицы сцены: мостик, «парящий» узел */
	elevation?: number
	/** Цвет корпуса — токен `var(--rise-…)` или CSS-цвет; по умолчанию — тема и статус */
	tint?: string
}

/** Поля 3D связи */
export interface FlowEdge3D {
	/** ribbon — лента с подписью на земле (по умолчанию), arc — дуга над землёй, tube — труба */
	shape?: 'ribbon' | 'arc' | 'tube'
	/** Высота дуги, единицы сцены; по умолчанию 1,5 */
	height?: number
}

/** Поля 3D группы */
export interface FlowGroup3D {
	/** Ярус в «Слоях»: 0 — земля; без него — по порядку групп верхнего уровня */
	level?: number
	/** Основание: dashed — пунктирная рамка на земле (по умолчанию), plate — платформа, none — без основания */
	base?: 'dashed' | 'plate' | 'none'
}

/** Поля 3D шага сценария */
export interface FlowStep3D {
	/** Анимация модели узла шага (`node`, у связи — приёмника); по умолчанию — анимация её пресета; null — без анимации */
	animation?: string | null
}

/** Настройки 3D-сцены карты */
export interface FlowView3D {
	/** Пресет камеры: iso (по умолчанию), iso-90, iso-180, iso-270, top, perspective */
	camera?: string
	/** Режим «Слои» */
	isLayered?: boolean
	/** Расстояние между ярусами, единицы сцены; по умолчанию 2,5 */
	levelGap?: number
	/** Пикселей холста 2D на единицу сцены; по умолчанию 40 */
	unit?: number
	/** Качество: auto — тени картой до 80 узлов, иначе пятна-тени; low — без теней и мелких деталей; high — тени всегда */
	quality?: 'auto' | 'low' | 'high'
}
