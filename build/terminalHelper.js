module.exports = {
  runInNewTerminal: runInNewTerminal,
  echoCommand: echoCommand
};

function echoCommand(command) {
  return 'echo "' + command.replace(/"/g, '\\"') + '" && ' + command;
}

function openNewTerminalTab() {
  return '-e \'tell application "Terminal" to activate\' -e \'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down\'';
}

function runInNewTerminal(command) {
  return 'osascript ' + openNewTerminalTab() + ' -e \'tell application "Terminal" to do script "' + command.replace(/"/g, '\\"') + '" in front window\' && echo Running in another terminal instance!';
}
