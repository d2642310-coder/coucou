import { Bridge } from "./core/bridge";

export class JarvisAssistant {
  private recognition: any = null;
  private listening = false;
  private speaking = false;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();

      this.recognition.lang = "en-US";
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.listening = true;
        console.log("JARVIS: Listening...");
      };

      this.recognition.onresult = async (event: any) => {
        const text = event.results[0][0].transcript.trim();

        console.log("JARVIS heard:", text);

        if (text) {
          await this.ask(text);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn("JARVIS voice error:", event.error);
        this.listening = false;
      };

      this.recognition.onend = () => {
        this.listening = false;
      };
    }
  }

  startListening() {
    if (!this.recognition) {
      this.speak("Voice recognition is not available in this browser.");
      return;
    }

    if (this.listening) return;

    try {
      window.speechSynthesis.cancel();
      this.recognition.start();
    } catch {
      // Browser can throw if recognition is already starting.
    }
  }

  stopListening() {
    if (!this.recognition) return;

    try {
      this.recognition.stop();
    } catch {
      // Ignore stop errors.
    }

    this.listening = false;
  }

  async ask(command: string) {
    console.log("JARVIS command:", command);

    try {
      const result = await Bridge.chatSend(command, null);

      const reply = result?.text?.trim();

      if (!reply) {
        this.speak("I don't have a response for that.");
        return;
      }

      console.log("JARVIS:", reply);

      this.speak(this.cleanForSpeech(reply));
    } catch (error) {
      console.error("JARVIS AI error:", error);
      this.speak("I'm sorry. I couldn't reach the AI service.");
    }
  }

  speak(text: string) {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 0.78;
    utterance.volume = 1;

    utterance.onstart = () => {
      this.speaking = true;
    };

    utterance.onend = () => {
      this.speaking = false;
    };

    window.speechSynthesis.speak(utterance);
  }

  isListening() {
    return this.listening;
  }

  isSpeaking() {
    return this.speaking;
  }

  private cleanForSpeech(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, " code omitted ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[#*_~]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n+/g, ". ")
      .trim();
  }
}

export const jarvis = new JarvisAssistant();
