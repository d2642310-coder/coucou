import { Bridge } from "./core/bridge";

export type JarvisActionResult = {
  handled: boolean;
  message?: string;
};

function openUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function runJarvisFastCommand(
  command: string,
): Promise<JarvisActionResult> {
  const text = command.toLowerCase().trim();

  // Websites
  if (/\b(open|launch|go to)\b.*\byoutube\b/.test(text)) {
    openUrl("https://www.youtube.com");
    return { handled: true, message: "Opening YouTube." };
  }

  if (/\b(open|launch|go to)\b.*\bgoogle\b/.test(text)) {
    openUrl("https://www.google.com");
    return { handled: true, message: "Opening Google." };
  }

  if (/\b(open|launch|go to)\b.*\bgithub\b/.test(text)) {
    openUrl("https://github.com");
    return { handled: true, message: "Opening GitHub." };
  }

  if (/\b(open|launch|go to)\b.*\binstagram\b/.test(text)) {
    openUrl("https://www.instagram.com");
    return { handled: true, message: "Opening Instagram." };
  }

  // YouTube search
  const youtubeSearch = text.match(
    /(?:search|find|look up).*?(?:on youtube|youtube for)\s+(.+)$/i,
  );

  if (youtubeSearch?.[1]) {
    const query = youtubeSearch[1].trim();

    openUrl(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    );

    return {
      handled: true,
      message: `Searching YouTube for ${query}.`,
    };
  }

  // Native Windows applications.
  const appPatterns: Array<[RegExp, string, string]> = [
    [
      /\b(open|launch|start)\b.*\b(google chrome|chrome)\b/i,
      "chrome",
      "Chrome",
    ],
    [
      /\b(open|launch|start)\b.*\b(microsoft edge|edge)\b/i,
      "edge",
      "Microsoft Edge",
    ],
    [
      /\b(open|launch|start)\b.*\b(visual studio code|vs code|vscode)\b/i,
      "vs code",
      "VS Code",
    ],
    [
      /\b(open|launch|start)\b.*\bspotify\b/i,
      "spotify",
      "Spotify",
    ],
    [
      /\b(open|launch|start)\b.*\bwhatsapp\b/i,
      "whatsapp",
      "WhatsApp",
    ],
    [
      /\b(open|launch|start)\b.*\bnotepad\b/i,
      "notepad",
      "Notepad",
    ],
    [
      /\b(open|launch|start)\b.*\b(calculator|calc)\b/i,
      "calculator",
      "Calculator",
    ],
    [
      /\b(open|launch|start)\b.*\b(file explorer|explorer)\b/i,
      "file explorer",
      "File Explorer",
    ],
    [
      /\b(open|launch|start)\b.*\b(windows terminal|terminal)\b/i,
      "terminal",
      "Terminal",
    ],
    [
      /\b(open|launch|start)\b.*\bpowershell\b/i,
      "powershell",
      "PowerShell",
    ],
    [
      /\b(open|launch|start)\b.*\bsettings\b/i,
      "settings",
      "Settings",
    ],
  ];

  for (const [pattern, app, label] of appPatterns) {
    if (pattern.test(text)) {
      const opened = await Bridge.openApp(app);

      return {
        handled: true,
        message: opened
          ? `Opening ${label}.`
          : `I couldn't open ${label}.`,
      };
    }
  }

  return { handled: false };
}
