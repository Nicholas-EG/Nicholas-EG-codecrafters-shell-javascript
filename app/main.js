const readline = require("readline");
const { exit } = require('process');
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

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
      exit(0);
    } else if (args[0] === 'echo') {
      console.log(...args.splice(1, args.length));
    } else if (args[0] === 'type') {
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
    } else {
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
    }
    prompt();
  });
}

function getFilePath(fileName) {
  const dirs = pathEnv.split(path.delimiter);
  for (const dir of dirs) {
    const filePath = path.join(dir, fileName);
    if (fs.existsSync(filePath)) return filePath;
  }
  return null;
}

prompt()