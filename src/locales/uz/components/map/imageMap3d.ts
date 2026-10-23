/** BaseImageMap3D 3D-xaritasi: yozuvlar, 2D ga oʻtish va maʼlumotlar haqida ogohlantirishlar */
export const uzImageMap3d = {
	imageMap3d: {
		ROLE: '3D-xarita',
		FALLBACK_UNSUPPORTED: 'Brauzer 3D ni qoʻllab-quvvatlamaydi — reja koʻrsatildi',
		FALLBACK_ERROR: '3D ni ishga tushirib boʻlmadi — reja koʻrsatildi',
		CAMERA: 'Kamera',
		ROTATE_LEFT: 'Chapga burish',
		ROTATE_RIGHT: 'Oʻngga burish',
		RESET_CAMERA: 'Koʻrinishni tiklash',
		KEYBOARD_HINT:
			'Strelkalar — obyektlar, Home va End — birinchi va oxirgi, Enter yoki probel — ochish, Escape — obyektdan fokusni olish, PageUp va PageDown — qavatlar; Shift va strelkalar — burish va ogʻdirish, plyus va minus — masshtab, 0 — dastlabki koʻrinish, Ctrl yoki ⌘ bilan sichqoncha gʻildiragi va ikki barmoq bilan chimdish — masshtab',
		REGION_LABEL: '{label}, {layer}',
		VIEW: 'Xarita koʻrinishi',
		VIEW_3D: '3D',
		VIEW_2D: '2D',
		OBJECT_LIVE: '{name}, {layer}',
		LAYER_LIVE: 'Koʻrsatilgan qavat: {layer}',
		INVALID_FIELD: 'BaseImageMap3D: {path} = {value} hisobga olinmadi — kutilgani: {expected}',
		MODEL_NODE_MISSING:
			'BaseImageMap3D: «{layer}» qavati modelida «{name}» tuguni yoʻq — «{id}» obyekti oʻz shakli boʻyicha koʻtarildi',
		MODEL_NODE_SHARED:
			'BaseImageMap3D: «{layer}» qavati modelidagi «{name}» tuguni meshlari boshqa obyektga tegishli — «{id}» obyekti faqat boʻsh meshlarni oldi, ular boʻlmasa oʻz shakli boʻyicha koʻtarildi',
		SVG_SHAPE_MISSING:
			'BaseImageMap3D: «{layer}» qavati SVG sida «{element}» elementi uchun shakl yoʻq (element yoʻq, yashirin, maydonsiz yoki qoʻllab-quvvatlanmaydi) — «{id}» obyekti 3D da koʻrsatilmadi',
		SVG_PART_MISSING:
			'BaseImageMap3D: «{layer}» qavati SVG sida «{id}» obyektining «{element}» qismi uchun shakl yoʻq (element yoʻq, yashirin, maydonsiz yoki qoʻllab-quvvatlanmaydi) — qism 3D da koʻrsatilmadi',
		SVG_USE_LIMIT:
			'BaseImageMap3D: qavat SVG si juda koʻp use havolasini ochmoqda ({uses} havoladan yoki {elements} element nusxasidan ortiq) — qolgan use havolalari koʻrsatilmadi',
		SVG_ELEMENT_NESTED:
			'BaseImageMap3D: «{layer}» qavati SVG sida «{inner}» elementi «{outer}» ichida joylashgan — uning shakli ikki marta koʻtarildi: «{inner}» sifatida va «{outer}» tarkibida',
		LAYER_LOAD_FAILED: 'BaseImageMap3D: «{layer}» qavati rejasi yuklanmadi — qavat rejasiz koʻrsatildi. {error}',
		LAYER_ERROR: 'Yuklab boʻlmadi: {layers}',
		MODEL_LOAD_FAILED: 'BaseImageMap3D: «{layer}» qavati modeli ({url}) yuklanmadi — reja koʻrsatildi. {error}',
		EXPECT_NUMBER: 'chekli son',
		EXPECT_POSITIVE: '0 dan katta son',
		EXPECT_NON_NEGATIVE: '0 dan kam boʻlmagan son',
		EXPECT_TEXT: 'boʻsh boʻlmagan satr',
		EXPECT_VECTOR: 'uchta sondan iborat massiv [x, y, z]',
		EXPECT_MODEL: '{ url } obyekti',
		EXPECT_OBJECT: 'obyekt',
		EXPECT_LIST: 'massiv',
		EXPECT_FLAG: 'true yoki false',
		EXPECT_SVG_OBJECT: 'faqat type: "svg" obyektida',
	},
}
