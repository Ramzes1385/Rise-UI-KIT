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
			'Arrows — objects, Home and End — first and last, Enter or Space — open, Escape — clear object focus, PageUp and PageDown — floors; Shift and arrows — rotate and tilt, plus and minus — zoom, 0 — initial view, Ctrl or ⌘ with the mouse wheel and a two-finger pinch — zoom',
		/** Map region name from `ariaLabel` and the floor; `{label}` — `ariaLabel`, `{layer}` — current floor */
		REGION_LABEL: '{label}, {layer}',
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
		/** Model node already belongs to another object (shared `meshName` or nested node); `{layer}`, `{name}`, `{id}` — as above */
		MODEL_NODE_SHARED:
			'BaseImageMap3D: meshes of node «{name}» in the floor model «{layer}» already belong to another object — object «{id}» took only free meshes, or is extruded from its shape if none are free',
		/** SVG element of the floor gave no shape for 3D; `{layer}` — layer id, `{element}` — `elementId`, `{id}` — object id */
		SVG_SHAPE_MISSING:
			'BaseImageMap3D: the SVG of floor «{layer}» has no shape for element «{element}» (it is missing, hidden, has no area or is unsupported) — object «{id}» is not shown in 3D',
		/** SVG element of an object part gave no shape for 3D; `{layer}` — layer id, `{element}` — part `elementId`, `{id}` — object id */
		SVG_PART_MISSING:
			'BaseImageMap3D: the SVG of floor «{layer}» has no shape for part «{element}» of object «{id}» (it is missing, hidden, has no area or is unsupported) — the part is not shown in 3D',
		/** `use` references in the floor SVG exceeded the copy limit; `{uses}` — reference limit, `{elements}` — copied element limit */
		SVG_USE_LIMIT:
			'BaseImageMap3D: the floor SVG expands too many use references (more than {uses} references or {elements} copied elements) — the remaining use references are not shown',
		/** An SVG element of an object or part lies inside another such element; `{layer}` — layer id, `{inner}` and `{outer}` — `elementId` */
		SVG_ELEMENT_NESTED:
			'BaseImageMap3D: in the SVG of floor «{layer}» element «{inner}» lies inside «{outer}» — its shape is extruded twice: for «{inner}» and as part of «{outer}»',
		/** Floor plan (SVG, image or texture) failed to load; `{layer}` — layer id, `{error}` — error */
		LAYER_LOAD_FAILED: 'BaseImageMap3D: the plan of floor «{layer}» failed to load — the floor is shown without it. {error}',
		/** Message on the map when a floor plan failed to load; `{layers}` — floor titles separated by commas */
		LAYER_ERROR: 'Could not load: {layers}',
		/** Floor model failed to load; `{layer}` — layer id, `{url}` — address, `{error}` — error */
		MODEL_LOAD_FAILED: 'BaseImageMap3D: the floor model «{layer}» ({url}) failed to load — showing the plan. {error}',
		EXPECT_NUMBER: 'a finite number',
		EXPECT_POSITIVE: 'a number greater than 0',
		EXPECT_NON_NEGATIVE: 'a number not less than 0',
		EXPECT_TEXT: 'a non-empty string',
		EXPECT_VECTOR: 'an array of three numbers [x, y, z]',
		EXPECT_MODEL: 'an object { url }',
		EXPECT_OBJECT: 'an object',
		EXPECT_LIST: 'an array',
		EXPECT_FLAG: 'true or false',
		EXPECT_SVG_OBJECT: 'only on an object with type: "svg"',
	},
}
