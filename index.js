const { valid } = require("node-html-parser");
const prompts = require("prompts");
const words = require("./words.json")

let noContain = [];
let correct = new Array(5);
let correctWord = new Array(5);
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
        } else if (!words.allowGuesses.includes(value.toUpperCase())) {
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

function init() {
    noContain.forEach(char => {
        char = [];
    });
    correct.fill(false);
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
    for (let i = 0; i < word.length; i++) {
        switch (stat[i]) {
            case "O":
                correct[i] = true;
                correctWord[i] = word[i];
                break;
            case "_":
                noContain.push(word[i]);
                break;
            case "X":
                break;
        }
    }
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
    validWords.forEach(word => {
        possibleWords += word + " ";
    });
    console.log(possibleWords);
}
async function loop() {
    while (true) {
        await main();
    }
}
console.log(validWords.length)
init();
loop();