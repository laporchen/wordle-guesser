import chalk from 'chalk';
import prompts from "prompts";
import words from './words.js'

const TERMINAL_COLS = process.stdout.columns;

let noContain = [];
let contain = [];
let correct = new Array(5);
let correctWord = new Array(5);

let triedPositions = new Map();
let validWords = words.words;

const wordlePrompt = {
    type: "text",
    name: "word",
    format: (value) => {
        return value.toUpperCase();
    },
    message: "Enter a 5 letter word...",
    validate: (value) => {
        if (value.length != 5) {
            return "Word must be 5 letters";
        } else if (!/^[a-z]+$/i.test(value)) {
            return "Word must only contain letters";
        } else if (!words.allowGuesses.includes(value.toUpperCase()) && !validWords.includes(value.toUpperCase())) {
            // wordsJSON is now in uppercase, so can directly check via includes
            return "Word not found in word list";
        }
        return true;
    }
};
const statPrompt = {
    type: "text",
    name: "stat",
    message: "Enter the guess result (O: correct position, X: wrong spot, _: not in word) :",
    validate: (value) => {
        if (value.length != 5) {
            return "Guess must be 5 letters";
        } else if (!/^[OX_]+$/i.test(value)) {
            return "Guess must only contain O, X, or _";
        }
        return true;
    }
}

async function init() {
    let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    noContain.forEach(char => {
        char = [];
    });
    correct.fill(false);
    for (let i = 0; i < 26; ++i) {
        triedPositions.set(alphabet[i], []);
    }
}
async function getUserInput() {
    let response = await prompts(wordlePrompt);
    if (response.word === undefined) {
        process.exit(0);
    }
    let word = response.word;
    response = await prompts(statPrompt);
    if (response.stat === undefined) {
        process.exit(0);
    }
    let stat = response.stat;
    await resultHandle(word, stat);

}

async function resultHandle(word, stat) {
    let result = "";
    let color = chalk.white.bgGrey;
    for (let i = 0; i < word.length; i++) {
        switch (stat[i]) {
            case "O":
                correct[i] = true;
                correctWord[i] = word[i];
                color = chalk.white.bgGreen;
                break;
            case "_":
                noContain.push(word[i]);
                color = chalk.white.bgGray;
                break;
            case "X":
                if (!contain.includes(word[i])) {
                    contain.push(word[i]);
                    triedPositions.set(word[i], []);
                }
                triedPositions.get(word[i]).push(i);
                color = chalk.white.bgYellow;
                break;
        }
        result += color.bold(` ${word[i]} `);
    }
    let globalResults = result.padEnd(result.length + TERMINAL_COLS - 15, " ");
    process.stdout.write(globalResults);
}
// change to regex someday
async function checkWordList() {
    let newList = [];
    validWords.forEach(word => {
        let valid = true;
        for (let i = 0; i < word.length; i++) {
            if (correct[i]) {
                if (word[i] !== correctWord[i]) {
                    valid = false;
                    break;
                }
            }
            else {
                if (noContain.includes(word[i])) {
                    valid = false;
                    break;
                }
            }
        }
        contain.forEach(char => {
            if (word.indexOf(char) == -1) {
                valid = false;
            } else if (triedPositions.get(char).includes(word.indexOf(char))) {
                valid = false;
            }
        });


        if (valid) {
            newList.push(word);
        }
    });
    validWords = newList;
}


async function main() {
    if (await getUserInput() === false) {
        return false;
    };
    await checkWordList();
    let possibleWords = ""
    console.log("Possible words: ");
    let idx = 0;
    validWords.forEach(word => {
        if (idx === 10) {
            console.log(possibleWords);
            possibleWords = "";
            idx = 0;
        }
        possibleWords += word + " ";
        ++idx;
    });
    console.log(possibleWords);
}
async function loop() {
    while (true) {
        await main();
    }
}
init();
loop();