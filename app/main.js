const readline = require("readline");
const { exit } = require('process');
const fs = require('fs');
const path = require('path');

const builtin = ['echo', 'exit', 'type'];
const pathEnv = process.env.PATH;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt() {
  rl.question("$ ", (answer) => {
    const args = answer.split(" ");
    if (args[0] === 'exit') {
      exit(args[1]);
    } else if (args[0] === 'echo') {
      console.log(...args.splice(1, args.length));
    } else if (args[0] === 'type') {
      if (builtin.includes(args[1])) console.log(`${args[1]} is a shell builtin`);
      else {
        const dirs = pathEnv.split(path.delimiter);
        let found = false;
        for (const dir of dirs) {
          const filePath = path.join(dir, args[1]);
          try {
            fs.readFileSync(filePath);
            console.log(`${args[1]} is ${filePath}`);
            found = true;
            break;
          } catch(err) {}
        }
        if (!found) console.log(`${args[1]}: not found`);
      }
    } else {
      console.log(`${answer}: command not found`);
    }
    prompt();
  });
}

prompt()