# University Student Support AI Assistant

A secure, full-stack AI voice and text assistant built for university students. Powered by Node.js, Supabase, and Google Gemini, this application features real-time speech recognition, text-to-speech feedback, and automated database logging.

---

## 🚀 Features

* **Multi-Modal Interaction:** Students can choose to either type their questions or speak directly into their microphone.
* **Voice Integration:** 
  * Uses the browser's Web Speech Recognition API to convert spoken voice commands into text.
  * Uses the Speech Synthesis API to read the AI's responses out loud.
* **AI-Powered Responses:** Integrates with the Google Gemini API to generate intelligent, context-aware answers regarding university life, timetables, courses, and campus information.
* **Secure Authentication:** Features user sign-up and sign-in managed securely through Supabase Authentication.
* **Automated Logging:** Automatically saves every user query and AI response pair into a Supabase PostgreSQL database table (`chat_logs`).

---

## 🛠️ Tech Stack

### Frontend
* **HTML5 & Tailwind CSS (via CDN):** Clean, modern, and responsive user interface design.
* **Vanilla JavaScript:** DOM manipulation, event management, and browser Web API integration.
* **Web APIs:** Speech Recognition (`webkitSpeechRecognition`) and Speech Synthesis (`speechSynthesis`).

### Backend & Database
* **Node.js & Express:** Handles server-side routing and API requests to Google Gemini.
* **Supabase (PostgreSQL):** Cloud database platform for user authentication and chat history storage.
* **Row-Level Security (RLS):** Enabled on database tables to ensure proper data protection and access control.
