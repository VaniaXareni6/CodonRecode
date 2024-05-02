const { recodeGenea } = require('./genRecodigfication');

const GENEA_TO_RECODE = 'data/gen.fna';
const SELECTION_TOLERANCE = 0.9; /* SELECTION_TOLERANCE > 0 */
const TOLERANCE_SIDE = 'bottom'; /* options: [top, down] */

recodeGenea(
  GENEA_TO_RECODE,
  SELECTION_TOLERANCE,
  TOLERANCE_SIDE
);
