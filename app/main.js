const readline = require("readline");
const { exit } = require('process');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const builtin = ['echo', 'exit', 'type'];
const pathEnv = process.env.PATH;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt() {
  rl.question("$ ", (answer) => {
    const args = answer.split(" ");
    if (answer === 'exit 0') {
      exit(args[1]);
    } else if (args[0] === 'echo') {
      console.log(...args.splice(1, args.length));
    } else if (args[0] === 'type') {
      if (builtin.includes(args[1])) console.log(`${args[1]} is a shell builtin`);
      else {
        const fileName = isFile(args[1]);
        if(fileName === null) console.log(`${args[1]}: not found`);
        else console.log(`${args[1]} is ${fileName}`);
      }
    } else {
      const filePath = isFile(args[0]);
      if (filePath === null) console.log(`${answer}: command not found`);
      else {
        execSync(filePath, [...args.splice(1, args.length - 1)]);
      }
    }
    prompt();
  });
}

function isFile(fileName) {
  const dirs = pathEnv.split(path.delimiter);
  for (const dir of dirs) {
    const filePath = path.join(dir, fileName);
    try {
      fs.readFileSync(filePath);
      return filePath;
    } catch (err) { }
  }
  return null;
}

prompt()