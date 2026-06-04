# MemeSonic Demo

An interactive demo for **MemeSonic**, a system that turns a meme into mood-conditioned speech. Pick a meme, and the app uses Gemini to read the emotional mood of the image and the text separately, shows where they agree or conflict on a seven-emotion radar, then generates voice that matches the fused mood.

## What it does

1. Select a meme from the gallery, or upload your own.
2. Gemini analyzes the image mood and the text mood across seven emotions (happiness, love, anger, sorrow, fear, hate, surprise).
3. A radar chart overlays image, text, fused, and voice moods, and flags the cross-modal interaction (conflict, synergy, or redundancy).
4. Pick a target mood and generate mood-conditioned speech with Gemini TTS, or play the original narration.

## My role

I built this interactive demo: the React application, the cross-modal mood visualization, and the Gemini analysis and text-to-speech integration.

MemeSonic was a team project by Hongbee Park, Ruyi Yang, and Yiqiao Huang, built for a multimodal AI course at the MIT Media Lab. The broader project's generated audio dataset and evaluation results are the team's work and are not included in this demo repository. Team repository: https://github.com/emmaruyiyang/MMAI-MemeSonic

## Run it locally

You need a Google Gemini API key. The demo calls Gemini for both meme analysis and text-to-speech.

```bash
npm install
cp .env.example .env   # then paste your Gemini key into .env
npm run dev
```

Get a key from Google AI Studio: https://aistudio.google.com/apikey

## Tech

React 19 and Vite. Analysis and voice generation run client-side against the Gemini API.

## Notes

The sample memes are third-party images included for demonstration only.

## License

MIT. See [LICENSE](LICENSE).
