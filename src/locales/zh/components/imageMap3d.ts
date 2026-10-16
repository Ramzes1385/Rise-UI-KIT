/** Карта BaseImageMap3D (китайский): подписи, запасной вид 2D и предупреждения о данных */
export const zhImageMap3d = {
	imageMap3d: {
		ROLE: '3D 地图',
		FALLBACK_UNSUPPORTED: '此浏览器不支持 3D，已显示平面图',
		FALLBACK_ERROR: '无法启动 3D，已显示平面图',
		CAMERA: '相机',
		ROTATE_LEFT: '向左旋转',
		ROTATE_RIGHT: '向右旋转',
		RESET_CAMERA: '重置视角',
		KEYBOARD_HINT:
			'方向键切换对象，Home 和 End 键跳到第一个和最后一个，Enter 或空格键打开，Esc 键取消对象焦点，Page Up 和 Page Down 键切换楼层；Shift 加方向键旋转和倾斜，加号和减号缩放，0 键恢复初始视角，Ctrl 或 ⌘ 加鼠标滚轮以及双指捏合缩放',
		REGION_LABEL: '{label}，{layer}',
		VIEW: '地图视图',
		VIEW_3D: '3D',
		VIEW_2D: '2D',
		OBJECT_LIVE: '{name}，{layer}',
		LAYER_LIVE: '当前显示楼层：{layer}',
		INVALID_FIELD: 'BaseImageMap3D：已忽略 {path} = {value}，应为{expected}',
		MODEL_NODE_MISSING: 'BaseImageMap3D：楼层模型“{layer}”中没有节点“{name}”，对象“{id}”将按其形状拉伸生成',
		MODEL_NODE_SHARED:
			'BaseImageMap3D：楼层模型“{layer}”中节点“{name}”的网格已属于其他对象，对象“{id}”只使用了空闲网格；若没有空闲网格，则按其形状拉伸生成',
		SVG_SHAPE_MISSING:
			'BaseImageMap3D：楼层“{layer}”的 SVG 中没有元素“{element}”对应的形状（不存在、已隐藏、没有面积或不受支持），对象“{id}”不会显示在 3D 中',
		SVG_PART_MISSING:
			'BaseImageMap3D：楼层“{layer}”的 SVG 中没有对象“{id}”的部件“{element}”对应的形状（不存在、已隐藏、没有面积或不受支持），该部件不会显示在 3D 中',
		SVG_USE_LIMIT: 'BaseImageMap3D：楼层 SVG 展开的 use 引用过多（超过 {uses} 个引用或 {elements} 个复制元素），其余 use 引用不会显示',
		SVG_ELEMENT_NESTED:
			'BaseImageMap3D：楼层“{layer}”的 SVG 中，元素“{inner}”位于“{outer}”内部，其形状会被拉伸两次：一次作为“{inner}”，一次作为“{outer}”的一部分',
		LAYER_LOAD_FAILED: 'BaseImageMap3D：楼层“{layer}”的平面图加载失败，该楼层将不带平面图显示。{error}',
		LAYER_ERROR: '无法加载：{layers}',
		MODEL_LOAD_FAILED: 'BaseImageMap3D：楼层模型“{layer}”（{url}）加载失败，已显示平面图。{error}',
		EXPECT_NUMBER: '有限数值',
		EXPECT_POSITIVE: '大于 0 的数值',
		EXPECT_NON_NEGATIVE: '不小于 0 的数值',
		EXPECT_TEXT: '非空字符串',
		EXPECT_VECTOR: '由三个数字组成的数组 [x, y, z]',
		EXPECT_MODEL: '对象 { url }',
		EXPECT_OBJECT: '对象',
		EXPECT_LIST: '数组',
		EXPECT_FLAG: 'true 或 false',
		EXPECT_SVG_OBJECT: '仅适用于 type: "svg" 的对象',
	},
}
