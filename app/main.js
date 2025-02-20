const readline = require("readline");
const { exit } = require('process');


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
    } else {
      console.log(`${answer}: command not found`);
    }
    prompt();
  });
}

prompt()