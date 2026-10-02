import { avatarImage } from '@/stories/helpers'
import seriesVideo from '@components/BaseMediaPlayer/stories/media/demo.webm'
import seriesCover from '@components/BaseMediaPlayer/stories/media/demo-cover.webp'
import posterEpisode1 from '@components/BaseMediaPlayer/stories/media/demo-episode-1.webp'
import posterEpisode2 from '@components/BaseMediaPlayer/stories/media/demo-episode-2.webp'
import posterEpisode3 from '@components/BaseMediaPlayer/stories/media/demo-episode-3.webp'

export const seriesMedia = {
	video: seriesVideo,
	cover: seriesCover,
	posters: [posterEpisode1, posterEpisode2, posterEpisode3],
	avatars: [avatarImage(24), avatarImage(210), avatarImage(150)],
}
