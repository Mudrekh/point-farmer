
import config from 'config';
import { client as Client } from 'tmi.js';
import _debug from 'debug';
import got from 'got';

const debug = _debug('farmer');
// Define configuration options
const opts = {
  identity: {
    username: config.get('username'),
    password: config.get('password')
  },
  channels: config.get('channels')
};

function log(type, ...args) {
  if (!console[type]) {
    args.unshift(type);
    type = 'log';
  }
  console[type](new Date().toISOString(), ' - ', ...args);
}


// Create a client with our options
const client = new Client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
log('Start');
client.connect();

// https://dev.twitch.tv/docs/authentication/validate-tokens
validate(config.get('password'));
setInterval(() => validate(config.get('password')), 1000 * 60 * 60);


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
    log(`${new Date().toISOString()} - Channel: ${target}, Points: ${points}`);
    if (Number(points)) farmed += Number(points);
    log(`${new Date().toISOString()} - Total Farmed: ${farmed}`);
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  log(`${new Date().toISOString()} - * Connected to ${addr}:${port}`);
}

async function validate(token) {
  try {
    const [, str] = token.split(':');
    const resp = await got('https://id.twitch.tv/oauth2/validate', {
      headers: {
        authorization: `OAuth ${str}`
      }
    });
    debug(resp.body.trim());
  } catch (err) {
    log('error', `Error validating token: ${err}`);
  }
}
