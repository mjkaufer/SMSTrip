# SMSTrip

Directions via SMS

## Usage

Text `give me directions` to the phone number registered. You will be prompted the rest of the way!

## Installation

To install, simply run `npm install` in the same directory as `package.json`. Copy `config.example.json` to `config.json` and fill in your credentials. Then, create a tunnel with `ngrok`, and add that tunnel to your Twilio SMS webhook, as a POST request. Then, run `node index.js` to start the server! That's all!