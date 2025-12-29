// defaultPromptsはprompts/index.jsから window.defaultPrompts として読み込まれます

document.addEventListener('DOMContentLoaded', async () => {
    // グローバルスコープからdefaultPromptsを取得
    const defaultPrompts = window.defaultPrompts;

    // デバッグログ
    console.log('[Geminizer Options] defaultPrompts loaded:', defaultPrompts ? defaultPrompts.length : 'undefined');

    if (!defaultPrompts || defaultPrompts.length === 0) {
        console.error('[Geminizer Options] ERROR: defaultPrompts not loaded!');
        alert('プロンプトの読み込みに失敗しました。拡張機能を再読み込みしてください。');
        return;
    }

    const promptList = document.getElementById('prompt-list');
    const addBtn = document.getElementById('add-btn');
    const modal = document.getElementById('modal');
    const modalTitle = document.querySelector('#modal h2');
    const editTitle = document.getElementById('title');
    const editTarget = document.getElementById('target-ai');
    const editUseContent = document.getElementById('use-page-content');
    const editAutoExecute = document.getElementById('auto-execute');
    const editContent = document.getElementById('content');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const editDefaultMode = document.getElementById('edit-default-mode');
    const editToolDeepResearch = document.getElementById('edit-tool-deep-research');
    const editToolCanvas = document.getElementById('edit-tool-canvas');
    const editToolNanoBanana = document.getElementById('edit-tool-nanobanana');
    const editModelModes = document.getElementsByName('edit-model-mode');
    const shortcutInput = document.getElementById('shortcut-key');
    const clearShortcutBtn = document.getElementById('clear-shortcut-btn');
    const shortcutConflictWarning = document.getElementById('shortcut-conflict-warning');

    let prompts = [];
    let editingIndex = -1;
    let shortcuts = {}; // Map of prompt index to shortcut key
    let isRecordingShortcut = false;

    // Default Prompts

    const resolveDefaultMode = (prompt) => {
        if (prompt && prompt.defaultMode) return prompt.defaultMode;
        if (prompt && prompt.usePageContent) return 'text';
        return 'url';
    };

    // Helper function to check and handle storage errors
    const checkStorageError = (error) => {
        if (chrome.runtime.lastError) {
            const lastError = chrome.runtime.lastError.message;
            if (lastError.includes('quota') || lastError.includes('Quota') || lastError.includes('QUOTA_BYTES_PER_ITEM')) {
                return true;
            }
        }
        if (error && error.message) {
            const errorMsg = error.message;
            if (errorMsg.includes('quota') || errorMsg.includes('Quota') || errorMsg.includes('QUOTA_BYTES_PER_ITEM')) {
                return true;
            }
        }
        return false;
    };

    // Helper function to safely set storage with quota handling
    const safeSetStorage = async (data) => {
        try {
            await chrome.storage.local.set(data);
        } catch (error) {
            console.error('Error setting storage:', error);
            // Always clear and retry on any error
            try {
                await chrome.storage.local.clear();
                await chrome.storage.local.set(data);
            } catch (retryError) {
                console.error('Error after clearing storage:', retryError);
                throw retryError;
            }
        }
    };

    // Load Prompts
    const loadPrompts = async () => {
        try {
            const data = await chrome.storage.local.get(['prompts', 'version']);
            const currentVersion = '0.9.32';
            const savedVersion = data.version || '0.9.0';

            if (!data.prompts || data.prompts.length === 0) {
                // Initialize defaults only if no prompts exist
                prompts = defaultPrompts;
                await chrome.storage.local.set({ prompts, version: currentVersion });
            } else {
                prompts = data.prompts;

                // Check if version has changed - merge new default prompts and remove old ones
                if (savedVersion !== currentVersion) {
                    const defaultPromptsMap = new Map(defaultPrompts.map(dp => [dp.title, dp]));

                    // Force update existing default prompts with new content
                    prompts = prompts.map(p => {
                        if (defaultPromptsMap.has(p.title)) {
                            // Merge keeping customizations might be hard, so we force-update content of default ones
                            // but preserve unique ones user added.
                            return { ...p, ...defaultPromptsMap.get(p.title) };
                        }
                        return p;
                    });

                    // Add truly new default prompts that don't exist yet
                    const existingTitles = new Set(prompts.map(p => p.title));
                    const newPrompts = defaultPrompts.filter(dp => !existingTitles.has(dp.title));
                    if (newPrompts.length > 0) {
                        prompts = [...prompts, ...newPrompts];
                        console.log(`Added ${newPrompts.length} new prompts:`, newPrompts.map(p => p.title));
                    }

                    // Remove prompts that are no longer in defaultPrompts (only if they were default ones)
                    // (Optional: safer to keep them if they were modified, but let's stick to syncing)
                    const defaultTitles = new Set(defaultPrompts.map(dp => dp.title));
                    const oldPromptsCount = prompts.length;
                    // We only remove if it WAS a default prompt (has a title in old defaults but not in new)
                    // Actually simple titles sync is what we've been doing.
                    prompts = prompts.filter(p => defaultTitles.has(p.title) || !data.prompts.find(op => op.title === p.title));

                    await chrome.storage.local.set({ prompts, version: currentVersion });
                }
                let updated = false;
                prompts = prompts.map((prompt) => {
                    let promptUpdated = false;
                    let updatedPrompt = { ...prompt };

                    // Add defaultMode if missing
                    if (!updatedPrompt.defaultMode) {
                        updatedPrompt.defaultMode = resolveDefaultMode(updatedPrompt);
                        promptUpdated = true;
                    }

                    // Add tools property if missing (for specific prompts)
                    if (!updatedPrompt.tools) {
                        if (updatedPrompt.title === 'インフォグラフィック構成案') {
                            updatedPrompt.tools = {
                                deepResearch: false,
                                canvas: true,
                                nanobanana: false
                            };
                            promptUpdated = true;
                        } else if (updatedPrompt.title === 'NanoBanana Pro 図解作成') {
                            updatedPrompt.tools = {
                                deepResearch: false,
                                canvas: false,
                                nanobanana: true
                            };
                            promptUpdated = true;
                        } else {
                            updatedPrompt.tools = {
                                deepResearch: false,
                                canvas: false,
                                nanobanana: false
                            };
                            promptUpdated = true;
                        }
                    }

                    // Add modelMode property if missing
                    if (updatedPrompt.modelMode === undefined) {
                        updatedPrompt.modelMode = updatedPrompt.thoughtMode ? 'thinking' : 'fast';
                        promptUpdated = true;
                    }

                    if (promptUpdated) {
                        updated = true;
                    }
                    return updatedPrompt;
                });
                if (updated) {
                    await chrome.storage.local.set({ prompts });
                }
            }
            renderPrompts();
        } catch (error) {
            console.error('Failed to load prompts:', error);
            // Use default prompts only if storage is completely inaccessible
            prompts = defaultPrompts;
            renderPrompts();
        }
    };

    // Render Prompts
    const renderPrompts = () => {
        promptList.innerHTML = '';
        const modeLabelMap = {
            url: 'URL',
            text: 'Text',
            capture: 'Capture'
        };

        prompts.forEach((prompt, index) => {
            const item = document.createElement('div');
            item.className = 'prompt-item';
            const modeLabel = modeLabelMap[prompt.defaultMode] || 'URL';
            item.innerHTML = `
        <div class="prompt-info">
          <h3>${prompt.title}</h3>
          <div class="prompt-meta">Target: ${prompt.targetAi} | Page Content: ${prompt.usePageContent ? 'ON' : 'OFF'} | Default Mode: ${modeLabel}</div>
        </div>
        <div class="prompt-actions">
          <button class="btn btn-secondary edit-btn" data-index="${index}">編集</button>
          <button class="btn btn-danger delete-btn" data-index="${index}">削除</button>
        </div>
      `;
            promptList.appendChild(item);
        });

        // Add Event Listeners
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openModal(parseInt(e.target.dataset.index)));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deletePrompt(parseInt(e.target.dataset.index)));
        });
    };

    // Open Modal
    const openModal = (index = -1) => {
        // 保存メッセージを非表示にする
        const saveMessage = document.getElementById('save-message');
        if (saveMessage) {
            saveMessage.style.display = 'none';
        }

        editingIndex = index;
        if (index >= 0) {
            const prompt = prompts[index];
            modalTitle.textContent = 'プロンプト編集';
            editTitle.value = prompt.title;
            editTarget.value = prompt.targetAi || 'gemini';
            editUseContent.checked = prompt.usePageContent || false;
            editAutoExecute.checked = prompt.autoExecute !== false; // Default to true
            editContent.value = prompt.content;
            editDefaultMode.value = resolveDefaultMode(prompt);

            // Load tool selections
            if (prompt.tools) {
                editToolDeepResearch.checked = prompt.tools.deepResearch || false;
                editToolCanvas.checked = prompt.tools.canvas || false;
                editToolNanoBanana.checked = prompt.tools.nanobanana || false;
            } else {
                editToolDeepResearch.checked = false;
                editToolCanvas.checked = false;
                editToolNanoBanana.checked = false;
            }

            const modeToSet = prompt.modelMode || (prompt.thoughtMode ? 'thinking' : 'fast');
            editModelModes.forEach(r => r.checked = (r.value === modeToSet));

            // Load shortcut for this prompt
            const shortcutKey = shortcuts[index] || '';
            shortcutInput.value = shortcutKey;
            clearShortcutBtn.style.display = shortcutKey ? 'block' : 'none';
            shortcutConflictWarning.style.display = 'none';
        } else {
            modalTitle.textContent = '新規プロンプト追加';
            editTitle.value = '';
            editTarget.value = 'gemini';
            editUseContent.checked = false;
            editAutoExecute.checked = true; // Default to true
            editContent.value = 'URL: {{url}}\nContent: {{content}}';
            editDefaultMode.value = 'url';

            // Reset tool selections
            editToolDeepResearch.checked = false;
            editToolCanvas.checked = false;
            editToolNanoBanana.checked = false;
            editModelModes.forEach(r => r.checked = (r.value === 'fast'));

            shortcutInput.value = '';
            clearShortcutBtn.style.display = 'none';
            shortcutConflictWarning.style.display = 'none';
        }
        modal.style.display = 'flex'; // Use flex to center
    };

    // Close Modal
    const closeModal = () => {
        // 保存メッセージを非表示にする
        const saveMessage = document.getElementById('save-message');
        if (saveMessage) {
            saveMessage.style.display = 'none';
        }
        modal.style.display = 'none';
    };

    // Update shortcut command in Chrome
    // Note: chrome.commands.update is not available in Chrome Extensions API
    // Shortcuts are defined statically in manifest.json and cannot be changed dynamically
    // This function is kept for future API support but currently only logs warnings
    const updateShortcutCommand = async (promptIndex, shortcutKey) => {
        if (promptIndex < 0 || promptIndex >= 20) {
            console.error('Invalid prompt index for shortcut:', promptIndex);
            return;
        }

        // Chrome Extensions API does not support dynamic command updates
        // Shortcuts are stored in chrome.storage but cannot be updated programmatically
        // Users must manually configure shortcuts in chrome://extensions/shortcuts
        // We'll just log the intended action without throwing an error
        const commandName = `run_prompt_${promptIndex}`;

        if (shortcutKey && shortcutKey !== '') {
            console.log(`[Info] Shortcut for ${commandName} should be set to: ${shortcutKey}`);
            console.log('[Info] Please configure shortcuts manually in chrome://extensions/shortcuts');
        } else {
            console.log(`[Info] Shortcut for ${commandName} should be cleared`);
            console.log('[Info] Please configure shortcuts manually in chrome://extensions/shortcuts');
        }

        // Return successfully without throwing errors
        return;
    };

    // Save Prompt
    const savePrompt = async () => {
        const newPrompt = {
            title: editTitle.value,
            targetAi: editTarget.value,
            usePageContent: editUseContent.checked,
            autoExecute: editAutoExecute.checked,
            defaultMode: editDefaultMode.value,
            content: editContent.value,
            // ツール選択オプション
            tools: {
                deepResearch: editToolDeepResearch.checked,
                canvas: editToolCanvas.checked,
                nanobanana: editToolNanoBanana.checked
            },
            modelMode: Array.from(editModelModes).find(r => r.checked)?.value || 'fast'
        };

        if (!newPrompt.title || !newPrompt.content) {
            alert('タイトルとプロンプト内容は必須です。');
            return;
        }

        const shortcutKey = shortcutInput.value.trim();
        const conflict = await checkShortcutConflict(shortcutKey);

        if (conflict.hasConflict) {
            const proceed = confirm(`${conflict.message}\n\nそれでもこのショートカットキーを使用しますか？`);
            if (!proceed) {
                return;
            }
        }

        let actualIndex = editingIndex;
        if (editingIndex >= 0) {
            prompts[editingIndex] = newPrompt;
            actualIndex = editingIndex;
        } else {
            prompts.push(newPrompt);
            actualIndex = prompts.length - 1;
        }

        // Save shortcut (note: chrome.commands.update is not available, shortcuts are stored but cannot be updated programmatically)
        if (shortcutKey) {
            shortcuts[actualIndex] = shortcutKey;
        } else {
            delete shortcuts[actualIndex];
        }

        // Try to update shortcut command (will only log, not throw errors)
        try {
            await updateShortcutCommand(actualIndex, shortcutKey || '');
        } catch (error) {
            // Ignore errors from updateShortcutCommand - it's not critical
            console.warn('Shortcut command update failed (this is expected):', error);
        }

        try {
            await safeSetStorage({ prompts, shortcuts });
            renderPrompts();

            // 保存メッセージを表示
            const saveMessage = document.getElementById('save-message');
            if (saveMessage) {
                saveMessage.style.display = 'flex';
                setTimeout(() => {
                    saveMessage.style.display = 'none';
                    closeModal();
                }, 1500); // 1.5秒後にモーダルを閉じる
            } else {
                closeModal();
            }
        } catch (error) {
            console.error('Failed to save:', error);

            // Check if it's a quota error
            if (checkStorageError(error)) {
                try {
                    // Clear storage and reinitialize
                    await chrome.storage.local.clear();
                    await safeSetStorage({ prompts, shortcuts });
                    renderPrompts();
                    closeModal();
                    alert('ストレージのクォータ制限に達していたため、ストレージをクリアして保存しました。');
                } catch (reinitError) {
                    console.error('Failed to reinitialize:', reinitError);
                    alert('保存に失敗しました。データが大きすぎる可能性があります。一部のプロンプトを削除して再試行してください。');
                }
            } else {
                alert('保存に失敗しました。拡張機能を再読み込みしてください。');
            }
            // エラー時は保存メッセージを非表示にする
            const saveMessage = document.getElementById('save-message');
            if (saveMessage) {
                saveMessage.style.display = 'none';
            }
        }
    };

    // Delete Prompt
    const deletePrompt = async (index) => {
        if (confirm('本当に削除しますか？')) {
            // Remove shortcut
            delete shortcuts[index];

            // Try to update shortcut command (non-critical, errors are ignored)
            try {
                await updateShortcutCommand(index, '');
            } catch (error) {
                console.warn('Shortcut command update failed (this is expected):', error);
            }

            // Reindex shortcuts
            const newShortcuts = {};
            for (let i = 0; i < prompts.length; i++) {
                if (i < index && shortcuts[i]) {
                    newShortcuts[i] = shortcuts[i];
                } else if (i > index && shortcuts[i]) {
                    newShortcuts[i - 1] = shortcuts[i];
                    // Try to update Chrome command (non-critical, errors are ignored)
                    try {
                        await updateShortcutCommand(i - 1, shortcuts[i]);
                        await updateShortcutCommand(i, '');
                    } catch (error) {
                        console.warn('Shortcut command update failed (this is expected):', error);
                    }
                }
            }
            shortcuts = newShortcuts;

            prompts.splice(index, 1);
            try {
                await safeSetStorage({ prompts, shortcuts });
                renderPrompts();
            } catch (error) {
                console.error('Failed to delete:', error);

                // Check if it's a quota error
                if (checkStorageError(error)) {
                    try {
                        // Clear storage and reinitialize
                        await chrome.storage.local.clear();
                        await safeSetStorage({ prompts, shortcuts });
                        renderPrompts();
                        alert('ストレージのクォータ制限に達していたため、ストレージをクリアして保存しました。');
                    } catch (reinitError) {
                        console.error('Failed to reinitialize:', reinitError);
                        alert('削除に失敗しました。拡張機能を再読み込みしてください。');
                    }
                } else {
                    alert('削除に失敗しました。拡張機能を再読み込みしてください。');
                }
            }
        }
    };

    // Event Listeners
    addBtn.addEventListener('click', () => openModal(-1));
    cancelBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', savePrompt);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Load shortcuts from storage
    const loadShortcuts = async () => {
        try {
            const data = await chrome.storage.local.get('shortcuts');
            shortcuts = data.shortcuts || {};
        } catch (error) {
            console.error('Failed to load shortcuts:', error);
            shortcuts = {};
        }
    };

    // Format shortcut key string
    const formatShortcutKey = (key) => {
        if (!key) return '';
        // Convert to Chrome commands format
        // Example: "Ctrl+Shift+U" -> "Ctrl+Shift+U"
        return key;
    };

    // Parse key event to shortcut string
    const parseKeyEvent = (e) => {
        const parts = [];

        // Check modifiers
        if (e.ctrlKey || e.metaKey) {
            parts.push(e.metaKey ? 'Command' : 'Ctrl');
        }
        if (e.altKey) {
            parts.push('Alt');
        }
        if (e.shiftKey) {
            parts.push('Shift');
        }

        // Get the key
        let key = e.key;
        if (key === ' ') {
            key = 'Space';
        } else if (key.length === 1) {
            key = key.toUpperCase();
        } else {
            // Handle special keys
            const keyMap = {
                'ArrowUp': 'Up',
                'ArrowDown': 'Down',
                'ArrowLeft': 'Left',
                'ArrowRight': 'Right',
                'Enter': 'Enter',
                'Escape': 'Esc',
                'Tab': 'Tab',
                'Backspace': 'Backspace',
                'Delete': 'Delete',
                'Insert': 'Insert',
                'Home': 'Home',
                'End': 'End',
                'PageUp': 'PageUp',
                'PageDown': 'PageDown',
                'F1': 'F1',
                'F2': 'F2',
                'F3': 'F3',
                'F4': 'F4',
                'F5': 'F5',
                'F6': 'F6',
                'F7': 'F7',
                'F8': 'F8',
                'F9': 'F9',
                'F10': 'F10',
                'F11': 'F11',
                'F12': 'F12'
            };
            key = keyMap[key] || key;
        }

        // Don't add modifier keys as the main key
        if (key !== 'Control' && key !== 'Meta' && key !== 'Alt' && key !== 'Shift') {
            parts.push(key);
        }

        return parts.length > 0 ? parts.join('+') : '';
    };

    // Check for shortcut conflicts
    const checkShortcutConflict = async (shortcutKey) => {
        if (!shortcutKey || shortcutKey === '') {
            return { hasConflict: false };
        }

        try {
            // Get all commands from Chrome
            const commands = await chrome.commands.getAll();

            // Check if this shortcut is already used by another command
            for (const cmd of commands) {
                if (cmd.shortcut && cmd.shortcut === shortcutKey) {
                    // Check if it's our own command
                    const isOurCommand = cmd.name === 'run_youtube_summary' ||
                        cmd.name.startsWith('run_prompt_');
                    if (!isOurCommand) {
                        return {
                            hasConflict: true,
                            conflictWith: cmd.name,
                            message: 'このショートカットキーは他の拡張機能またはChromeのデフォルトショートカットと競合しています。'
                        };
                    }
                }
            }

            // Check against known Chrome default shortcuts
            const chromeDefaults = [
                'Ctrl+Shift+Delete', 'Ctrl+Shift+N', 'Ctrl+Shift+T', 'Ctrl+Shift+W',
                'Ctrl+T', 'Ctrl+W', 'Ctrl+N', 'Ctrl+R', 'Ctrl+F', 'Ctrl+H',
                'Ctrl+J', 'Ctrl+K', 'Ctrl+L', 'Ctrl+P', 'Ctrl+S', 'Ctrl+U',
                'Ctrl+Shift+I', 'Ctrl+Shift+J', 'Ctrl+Shift+C', 'Ctrl+Shift+B',
                'Alt+Left', 'Alt+Right', 'Alt+Home', 'F5', 'Ctrl+F5'
            ];

            if (chromeDefaults.includes(shortcutKey)) {
                return {
                    hasConflict: true,
                    conflictWith: 'Chrome',
                    message: 'このショートカットキーはChromeのデフォルトショートカットと競合しています。'
                };
            }

            return { hasConflict: false };
        } catch (error) {
            console.error('Error checking shortcut conflict:', error);
            return { hasConflict: false };
        }
    };

    // Handle shortcut input
    shortcutInput.addEventListener('focus', () => {
        isRecordingShortcut = true;
        shortcutInput.classList.add('recording');
        shortcutInput.value = 'ショートカットキーを押してください...';
        shortcutConflictWarning.style.display = 'none';
    });

    shortcutInput.addEventListener('blur', () => {
        isRecordingShortcut = false;
        shortcutInput.classList.remove('recording');
    });

    shortcutInput.addEventListener('keydown', async (e) => {
        if (!isRecordingShortcut) return;

        e.preventDefault();
        e.stopPropagation();

        // Don't record Escape key
        if (e.key === 'Escape') {
            shortcutInput.blur();
            return;
        }

        const shortcutKey = parseKeyEvent(e);

        if (shortcutKey) {
            shortcutInput.value = shortcutKey;

            // Check for conflicts
            const conflict = await checkShortcutConflict(shortcutKey);
            if (conflict.hasConflict) {
                shortcutConflictWarning.style.display = 'flex';
                shortcutConflictWarning.querySelector('.warning-text').textContent = conflict.message;
            } else {
                shortcutConflictWarning.style.display = 'none';
            }

            // Update clear button visibility
            clearShortcutBtn.style.display = shortcutKey ? 'block' : 'none';
        }
    });

    clearShortcutBtn.addEventListener('click', () => {
        shortcutInput.value = '';
        clearShortcutBtn.style.display = 'none';
        shortcutConflictWarning.style.display = 'none';
    });

    // Gemini UI改善設定の管理
    const geminiEnterKey = document.getElementById('gemini-enter-key');
    const geminiToolShortcuts = document.getElementById('gemini-tool-shortcuts');
    const geminiLayoutWidthEnabled = document.getElementById('gemini-layout-width-enabled');
    const geminiLayoutWidthValue = document.getElementById('gemini-layout-width-value');
    const geminiLayoutWidthGroup = document.getElementById('gemini-layout-width-group');
    const geminiModelModes = document.getElementsByName('gemini-model-mode');
    const geminiSubmitKeyModifier = document.getElementById('gemini-submit-key-modifier');
    const geminiSubmitKeyModifierGroup = document.getElementById('gemini-submit-key-modifier-group');

    // Gemini UI改善設定の読み込み
    async function loadGeminiUIEnhancements() {
        try {
            const result = await chrome.storage.local.get({
                geminiUIEnhancements: {
                    enterKeyEnabled: true,
                    toolShortcutsEnabled: true,
                    layoutWidthEnabled: false,
                    layoutWidthValue: 1200,
                    modelMode: 'thinking',
                    submitKeyModifier: 'shift'
                }
            });

            const enhancements = result.geminiUIEnhancements || {
                enterKeyEnabled: true,
                toolShortcutsEnabled: true,
                layoutWidthEnabled: false,
                layoutWidthValue: 1200,
                submitKeyModifier: 'shift'
            };

            geminiEnterKey.checked = enhancements.enterKeyEnabled !== false;
            geminiToolShortcuts.checked = enhancements.toolShortcutsEnabled !== false;
            geminiLayoutWidthEnabled.checked = enhancements.layoutWidthEnabled === true;
            geminiLayoutWidthValue.value = enhancements.layoutWidthValue || 1200;
            const globalMode = enhancements.modelMode || (enhancements.thoughtModeEnabled ? 'thinking' : 'fast');
            geminiModelModes.forEach(r => r.checked = (r.value === globalMode));
            geminiSubmitKeyModifier.value = enhancements.submitKeyModifier || 'shift';

            // 表示/非表示を更新
            geminiLayoutWidthGroup.style.display = geminiLayoutWidthEnabled.checked ? 'block' : 'none';
            geminiSubmitKeyModifierGroup.style.display = geminiEnterKey.checked ? 'block' : 'none';
        } catch (error) {
            console.error('Error loading Gemini UI enhancements:', error);
        }
    }

    // Gemini UI改善設定の保存
    async function saveGeminiUIEnhancements() {
        try {
            const enhancements = {
                enterKeyEnabled: geminiEnterKey.checked,
                toolShortcutsEnabled: geminiToolShortcuts.checked,
                layoutWidthEnabled: geminiLayoutWidthEnabled.checked,
                layoutWidthValue: parseInt(geminiLayoutWidthValue.value, 10) || 1200,
                modelMode: Array.from(geminiModelModes).find(r => r.checked)?.value || 'thinking',
                submitKeyModifier: geminiSubmitKeyModifier.value
            };

            await chrome.storage.local.set({
                geminiUIEnhancements: enhancements
            });

            console.log('Gemini UI enhancements saved:', enhancements);
        } catch (error) {
            console.error('Error saving Gemini UI enhancements:', error);
            alert('設定の保存に失敗しました。');
        }
    }

    // イベントリスナーの設定
    geminiEnterKey.addEventListener('change', () => {
        geminiSubmitKeyModifierGroup.style.display = geminiEnterKey.checked ? 'block' : 'none';
        saveGeminiUIEnhancements();
    });
    geminiToolShortcuts.addEventListener('change', saveGeminiUIEnhancements);
    geminiModelModes.forEach(r => r.addEventListener('change', saveGeminiUIEnhancements));
    geminiLayoutWidthEnabled.addEventListener('change', () => {
        geminiLayoutWidthGroup.style.display = geminiLayoutWidthEnabled.checked ? 'block' : 'none';
        saveGeminiUIEnhancements();
    });
    geminiLayoutWidthValue.addEventListener('change', saveGeminiUIEnhancements);
    geminiLayoutWidthValue.addEventListener('blur', saveGeminiUIEnhancements);
    geminiSubmitKeyModifier.addEventListener('change', saveGeminiUIEnhancements);

    // Initial Load
    await loadShortcuts();
    await loadPrompts();
    await loadGeminiUIEnhancements();
});
