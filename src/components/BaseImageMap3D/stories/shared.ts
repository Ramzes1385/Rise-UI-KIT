import mallFloorUrl from './assets/mall-floor.glb?url'
import type { ImageMap3DData } from '../types/imageMap3dData.types'
import { IMAGE_MAP_FLOORS } from '@components/BaseImageMap/stories/fixtures'

const FIRST_FLOOR = IMAGE_MAP_FLOORS.layers[0]

export const MALL_FLOOR_MODEL: ImageMap3DData = {
	...IMAGE_MAP_FLOORS,
	layers: [
		{
			id: FIRST_FLOOR.id,
			title: FIRST_FLOOR.title,
			width: FIRST_FLOOR.width,
			height: FIRST_FLOOR.height,
			model: { url: mallFloorUrl },
		},
	],
	objects: IMAGE_MAP_FLOORS.objects.filter(object => object.layer === FIRST_FLOOR.id),
}
