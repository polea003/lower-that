# 📺 Lower That

Automatically mute commercials during sporting events using your webcam and a multi-modal LLM (e.g., `gpt-5-nano`).
**\~\$0.10/hour cost with `gpt-5-nano`.**

## 🚀 Features

* Captures webcam image every 5 seconds
* Analyzes frames using **OpenAI's `gpt-5-nano`**
* Controls **Samsung TVs** (IP + MAC required)
* Optimized for **sporting event broadcasts**
* **MIT licensed** and fully open source

## ⚙️ Setup

This repo now uses a server/web layout. The existing Node.js app lives under `server/` and a separate web client can be added later (e.g., `web/`).

### Directory Structure

- `server/`: Node.js server (current app)
- `README.md`: Top-level docs (this file)
- `LICENSE`, `.gitignore`: Repo metadata

### 1. Configure Environment Variables (in `server/`)

Copy the example file and fill in the required values:

```bash
cd server
cp env.example .env
```

Edit `.env` and provide your credentials:

```env
OPENAI_API_KEY=your_openai_api_key
SAMSUNG_TV_IP_ADDRESS=your_tv_ip
SAMSUNG_TV_MAC_ADDRESS=your_tv_mac
```

📘 Refer to the [`samsung-tv-remote` docs](https://www.npmjs.com/package/samsung-tv-remote) to find your Samsung TV's IP and MAC address.

> **First-time setup:** Your TV may prompt you to allow access — confirm to enable control.

### 2. Install Dependencies (in `server/`)

Ensure your system meets [node-webcam](https://www.npmjs.com/package/node-webcam) requirements, then install:

```bash
cd server
npm install
```

## ▶️ Usage

Point your webcam at the TV and run:

```bash
cd server
npm start
```

> 🔇 The program will automatically mute commercials during games.
> 💸 **Reminder:** Using `gpt-5-nano` costs \~\$0.10/hour.
> 🛑 Stop the program with `Ctrl+C`.

Notes:
- The capture artifact (`most_recent_capture.jpg`) is written in the `server/` folder during runs.

## 🤝 Contributing

PRs welcome! Bug fixes, improvements, and feature ideas are encouraged.
