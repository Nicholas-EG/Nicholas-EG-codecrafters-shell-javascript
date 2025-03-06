const readline = require("readline");
const { exit } = require('process');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const builtin = ['echo', 'exit', 'type', 'pwd', 'cd'];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getFilePath(fileName) {
  if (fileName === undefined) return null;
  const dirs = process.env.PATH.split(path.delimiter);
  for (const dir of dirs) {
    const filePath = path.join(dir, fileName);
    if (fs.existsSync(filePath)) return filePath;
  }
  return null;
}

function buildPathToDirectory(relativePath) {
  const rPath = relativePath.split('/').filter((term) => term !== '');
  const currDirectory = String(process.env.PWD).split('/');
  while (rPath.length !== 0) {
    if (rPath[0] === "..") {
      currDirectory.pop();
      rPath.shift();
    } else if (rPath[0] === '.') {
      rPath.shift()
    } else {
      currDirectory.push(rPath.shift());
    }
  }
  return currDirectory.join('/');
}

// If two quoted blocks are next to one another with no whitespace in between, they should be concatenated together
function parser(inputText) {
  inputText = inputText.replaceAll(/[^\\\s]["']\S/g, '');
  let result = [];
  let isInDoubleQuotes = false;
  let isEscaped = false;
  let isInSingleQuotes = false;
  let term = "";
  for (const i of inputText) {
    if (i.match(/\\|\"|\$/g) !== null &&
      isEscaped &&
      isInDoubleQuotes
    ) {
      term += i;
    } else if (
      i === "\'" &&
      !isEscaped &&
      !isInDoubleQuotes
    ) {
      result.push(term);
      term = "";
      isInSingleQuotes = !isInSingleQuotes;
    } else if (
      i === '\"' &&
      !isEscaped &&
      !isInSingleQuotes
    ) {
      result.push(term);
      term = "";
      isInDoubleQuotes = !isInDoubleQuotes;
    } else if (
      i.match(/\s/g) !== null &&
      !isEscaped &&
      !(isInSingleQuotes || isInDoubleQuotes)
    ) {
      result.push(term);
      term = "";
    } else if (
      i.match(/\\/g) !== null &&
      !isInSingleQuotes
    ) {
      isEscaped = !isEscaped;
    }
    else {
      if (isEscaped) isEscaped = !isEscaped;
      term += i;
    }
  }
  result.push(term);
  return result.filter((term) => term !== '');
}

function prompt() {
  rl.question("$ ", (answer) => {
    const args = parser(answer);
    switch (args[0]) {
      case 'exit':
        if (args.length < 2 || args[1] !== '0') break;
        exit(0);
      case 'echo':
        console.log(...args.splice(1, args.length));
        break;
      case 'type':
        if (builtin.includes(args[1])) {
          console.log(`${args[1]} is a shell builtin`);
        }
        else {
          const fileName = getFilePath(args[1]);
          if (fileName === null) {
            console.log(`${args[1]}: not found`);
          }
          else {
            console.log(`${args[1]} is ${fileName}`);
          }
        }
        break;
      case 'pwd':
        console.log(process.env.PWD);
        break;
      case 'cd':
        if (args[1] == '~') process.env.PWD = process.env.HOME;
        else if (fs.existsSync(buildPathToDirectory(args[1]))) {
          process.env.PWD = buildPathToDirectory(args[1]);
        }
        else if (fs.existsSync(args[1])) {
          process.env.PWD = `${args[1]}`;
        }
        else console.log(`${args[0]}: ${args[1]}: No such file or directory`);
        break;
      case 'cat':
        let output = "";
        for (let i = 1; i < args.length; i++) {
          if (fs.existsSync(args[i])) output += fs.readFileSync(args[i], 'utf-8');
        }
        process.stdout.write(output);
        break;
      default:
        const filePath = getFilePath(args[0]);
        if (filePath === null) console.log(`${args[0]}: command not found`);
        else {
          try {
            spawnSync(`${args[0]}`, args.slice(1), { shell: true, stdio: 'inherit' });
          } catch (err) {
            console.error(`Error executing command: ${err.message}`);
            console.error(err.stack);
          }
        }
        break;
    }
    prompt();
  });
}

prompt();