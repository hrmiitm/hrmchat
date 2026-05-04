# Project Plan: hrmchat

## Overview
A desktop application built using Electron that acts as a unified hub for AI chat platforms (Gemini, ChatGPT, Claude).

## Features
1. Unified UI to switch between AI applications seamlessly.
2. Tab management: Open multiple instances of any AI application in separate tabs.
3. State preservation: Tab states and sessions are managed.
4. Clean and modern user interface for switching contexts.

## Tech Stack
- Electron (Node.js + Chromium)
- WebContentsView (or BrowserView) for isolated and secure rendering of web pages.
- HTML/CSS/JS (Vanilla) for the main shell UI.

## Implementation Steps
- [ ] Phase 1: Setup project structure and dependencies.
- [ ] Phase 2: Create main process layout (`main.js`) handling `WebContentsView`.
- [ ] Phase 3: Create the renderer UI (`index.html`, `renderer.js`, `style.css`).
- [ ] Phase 4: Implement IPC communication to manage tabs (create, switch, delete).
- [ ] Phase 5: Testing, debugging and UI polish.
