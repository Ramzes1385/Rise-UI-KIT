import { describeLibraryModel } from '../../libraryChecks'
import { buildCloud } from '../../../../models/library/edge/cloud'

describeLibraryModel('cloud', buildCloud, { parts: ['glass', 'detail'], animations: ['pulse'], anchorY: 1.22 })
