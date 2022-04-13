const config = require('config');
const { client: Client } = require('tmi.js');
const debug = require('debug');

// Define configuration options
const opts = {
  identity: {
    username: config.get('username'),
    password: config.get('password')
  },
  channels: config.get('channels')
};

// Create a client with our options
const client = new Client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
console.log(`${new Date().toISOString()} - Start`);
client.connect();

let farmed = 0;
// Called every time a message comes in
function onMessageHandler(target, context, msg, isBot) {
  if (isBot) {
    return;
  } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();
  const [cmd, , points] = commandName.split(' ');
  debug(target, context, msg, isBot);
  if (cmd === '!addpoints') {
    console.log(`${new Date().toISOString()} - Channel: ${target}, Points: ${points}`);
    farmed += Number(points);
    console.log(`${new Date().toISOString()} - Total Farmed: ${farmed}`);
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`${new Date().toISOString()} - * Connected to ${addr}:${port}`);
}
