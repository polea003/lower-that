# 📺 Lower That

Automatically mute commercials during sporting events using your webcam and a multi-modal LLM (e.g., `gpt-4.1-nano`).
**\~\$0.10/hour cost with `gpt-4.1-nano`.**

## 🚀 Features

* Captures webcam image every 5 seconds
* Analyzes frames using **OpenAI’s `gpt-4.1-nano`**
* Controls **Samsung TVs** (IP + MAC required)
* Optimized for **sporting event broadcasts**
* **MIT licensed** and fully open source

## ⚙️ Setup

### 1. Configure Environment Variables

Copy the example file and fill in the required values:

```bash
cp .env.example .env
```

Edit `.env` and provide your credentials:

```env
OPENAI_API_KEY=your_openai_api_key
SAMSUNG_TV_IP_ADDRESS=your_tv_ip
SAMSUNG_TV_MAC_ADDRESS=your_tv_mac
```

📘 Refer to the [`samsung-tv-remote` docs](https://www.npmjs.com/package/samsung-tv-remote) to find your Samsung TV's IP and MAC address.

> **First-time setup:** Your TV may prompt you to allow access — confirm to enable control.

### 2. Install Dependencies

Ensure your system meets [node-webcam](https://www.npmjs.com/package/node-webcam) requirements, then install:

```bash
npm install
```

## ▶️ Usage

Point your webcam at the TV and run:

```bash
npm start
```

> 🔇 The program will automatically mute commercials during games.
> 💸 **Reminder:** Using `gpt-4.1-nano` costs \~\$0.10/hour.
> 🛑 Stop the program with `Ctrl+C`.

## 🤝 Contributing

PRs welcome! Bug fixes, improvements, and feature ideas are encouraged.
