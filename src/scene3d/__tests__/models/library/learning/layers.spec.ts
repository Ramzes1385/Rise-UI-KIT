import { describeLibraryModel } from '../../libraryChecks'
import { buildLayers } from '../../../../models/library/learning/layers'

describeLibraryModel('layers', buildLayers, { parts: ['body', 'accent', 'detail'], animations: ['pulse'], anchorY: 0.9 })
