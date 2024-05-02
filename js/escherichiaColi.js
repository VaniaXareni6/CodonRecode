const { readFile, getFileLines, isObjectEmpty, getGroupOfThreeChars, getObjectLength } = require('./utils');
const { generalCodons } = require('./aminoAcidsAndCodons');

const aminoTotalsKeys = ['totalCodonsFreq', 'estimatedRelativeCodonFreq', 'recodification'];
const codonValuesKeys = ['absoluteFreq', 'relativeFreq'];
const E_COLI_GENOM_FILE_PATH = 'data/eco.fna';
const eColiCodonsSumatory = {};
const eColiAminos = {};

/* ------- DATA AUTOGENERADA ------- */
function codonFrequencyCalculation() {
    /* 2.- Cuenta los codones que hay en la secuencia del eColi - Y se guardan en eColiCodonsSumatory */
    const E_COLI_GENOM_DATA = readFile(E_COLI_GENOM_FILE_PATH);
    const E_COLI_GENOM_FILE_LINES = getFileLines(E_COLI_GENOM_DATA);

    E_COLI_GENOM_FILE_LINES.forEach((fileLine, i) => {
        if (i === 0 || i % 2 === 0) return;
        const SUBSTRINGS_OF_THREE_CHARACTERS = getGroupOfThreeChars(fileLine);

        SUBSTRINGS_OF_THREE_CHARACTERS.forEach(codon => {
            !eColiCodonsSumatory[codon] && (eColiCodonsSumatory[codon] = 0);
            eColiCodonsSumatory[codon]++;
        });
    });
};

function setAminoTotals(amino, codon) {
    /* Suma todos los absoluteFreq de cada codon del aminoacido */
    const TOTAL_AMINO_CODONS = getObjectLength(eColiAminos[amino]) - aminoTotalsKeys.length;
    eColiAminos[amino][aminoTotalsKeys[0]] += eColiCodonsSumatory[codon]; /* totalCodonsFreq */
    eColiAminos[amino][aminoTotalsKeys[1]] = parseFloat((100 / (TOTAL_AMINO_CODONS)).toFixed(2)); /* estimatedRelativeCodonFreq */
};

function setInitialValues(amino) {
    /* Se crea objeto con valores iniciales para preservar la informacion a recodificar */
    if (!eColiAminos[amino]) {
        eColiAminos[amino] = {
            [aminoTotalsKeys[0]]: 0, /* totalCodonsFreq */
            [aminoTotalsKeys[1]]: 0, /* estimatedRelativeCodonFreq */
            [aminoTotalsKeys[2]]: {  /* recodification */
                type: '',
                tolerance: 0,
                cutOff: 0,
                codons: []
            },
        };
    };

};

function codonAbsoluteCalculation() {
    /* Crea objeto con de valores iniciales, suma cada absoluteFreq de cada codon dentro del aminoacido. Calcula estimatedRelativeCodonFreq. */
    for (const codon in generalCodons) {
        const AMINO_ACID = generalCodons[codon];

        /* Creacion de objeto base con valores iniciales */
        setInitialValues(AMINO_ACID);

        if (!eColiAminos[AMINO_ACID][codon]) {
            eColiAminos[AMINO_ACID][codon] = {
                [codonValuesKeys[0]]: eColiCodonsSumatory[codon], /* absoluteFreq *//* Aqui se agrega el valor del codon calculado en [2] codonFrequencyCalculation */
                [codonValuesKeys[1]]: 0 /* relativeFreq *//* Aprovechamos ente paso para colocar este valor inicial */
            }
        };

        setAminoTotals(AMINO_ACID, codon);
    }
};

function relativeCodonCalculation() {
    /* Se calcula la relativeFreq de cada codon */
    for (const aminoAcid in eColiAminos) {
        const AMINO_ACID_CODON_GROUP_TOTAL = eColiAminos[aminoAcid][aminoTotalsKeys[0]]; /* totalCodonsFreq */

        for (const codon in eColiAminos[aminoAcid]) {
            if (aminoTotalsKeys.indexOf(codon) !== -1) continue; /* Evita que lea los valores de aminoTotalsKeys */
            const CODON_ABS_FREQ = eColiAminos[aminoAcid][codon][codonValuesKeys[0]]; /* absoluteFreq */
            const CODON_REL_FREQ = (CODON_ABS_FREQ / AMINO_ACID_CODON_GROUP_TOTAL) * 100;
            eColiAminos[aminoAcid][codon][codonValuesKeys[1]] = parseFloat(CODON_REL_FREQ.toFixed(2));
        }
    }
};
/* ------- END DATA AUTOGENERADA ------- */

function setRecodificationInfo(selectionTolerance, recodificationType) {
    /* Recorremos cada aminoacido para colocarle la informacion */
    for (const amino in eColiAminos) {
        eColiAminos[amino][aminoTotalsKeys[2]]['tolerance'] = selectionTolerance;
        eColiAminos[amino][aminoTotalsKeys[2]]['cutOff'] = eColiAminos[amino][aminoTotalsKeys[1]] * selectionTolerance; /* Crea un limite basandose en el estimatedRelativeCodonFreq y el limite top/bottom */
        eColiAminos[amino][aminoTotalsKeys[2]]['type'] = recodificationType;
        for (codon in eColiAminos[amino]) {
            if (aminoTotalsKeys.indexOf(codon) !== -1) continue; /* Evita que lea valores de aminoTotalsKeys */
            /* Guarda en codons[] los codones que cumplen la condicion de top/bottom, para usarlos posteriormente en la recodificacion */
            if (eColiAminos[amino][aminoTotalsKeys[2]]['type'] === 'top') {
                if (eColiAminos[amino][codon]['relativeFreq'] >= eColiAminos[amino][aminoTotalsKeys[2]]['cutOff']) {
                    eColiAminos[amino][aminoTotalsKeys[2]]['codons'].push(codon);
                }
            } else if (eColiAminos[amino][aminoTotalsKeys[2]]['type'] === 'bottom') {
                if (eColiAminos[amino][codon]['relativeFreq'] <= eColiAminos[amino][aminoTotalsKeys[2]]['cutOff']) {
                    eColiAminos[amino][aminoTotalsKeys[2]]['codons'].push(codon);
                }
            }
        }
    }

    console.log('JSON.stringify(eColiAminos, null, 2)---')
    console.log(JSON.stringify(eColiAminos, null, 2))
};


if (isObjectEmpty(eColiAminos)) {
    codonFrequencyCalculation(); /* [2] */
    codonAbsoluteCalculation(); /* [3] */
    relativeCodonCalculation(); /* [4] */
};

module.exports = {
    eColiAminos,
    eColiSetRecodificationInfo: setRecodificationInfo
};
