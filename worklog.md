# Worklog

## Log
- [2026-05-04] Initialized Git repository.
- [2026-05-04] Initialized `package.json` and started Electron installation.
- [2026-05-04] Created documentation files (`plan.md`, `structure.md`, `agent.md`, `worklog.md`).
- [2026-05-04] Fixed Google login issue by spoofing sec-ch-ua headers and disabling hardware acceleration.
- [2026-05-04] Switched User-Agent to Firefox and completely stripped Chromium sec-ch-ua headers to bypass Google login restrictions.
- [2026-05-04] Fixed Gemini Google Auth by forcing accounts.google.com navigation into a dedicated BrowserWindow popup.
- [2026-05-04] Made the sidebar resizable, implemented draggable bounds and IPC sync for views, and added smooth dropdown collapsers for AI sections.
- [2026-05-04] Configured electron-builder for packaging into deb, snap, and exe.
- [2026-05-04] Removed native OS window frame and implemented custom window controls (minimize, maximize, close) embedded within the top right of the application UI.
- [2026-05-04] Added a global logout button to clear all session storage and cookies, effectively logging out of all AI services.
- [2026-05-04] Added tab renaming functionality via double-click.
- [2026-05-04] Added electron-builder configuration to package the application into EXE, DEB, RPM, and SNAP.
- [2026-05-04] Implemented persistent tabs feature using localStorage so sessions survive app restarts.
- [2026-05-04] Updated .gitignore to exclude release outputs and logs.
- [2026-05-05] Added --no-sandbox switch directly into main.js to fix packaged Linux app crashing natively.
