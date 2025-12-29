# Architecture Design

## 1. Overview
This document outlines the architectural design for the "Gemini YouTube Summary Extension". The extension is built on the Chrome Extension Manifest V3 platform.

## 2. System Components

### 2.1. Popup (UI Layer)
- **File**: `popup.html`, `popup.js`, `popup.css`
- **Responsibility**:
    - User interface for selecting prompts.
    - Triggering the summary generation process.
    - Managing settings (link to options page).
- **Interactions**:
    - Communicates with `Background Service Worker` to initiate actions.
    - Reads/Writes to `Chrome Storage` for retrieving prompt templates.

### 2.2. Background Service Worker (Orchestration Layer)
- **File**: `background.js`
- **Responsibility**:
    - Handling browser events (e.g., extension icon click if not using default popup, but we are using default popup).
    - Managing tab creation (opening Gemini).
    - Orchestrating data flow between Content Scripts and AI tabs.
- **Interactions**:
    - Receives messages from `Popup`.
    - Sends messages to `Content Scripts`.

### 2.3. Content Scripts (Interaction Layer)
- **File**: `content_extractor.js` (runs on target pages e.g., YouTube)
    - **Responsibility**: Extracts URL, title, and page content (captions/transcript if possible).
- **File**: `ai_injector.js` (runs on AI pages e.g., gemini.google.com)
    - **Responsibility**: Injects the constructed prompt into the AI's input field and simulates submission.
    - **Responsibility**: Monitors AI response for timestamps and converts them to links.

### 2.4. Storage (Data Layer)
- **Technology**: `chrome.storage.sync`
- **Schema**:
    ```json
    {
      "prompts": [
        {
          "id": "string (uuid)",
          "title": "string",
          "content": "string (template)",
          "targetAi": "string (gemini|chatgpt|etc)"
        }
      ]
    }
    ```

## 3. Data Flow

1.  **User Action**: User clicks extension icon -> Popup opens.
2.  **Selection**: User selects a prompt and clicks "Run".
3.  **Extraction**: Popup (or Background) requests `content_extractor.js` to get current page details (URL, Title).
4.  **Prompt Construction**: Popup constructs the final prompt by replacing variables (`{{url}}`, `{{title}}`) in the template.
5.  **Execution**:
    - Background opens new tab for `targetAi` (e.g., Gemini).
    - Background waits for tab to load.
    - Background sends the prompt to `ai_injector.js` in the new tab.
6.  **Injection**: `ai_injector.js` inserts text into the DOM and clicks the send button.

## 4. Security & Privacy
- **Permissions**:
    - `activeTab`: To read current page.
    - `storage`: To save user settings.
    - `scripting`: To inject code into AI pages.
    - `host_permissions`: `https://gemini.google.com/*`, etc.
- **Data Handling**: No data is sent to external servers other than the target AI service chosen by the user.

## 5. Technology Stack
- **Core**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Vanilla JS (to keep it lightweight and minimize dependencies).
- **Build Tool**: None (direct usage) or minimal npm scripts if needed for packaging.
