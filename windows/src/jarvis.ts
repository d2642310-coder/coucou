import { Bridge } from "./core/bridge";
import { runJarvisFastCommand } from "./jarvis-actions";

export class JarvisAssistant {
  private recognition: any = null;
  private listening = false;
  private speaking = false;
  private voiceGender: "male" | "female" =
    localStorage.getItem("jarvis.voiceGender") === "female"
      ? "female"
      : "male";
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    this.refreshVoices();

    window.speechSynthesis.addEventListener("voiceschanged", () => {
      this.refreshVoices();
    });

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

    const lower = command.toLowerCase().trim();

    // Voice switching commands.
    if (
      /\b(?:switch|change|use|set)\b.*\b(?:male|man)\b.*\bvoice\b/.test(lower) ||
      /\bmale voice\b/.test(lower)
    ) {
      this.setVoiceGender("male");
      return;
    }

    if (
      /\b(?:switch|change|use|set)\b.*\b(?:female|woman)\b.*\bvoice\b/.test(lower) ||
      /\bfemale voice\b/.test(lower)
    ) {
      this.setVoiceGender("female");
      return;
    }

    // Fast local commands run without an AI request.
    const fast = await runJarvisFastCommand(command);
    if (fast.handled) {
      this.speak(fast.message || "Done.");
      return;
    }

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

    const voice = this.pickVoice();

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }

    // JARVIS-inspired voice tuning.
    if (this.voiceGender === "male") {
      utterance.rate = 0.90;
      utterance.pitch = 0.72;
    } else {
      utterance.rate = 0.96;
      utterance.pitch = 1.02;
    }

    utterance.volume = 1;

    utterance.onstart = () => {
      this.speaking = true;
    };

    utterance.onend = () => {
      this.speaking = false;
    };

    utterance.onerror = () => {
      this.speaking = false;
    };

    window.speechSynthesis.speak(utterance);
  }

  setVoiceGender(gender: "male" | "female") {
    this.voiceGender = gender;
    localStorage.setItem("jarvis.voiceGender", gender);

    this.speak(
      gender === "male"
        ? "Male voice selected."
        : "Female voice selected."
    );
  }

  getVoiceGender() {
    return this.voiceGender;
  }

  private refreshVoices() {
    this.voices = window.speechSynthesis.getVoices();
  }

  private pickVoice(): SpeechSynthesisVoice | null {
    const voices =
      this.voices.length > 0
        ? this.voices
        : window.speechSynthesis.getVoices();

    const english = voices.filter(v =>
      /^en[-_]/i.test(v.lang)
    );

    const pool = english.length > 0 ? english : voices;

    if (!pool.length) return null;

    const maleNames = [
      "david",
      "mark",
      "guy",
      "daniel",
      "george",
      "alex",
      "ryan",
      "james",
      "fred",
    ];

    const femaleNames = [
      "zira",
      "jenny",
      "aria",
      "samantha",
      "hazel",
      "susan",
      "karen",
      "emma",
      "ava",
    ];

    const preferred =
      this.voiceGender === "male" ? maleNames : femaleNames;

    return (
      pool.find(voice =>
        preferred.some(name =>
          voice.name.toLowerCase().includes(name)
        )
      ) || pool[0]
    );
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
