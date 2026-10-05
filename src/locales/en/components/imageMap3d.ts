/** BaseImageMap3D 3D map: labels, 2D fallback and data warnings */
export const enImageMap3d = {
	imageMap3d: {
		/** Region type for screen readers (`aria-roledescription`) */
		ROLE: '3D map',
		/** `role="status"` message when the plan is shown instead of 3D */
		FALLBACK_UNSUPPORTED: 'This browser does not support 3D — showing the plan',
		FALLBACK_ERROR: 'Could not start 3D — showing the plan',
		/** Data field warning; `{path}` — field path, `{expected}` — one of EXPECT_* */
		INVALID_FIELD: 'BaseImageMap3D: {path} = {value} is ignored — expected {expected}',
		EXPECT_NUMBER: 'a finite number',
		EXPECT_POSITIVE: 'a number greater than 0',
		EXPECT_NON_NEGATIVE: 'a number not less than 0',
		EXPECT_TEXT: 'a non-empty string',
		EXPECT_VECTOR: 'an array of three numbers [x, y, z]',
		EXPECT_MODEL: 'an object { url }',
		EXPECT_OBJECT: 'an object',
	},
}
