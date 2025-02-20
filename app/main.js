const readline = require("readline");
const { exit } = require('process');

const builtin = ['echo', 'exit', 'type'];

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
      if (args.length > 2 || !builtin.includes(args[1])) console.log(`${args[1]}: not found`);
      else console.log(`${args[1]} is a shell builtin`);
    } else {
      console.log(`${answer}: command not found`);
    }
    prompt();
  });
}

prompt()