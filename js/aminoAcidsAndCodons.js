const { readFile, getFileLines, isObjectEmpty } = require('./utils');

const CODON_TABLE_FILE_PATH = 'data/tabla_codones.txt';
const codons = {};

/* ------- DATA AUTOGENERADA ------- */
function createCodonTable() {
    /* Agrega informacion al diccionario 'codons' con la sig estructura usando la info de CODON_TABLE_FILE_PATH: { codon: aminoacid } */
    const CODON_TABLE_DATA = readFile(CODON_TABLE_FILE_PATH);
    const CODON_TABLE_FILE_LINES = getFileLines(CODON_TABLE_DATA);

    CODON_TABLE_FILE_LINES.forEach(codonTableLine => {
        if (!codonTableLine) return
        const AMINOACIDS_AND_CODONS = codonTableLine.split('\t');
        const SEPARATED_CODONS = AMINOACIDS_AND_CODONS[1].split(' ');

        SEPARATED_CODONS.forEach(codon => codons[codon] = AMINOACIDS_AND_CODONS[0]);
    });
};
/* ------- END DATA AUTOGENERADA ------- */

if (isObjectEmpty(codons)) {
    createCodonTable(); /* [1] */
};

module.exports = {
    generalCodons: codons,
};
