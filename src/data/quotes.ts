const quotes = [
  "Show up, then build strength one rep at a time.",
  "Small sessions make strong habits.",
  "Control the movement; earn the progress.",
  "Every hold is practice in patience.",
  "Your next rep is a fresh start.",
  "Consistency turns effort into strength.",
  "Move well today. Move better tomorrow.",
  "Strength grows where practice stays steady.",
  "One focused set beats a perfect excuse.",
  "Make each rep deliberate.",
  "Progress is built between the first and last rep.",
  "Train with patience; improve with purpose.",
  "A strong foundation is made one session at a time.",
  "Keep your form; keep your momentum.",
  "Practice today for the skills you want tomorrow.",
  "Rest, recover, and return ready.",
  "Effort adds up when you keep coming back.",
  "Own the basics; unlock the next step.",
  "Steady practice makes difficult moves familiar.",
  "Start where you are and train with intent.",
];

export function getDailyQuote(date = new Date()): string {
  const day = Math.floor(date.getTime() / 86_400_000);
  return quotes[((day % quotes.length) + quotes.length) % quotes.length];
}
