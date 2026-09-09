# System Info

> View OS, kernel, CPU, GPU, memory and disk information at a glance

## 🎯 Features

- Operating system, kernel version, hostname, architecture and uptime
- Desktop environment and session type
- CPU model, physical cores and logical threads
- GPU(s) detected via PCI
- Memory and swap usage
- Disk usage for the root filesystem
- Copy everything as plain text in one action

## 🚀 Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/) (recommended version 24 or higher)
- Linux with `/proc`, `/etc/os-release`, `lspci` and `df` available (any common desktop distro)

### Installation

This extension is not yet published to the Vicinae Store. Install it by building from source below.

### Build From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/brpaz/vicinae-sysinfo.git
2. Navigate to the project directory:
   ```bash
   cd system-info
3. Install dependencies:
   ```bash
   npm i
4. Build the project:
   ```bash
   npm run build
   ```

This will install the extension in `~/.local/share/vicinae/extensions`, and will be available immediately on your Vicinae app.

## Development

In development, you can use the following command to watch for changes and rebuild your extension automatically:

```bash
npm run dev
```

## 🧰 Usage

Run the **System Info** command to see everything at a glance. Use the **Refresh** action to re-read current values (memory, disk, uptime), or **Copy All as Text** to paste a plain-text summary elsewhere.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.