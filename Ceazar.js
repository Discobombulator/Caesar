const { error } = require('console');
const fs = require('fs');


function encode(text, shift, language) {
  let result = "";
  let length = language.length;
  let lowerCase = language.toLowerCase().split("");
  let upperCase = language.toUpperCase().split("");
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    let isUpper = char === char.toUpperCase();
    let index = isUpper ? upperCase.indexOf(char) : lowerCase.indexOf(char);
    if (index === -1) {
      result += char;
    } else {
      let newIndex = (index + shift) % length;
      if (newIndex < 0) {
        newIndex += length;
      }
      result += isUpper ? upperCase[newIndex] : lowerCase[newIndex];
    }
  }
  return result;
}

function decode(text, language, targetFrequency) {
  let result = "";
  let length = language.length;
  let lowerCase = language.toLowerCase().split("");
  let upperCase = language.toUpperCase().split("");
  

  let minError = Infinity;
  let bestShift = 0;
  for (let shift = 0; shift < length; shift++) {
    let error = 0;
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      let isUpper = char === char.toUpperCase();
      let index = isUpper ? upperCase.indexOf(char) : lowerCase.indexOf(char);
      if (index !== -1) {
        let newIndex = (index - shift + length) % length;
        let decryptedChar = isUpper ? upperCase[newIndex] : lowerCase[newIndex];
        let decryptedCharFrequency = targetFrequency[decryptedChar.toLowerCase()] || 0;
        error += (targetFrequency[char.toLowerCase()]-decryptedCharFrequency);
      }
    }
    if (error < minError) {
      minError = error;
      bestShift = shift;
    }
  }
  

  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    let isUpper = char === char.toUpperCase();
    let index = isUpper ? upperCase.indexOf(char) : lowerCase.indexOf(char);
    if (index === -1) {
      result += char;
    } else {
      let newIndex = (index - bestShift + length) % length;
      result += isUpper ? upperCase[newIndex] : lowerCase[newIndex];
    }
  }

  return result;
}

let ruAlphabet = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
let enAlphabet = "abcdefghijklmnopqrstuvwxyz";


if (process.argv[2] === "code") {
  let shift = parseInt(process.argv[5]);
  let language = process.argv[6] === "ru" ? ruAlphabet : enAlphabet;
  let inputFile = process.argv[3];
  let outputFile = process.argv[4];

  fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading input file:", err);
      process.exit(1);
    }
    let encodedText = encode(data, shift, language);

    fs.writeFile(outputFile, encodedText, 'utf8', (err) => {
      if (err) {
        console.error("Error writing to output file:", err);
        process.exit(1);
      }

      console.log("Encryption complete. Check the output file:", outputFile);
    });
  });
}

if (process.argv[2] === "decode") {
  let language = process.argv[5] === "ru" ? ruAlphabet : enAlphabet;
  let inputFile = process.argv[3];
  let outputFile = process.argv[4];
  let targetFrequency;
  if (process.argv[5] === "ru") {
    targetFrequency = require('./rus');
  } else if (process.argv[5] === "en") {
    targetFrequency = require('./en');
  } else {
    console.error("Unsupported language. Please provide 'ru' or 'en'.");
    process.exit(1);
  }
  fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading input file:", err);
      process.exit(1);
    }
    let decodedText = decode(data, language, targetFrequency);

    fs.writeFile(outputFile, decodedText, 'utf8', (err) => {
      if (err) {
        console.error("Error writing to output file:", err);
        process.exit(1);
      }

      console.log("Decryption complete. Check the output file:", outputFile);
    });
  });
}
