/** 通用 3D 场景内核（中文）：区域角色、回退到 2D、相机和键盘提示 */
export const zhScene3d = {
	scene3d: {
		ROLE: '3D 场景',
		FALLBACK_UNSUPPORTED: '此浏览器不支持 3D，已显示 2D 视图',
		FALLBACK_ERROR: '无法启动 3D，已显示 2D 视图',
		CAMERA: '相机',
		ROTATE_LEFT: '向左旋转',
		ROTATE_RIGHT: '向右旋转',
		ROTATE_QUARTER_LEFT: '向左旋转 90°',
		ROTATE_QUARTER_RIGHT: '向右旋转 90°',
		RESET_CAMERA: '重置视角',
		PRESETS: '相机视图',
		PRESET_ISO: '等轴测',
		PRESET_ISO_90: '等轴测，旋转 90°',
		PRESET_ISO_180: '等轴测，旋转 180°',
		PRESET_ISO_270: '等轴测，旋转 270°',
		PRESET_TOP: '俯视',
		PRESET_PERSPECTIVE: '透视',
		PRESET_LIVE: '相机视图：{preset}',
		KEYBOARD_HINT:
			'方向键切换相邻对象，Home 和 End 跳到第一个和最后一个，Enter 或空格打开，Escape 取消对象焦点；Shift 加方向键旋转和倾斜，Q 和 E 旋转 90°，加号和减号缩放，0 恢复初始视角，Ctrl 或 ⌘ 加鼠标滚轮以及双指捏合缩放',
	},
}
