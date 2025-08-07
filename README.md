# Lower That

Use your webcam and multi-modal LLMs to analyze your tv images and automatically mute commercials during sporting events. Costs about $0.01/min when using gpt-4o-mini.

## Features

* Takes a webcam capture every 5 seconds.
* Uses OpenAI's gpt-4o-mini to analyze images.
* Supports controlling Samsung TV.
* Optimized for Sporting Event Broadcasts.
* Free and open source under MIT.

## Setup

### Access Credentials

Use environment variables to configure credentials for LLM providers.

```bash
cp .env.example .env
```

```bash
OPENAI_API_KEY=
```

See [samsung-tv-remote docs](https://www.npmjs.com/package/samsung-tv-remote) for how to find SAMSUNG_TV_IP_ADDRESS and SAMSUNG_TV_MAC_ADDRESS values.

```bash
SAMSUNG_TV_IP_ADDRESS=
SAMSUNG_TV_MAC_ADDRESS=
```

**Note: The first time running the program, your TV may prompt you to allow access for the program to control the tv.**

### Installation

See system dependencies for [node-webcam](https://www.npmjs.com/package/node-webcam) and install, if necessary.

Install dependencies:

```bash
npm install
```

### Usage

Point webcam towards Samsung TV. Start the program:

```bash
npm start
```

**Stop the program with ctrl-c. Running the program costs about $0.10/hr using gpt-4.1-nano. Don't forget to stop!**


## Contributing

Contributions Welcome!