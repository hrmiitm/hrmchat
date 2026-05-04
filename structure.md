# Project Structure

- `package.json`: Project manifest and scripts.
- `main.js`: Main Electron process (manages windows, tabs, and `WebContentsView`).
- `preload.js`: Preload script for secure IPC communication.
- `src/`: UI related source files.
  - `index.html`: Main shell UI.
  - `style.css`: Styles for the shell UI.
  - `renderer.js`: Logic for the shell UI.
- `plan.md`: Development plan.
- `structure.md`: Directory and code structure.
- `agent.md`: Notes for AI agent tracking.
- `worklog.md`: Log of tasks and progress.
