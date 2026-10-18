/** Shared 3D scene core: region role, 2D fallback, camera and keyboard hint */
export const enScene3d = {
	scene3d: {
		ROLE: '3D scene',
		FALLBACK_UNSUPPORTED: 'This browser does not support 3D — showing the 2D view',
		FALLBACK_ERROR: 'Could not start 3D — showing the 2D view',
		CAMERA: 'Camera',
		ROTATE_LEFT: 'Rotate left',
		ROTATE_RIGHT: 'Rotate right',
		ROTATE_QUARTER_LEFT: 'Rotate 90° left',
		ROTATE_QUARTER_RIGHT: 'Rotate 90° right',
		RESET_CAMERA: 'Reset view',
		PRESETS: 'Camera views',
		PRESET_ISO: 'Isometric',
		PRESET_ISO_90: 'Isometric, rotated 90°',
		PRESET_ISO_180: 'Isometric, rotated 180°',
		PRESET_ISO_270: 'Isometric, rotated 270°',
		PRESET_TOP: 'Top view',
		PRESET_PERSPECTIVE: 'Perspective',
		PRESET_LIVE: 'Camera view: {preset}',
		KEYBOARD_HINT:
			'Arrows — neighbouring object, Home and End — first and last, Enter or Space — open, Escape — clear object focus; Shift and arrows — rotate and tilt, Q and E — rotate 90°, plus and minus — zoom, 0 — initial view, Ctrl or ⌘ with the mouse wheel and a two-finger pinch — zoom',
	},
}
