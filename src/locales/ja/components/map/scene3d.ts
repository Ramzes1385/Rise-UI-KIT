/** 共通 3D シーンコア（日本語）：領域の役割、2D への切り替え、カメラ、キーボードのヒント */
export const jaScene3d = {
	scene3d: {
		ROLE: '3D シーン',
		FALLBACK_UNSUPPORTED: 'このブラウザーは 3D に対応していないため、2D 表示にしています',
		FALLBACK_ERROR: '3D を開始できなかったため、2D 表示にしています',
		CAMERA: 'カメラ',
		ROTATE_LEFT: '左に回転',
		ROTATE_RIGHT: '右に回転',
		ROTATE_QUARTER_LEFT: '左に 90° 回転',
		ROTATE_QUARTER_RIGHT: '右に 90° 回転',
		RESET_CAMERA: '視点をリセット',
		PRESETS: 'カメラビュー',
		PRESET_ISO: 'アイソメトリック',
		PRESET_ISO_90: 'アイソメトリック、90° 回転',
		PRESET_ISO_180: 'アイソメトリック、180° 回転',
		PRESET_ISO_270: 'アイソメトリック、270° 回転',
		PRESET_TOP: '真上から',
		PRESET_PERSPECTIVE: 'パースペクティブ',
		PRESET_LIVE: 'カメラビュー：{preset}',
		KEYBOARD_HINT:
			'矢印キーで隣のオブジェクト、Home と End で最初と最後、Enter またはスペースで開く、Escape でフォーカス解除。Shift と矢印キーで回転と傾き、Q と E で 90° 回転、プラスとマイナスで拡大縮小、0 で初期視点、Ctrl または ⌘ とマウスホイール、2 本指のピンチで拡大縮小',
	},
}
