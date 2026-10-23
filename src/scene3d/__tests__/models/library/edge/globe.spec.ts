import { describeLibraryModel } from '../../libraryChecks'
import { buildGlobe } from '../../../../models/library/edge/globe'

describeLibraryModel('globe', buildGlobe, { parts: ['body', 'accent', 'detail'], animations: ['spin'], anchorY: 1.36 })
