/** Карта BaseImageMap3D (японский): подписи, запасной вид 2D и предупреждения о данных */
export const jaImageMap3d = {
	imageMap3d: {
		ROLE: '3D マップ',
		FALLBACK_UNSUPPORTED: 'このブラウザーは 3D に対応していないため、平面図を表示しています',
		FALLBACK_ERROR: '3D を開始できなかったため、平面図を表示しています',
		CAMERA: 'カメラ',
		ROTATE_LEFT: '左に回転',
		ROTATE_RIGHT: '右に回転',
		RESET_CAMERA: '視点をリセット',
		KEYBOARD_HINT:
			'矢印キーでオブジェクトを切り替え、Home と End で最初と最後へ、Enter またはスペースキーで開く、Escape でオブジェクトのフォーカスを解除、Page Up と Page Down でフロアを切り替えます。Shift と矢印キーで回転と傾き、プラスとマイナスで拡大縮小、0 で初期の視点に戻り、Ctrl または ⌘ とマウスホイール、2 本指のピンチでも拡大縮小できます',
		REGION_LABEL: '{label}、{layer}',
		VIEW: '地図の表示',
		VIEW_3D: '3D',
		VIEW_2D: '2D',
		OBJECT_LIVE: '{name}、{layer}',
		LAYER_LIVE: '表示中のフロア：{layer}',
		INVALID_FIELD: 'BaseImageMap3D：{path} = {value} を無視しました（期待される値：{expected}）',
		MODEL_NODE_MISSING:
			'BaseImageMap3D：フロアモデル「{layer}」にノード「{name}」がありません。オブジェクト「{id}」は図形から押し出して作成します',
		MODEL_NODE_SHARED:
			'BaseImageMap3D：フロアモデル「{layer}」のノード「{name}」のメッシュはすでに別のオブジェクトに属しています。オブジェクト「{id}」は空いているメッシュだけを使用し、空きがない場合は図形から押し出して作成します',
		SVG_SHAPE_MISSING:
			'BaseImageMap3D：フロア「{layer}」の SVG に要素「{element}」の図形がありません（存在しない、非表示、面積がない、または未対応）。オブジェクト「{id}」は 3D に表示されません',
		SVG_PART_MISSING:
			'BaseImageMap3D：フロア「{layer}」の SVG にオブジェクト「{id}」のパーツ「{element}」の図形がありません（存在しない、非表示、面積がない、または未対応）。このパーツは 3D に表示されません',
		SVG_USE_LIMIT:
			'BaseImageMap3D：フロアの SVG で展開される use 参照が多すぎます（参照が {uses} 件、またはコピーされる要素が {elements} 件を超えています）。残りの use 参照は表示されません',
		SVG_ELEMENT_NESTED:
			'BaseImageMap3D：フロア「{layer}」の SVG で、要素「{inner}」が「{outer}」の内側にあります。図形は「{inner}」として、また「{outer}」の一部として 2 回押し出されます',
		LAYER_LOAD_FAILED: 'BaseImageMap3D：フロア「{layer}」の平面図を読み込めませんでした。平面図なしでフロアを表示します。{error}',
		LAYER_ERROR: '読み込めませんでした：{layers}',
		MODEL_LOAD_FAILED: 'BaseImageMap3D：フロアモデル「{layer}」（{url}）を読み込めませんでした。平面図を表示します。{error}',
		EXPECT_NUMBER: '有限の数値',
		EXPECT_POSITIVE: '0 より大きい数値',
		EXPECT_NON_NEGATIVE: '0 以上の数値',
		EXPECT_TEXT: '空でない文字列',
		EXPECT_VECTOR: '3 つの数値の配列 [x, y, z]',
		EXPECT_MODEL: 'オブジェクト { url }',
		EXPECT_OBJECT: 'オブジェクト',
		EXPECT_LIST: '配列',
		EXPECT_FLAG: 'true または false',
		EXPECT_SVG_OBJECT: 'type: "svg" のオブジェクトのみ',
	},
}
