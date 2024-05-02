const { readFile, getFileLines, getGroupOfThreeChars, writeFile } = require('./utils');
const { generalCodons } = require('./aminoAcidsAndCodons'); /* CONTIENE DATA AUTOGENERADA (1) */
const { eColiAminos, eColiSetRecodificationInfo } = require('./escherichiaColi'); /* CONTIENE DATA AUTOGENERADA (2) */

let originalGenea = '';
let geneaRecodificated = '';
let codonAuxiliar = ''; /* Se usa para colocar el codon nuevo */
let alternativeCodonsAux = {}; /* Se usa para llevar el registro de los codones que ya se usaron en la sustitucion */

function getCodonAlternative(codonToSubstitute) { 
    /* Analiza el codon y lo sustituye si cumple las condiciones dadas */
    !alternativeCodonsAux[generalCodons[codonToSubstitute]] && (alternativeCodonsAux[generalCodons[codonToSubstitute]] = []);
    const ALTERNATIVE_CODONS = eColiAminos[generalCodons[codonToSubstitute]].recodification.codons;

    if (ALTERNATIVE_CODONS.length === 0) {
        /* Si no existe codon para sustituir, usa el codon a que ya estaba */
        codonAuxiliar = codonToSubstitute;
    } else {
        /* Analisis de cada codon seleccionado para recodificar */
        for (let i = 0; i < ALTERNATIVE_CODONS.length; i++) {

            if (alternativeCodonsAux[generalCodons[codonToSubstitute]].length === ALTERNATIVE_CODONS.length) {
                /* Reinicia los codones auxiliares si ya se usaron todos */
                alternativeCodonsAux[generalCodons[codonToSubstitute]] = [];
            };

            if (alternativeCodonsAux[generalCodons[codonToSubstitute]].indexOf(ALTERNATIVE_CODONS[i]) === -1) {
                /* Agrega el codon de sustitucion si no existe dentro de los auxiliares */
                alternativeCodonsAux[generalCodons[codonToSubstitute]].push(ALTERNATIVE_CODONS[i]);
                codonAuxiliar = ALTERNATIVE_CODONS[i]; 
                break;
            }
        }
    }
};

function codonSubstitution(gen) { 
    /* Divide el gen en 3 y analiza cada codon para determinar su sustitucion */
    geneaRecodificated = '';
    alternativeCodonsAux = {};
    const SUBSTRINGS_OF_THREE_CHARACTERS = getGroupOfThreeChars(gen);

    SUBSTRINGS_OF_THREE_CHARACTERS.forEach(codon => {
        getCodonAlternative(codon);
        geneaRecodificated += codonAuxiliar; /* Crea el nuevo gen a partir de los codones seleccionados */
    });
};

function recodeGenea(geneaToRecode, selectionTolerance, toleranceSide) {
    const GENEA_TO_RECODE_DATA = readFile(geneaToRecode);
    const GENEA_TO_RECODE_FILE_LINES = getFileLines(GENEA_TO_RECODE_DATA);

    eColiSetRecodificationInfo(selectionTolerance, toleranceSide); /* [5] - Analiza y agrega los posibles codones a recodificar */

    GENEA_TO_RECODE_FILE_LINES.forEach((fileLine, i) => {
        if (i === 0 || i % 2 === 0) return;
        originalGenea = fileLine;
        codonSubstitution(fileLine); /* [6] */
        writeFile(`-> Original genea ${i}:\n${originalGenea}\n-> Genea Recodificated ${i}:\n${geneaRecodificated}\n\n`); /* [7] Se crea archivo con los genes recodificados*/
        console.log('\n');
        console.log(`-> Original genea:\n${originalGenea}`);
        console.log('');
        console.log(`-> Genea Recodificated:\n${geneaRecodificated}`);
        console.log('\n');
    });
};

module.exports = {
    recodeGenea
};
