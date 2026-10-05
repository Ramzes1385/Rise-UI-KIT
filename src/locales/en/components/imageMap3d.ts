/** BaseImageMap3D 3D map: labels, 2D fallback and data warnings */
export const enImageMap3d = {
	imageMap3d: {
		/** Region type for screen readers (`aria-roledescription`) */
		ROLE: '3D map',
		/** `role="status"` message when the plan is shown instead of 3D */
		FALLBACK_UNSUPPORTED: 'This browser does not support 3D — showing the plan',
		FALLBACK_ERROR: 'Could not start 3D — showing the plan',
		/** Camera button group */
		CAMERA: 'Camera',
		ROTATE_LEFT: 'Rotate left',
		ROTATE_RIGHT: 'Rotate right',
		RESET_CAMERA: 'Reset view',
		/** Map region hint for screen readers (`aria-describedby`) */
		KEYBOARD_HINT:
			'Arrows — objects, Enter — open, Escape — clear focus, PageUp and PageDown — floors; Shift and arrows — rotate and tilt, plus and minus — zoom, 0 — initial view, Ctrl and mouse wheel — zoom',
		/** View switch above the map */
		VIEW: 'Map view',
		VIEW_3D: '3D',
		VIEW_2D: '2D',
		/** `aria-live` announcement when moving with arrows; `{name}` — object, `{layer}` — floor */
		OBJECT_LIVE: '{name}, {layer}',
		/** `aria-live` announcement when the floor changes */
		LAYER_LIVE: 'Floor shown: {layer}',
		/** Data field warning; `{path}` — field path, `{expected}` — one of EXPECT_* */
		INVALID_FIELD: 'BaseImageMap3D: {path} = {value} is ignored — expected {expected}',
		/** Floor model node not found; `{layer}` — layer id, `{name}` — node name, `{id}` — object id */
		MODEL_NODE_MISSING: 'BaseImageMap3D: the floor model «{layer}» has no node «{name}» — object «{id}» is extruded from its shape',
		EXPECT_NUMBER: 'a finite number',
		EXPECT_POSITIVE: 'a number greater than 0',
		EXPECT_NON_NEGATIVE: 'a number not less than 0',
		EXPECT_TEXT: 'a non-empty string',
		EXPECT_VECTOR: 'an array of three numbers [x, y, z]',
		EXPECT_MODEL: 'an object { url }',
		EXPECT_OBJECT: 'an object',
	},
}
