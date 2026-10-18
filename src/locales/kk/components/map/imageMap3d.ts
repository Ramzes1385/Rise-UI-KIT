/** BaseImageMap3D 3D-картасы: жазулар, 2D-ге өту және деректер туралы ескертулер */
export const kkImageMap3d = {
	imageMap3d: {
		ROLE: '3D-карта',
		FALLBACK_UNSUPPORTED: 'Браузер 3D-ді қолдамайды — жоспар көрсетілді',
		FALLBACK_ERROR: '3D-ді іске қосу мүмкін болмады — жоспар көрсетілді',
		CAMERA: 'Камера',
		ROTATE_LEFT: 'Солға бұру',
		ROTATE_RIGHT: 'Оңға бұру',
		RESET_CAMERA: 'Көріністі тастау',
		KEYBOARD_HINT:
			'Көрсеткілер — нысандар, Home және End — бірінші және соңғы, Enter немесе бос орын — ашу, Escape — нысаннан фокусты алу, PageUp және PageDown — қабаттар; Shift және көрсеткілер — бұру мен еңкейту, плюс және минус — масштаб, 0 — бастапқы көрініс, Ctrl немесе ⌘ мен тінтуір дөңгелегі және екі саусақпен қысу — масштаб',
		REGION_LABEL: '{label}, {layer}',
		VIEW: 'Карта көрінісі',
		VIEW_3D: '3D',
		VIEW_2D: '2D',
		OBJECT_LIVE: '{name}, {layer}',
		LAYER_LIVE: 'Көрсетілген қабат: {layer}',
		INVALID_FIELD: 'BaseImageMap3D: {path} = {value} ескерілмеді — күтілетіні: {expected}',
		MODEL_NODE_MISSING: 'BaseImageMap3D: «{layer}» қабатының моделінде «{name}» түйіні жоқ — «{id}» нысаны өз пішіні бойынша көтерілді',
		MODEL_NODE_SHARED:
			'BaseImageMap3D: «{layer}» қабатының моделіндегі «{name}» түйінінің мештері басқа нысанға тиесілі — «{id}» нысаны тек бос мештерді алды, олар болмаса өз пішіні бойынша көтерілді',
		SVG_SHAPE_MISSING:
			'BaseImageMap3D: «{layer}» қабатының SVG-інде «{element}» элементі үшін пішін жоқ (элемент жоқ, жасырын, ауданы жоқ немесе қолдау таппайды) — «{id}» нысаны 3D-де көрсетілмеді',
		SVG_PART_MISSING:
			'BaseImageMap3D: «{layer}» қабатының SVG-інде «{id}» нысанының «{element}» бөлігі үшін пішін жоқ (элемент жоқ, жасырын, ауданы жоқ немесе қолдау таппайды) — бөлік 3D-де көрсетілмеді',
		SVG_USE_LIMIT:
			'BaseImageMap3D: қабат SVG-і тым көп use сілтемесін ашады ({uses} сілтемеден немесе {elements} элемент көшірмесінен артық) — қалған use сілтемелері көрсетілмеді',
		SVG_ELEMENT_NESTED:
			'BaseImageMap3D: «{layer}» қабатының SVG-інде «{inner}» элементі «{outer}» ішінде жатыр — оның пішіні екі рет көтерілді: «{inner}» ретінде және «{outer}» құрамында',
		LAYER_LOAD_FAILED: 'BaseImageMap3D: «{layer}» қабатының жоспары жүктелмеді — қабат жоспарсыз көрсетілді. {error}',
		LAYER_ERROR: 'Жүктеу мүмкін болмады: {layers}',
		MODEL_LOAD_FAILED: 'BaseImageMap3D: «{layer}» қабатының моделі ({url}) жүктелмеді — жоспар көрсетілді. {error}',
		EXPECT_NUMBER: 'ақырлы сан',
		EXPECT_POSITIVE: '0-ден үлкен сан',
		EXPECT_NON_NEGATIVE: '0-ден кем емес сан',
		EXPECT_TEXT: 'бос емес жол',
		EXPECT_VECTOR: 'үш саннан тұратын массив [x, y, z]',
		EXPECT_MODEL: '{ url } нысаны',
		EXPECT_OBJECT: 'нысан',
		EXPECT_LIST: 'массив',
		EXPECT_FLAG: 'true немесе false',
		EXPECT_SVG_OBJECT: 'тек type: "svg" нысанында',
	},
}
