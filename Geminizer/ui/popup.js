// defaultPromptsはprompts/index.jsから window.defaultPrompts として読み込まれます

document.addEventListener('DOMContentLoaded', () => {
  // グローバルスコープからdefaultPromptsを取得
  const defaultPrompts = window.defaultPrompts;

  // デバッグログ
  console.log('[Geminizer Popup] DOMContentLoaded: Starting popup initialization...');
  console.log('[Geminizer Popup] defaultPrompts loaded:', defaultPrompts ? defaultPrompts.length : 'undefined');

  if (!defaultPrompts || defaultPrompts.length === 0) {
    console.error('[Geminizer Popup] ERROR: defaultPrompts not loaded!');
    const statusMessage = document.getElementById('status-message');
    if (statusMessage) {
      statusMessage.textContent = '❌ プロンプトの読み込みに失敗しました。拡張機能を再読み込みしてください。';
      statusMessage.className = 'status-message error';
    }
    return;
  }
  const promptSelect = document.getElementById('prompt-select');
  const runBtn = document.getElementById('run-btn');
  const optionsBtn = document.getElementById('options-btn');
  const statusMessage = document.getElementById('status-message');
  const promptCopySection = document.getElementById('prompt-copy');
  const promptCopyText = document.getElementById('prompt-copy-text');
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const modelModeRadios = document.getElementsByName('model-mode');
  const autoExecuteToggle = document.getElementById('auto-execute-toggle');
  let pendingSelectionText = null;

  console.log('[Geminizer Popup] DOMContentLoaded: Elements found:', {
    promptSelect: !!promptSelect,
    runBtn: !!runBtn,
    optionsBtn: !!optionsBtn,
    statusMessage: !!statusMessage
  });


  // Prompt info mapping
  const promptInfoMap = {
    'YouTube要約 (Summary)': {
      recommendedSettings: [
        '思考モード: ON（詳細な分析のため）',
        'Canvas: OFF（テキスト出力のみ）'
      ],
      postProcessing: [
        '生成された要約を確認し、必要に応じて編集',
        'タイムスタンプリンクが正しく機能しているか確認',
        '重要度の評価（★）が適切か確認',
        '要約の長さが適切か確認（全体で2000-5000文字程度）'
      ]
    },
    'インフォグラフィック構成案': {
      recommendedSettings: [
        '思考モード: ON（詳細な設計のため）',
        'Canvas: ON（視覚的な構成案を作成）'
      ],
      postProcessing: [
        '生成された構成案を確認',
        'HTML構造案を実際のコードに変換',
        'カラーパレットとデザイン要素を実装',
        'レスポンシブデザインの確認',
        'アニメーションやインタラクティブ要素の実装'
      ]
    },
    'ファクトチェック (Fact Check)': {
      recommendedSettings: [
        '思考モード: OFF (Deep Researchを使用)',
        'ツール: Deep Research ON',
        'Canvas: OFF'
      ],
      postProcessing: [
        '抽出された主張の妥当性を確認',
        '提示された根拠ソースの信頼性をチェック',
        '最新情報との乖離がないか確認',
        '補足情報や正しいデータが適切か確認'
      ]
    },
    'ポッドキャスト台本': {
      recommendedSettings: [
        '思考モード: ON（自然な会話の生成のため）',
        'Canvas: ON（台本の視覚化とJSON出力）'
      ],
      postProcessing: [
        '生成された台本を読み上げて自然さを確認',
        '「Open in Podcast Player」ボタンからプレーヤーを起動',
        'APIキーが設定されている場合、実際に音声を生成して再生確認',
        'JSONデータが正しく含まれているか確認'
      ]
    },
    '文系新卒1年目向け詳細解説': {
      recommendedSettings: [
        '思考モード: ON（丁寧な教育的解説のため）',
        'Canvas: OFF'
      ],
      postProcessing: [
        '専門用語の解説が新卒レベルで分かりやすいか確認',
        '実務への接続（アクションステップ）が具体的か確認',
        '社会人1年目から2年目、3年目へのステップアップを示唆',
        'トーンが優しく、励ましを含んでいるか確認'
      ]
    },
    'DeepResearch業界分析': {
      recommendedSettings: [
        '思考モード: OFF (Deep Researchを使用)',
        'ツール: Deep Research ON',
        'Canvas: OFF'
      ],
      postProcessing: [
        '市場規模や成長率などの具体的な数値を確認',
        '競合企業のポジショニングが適切か確認',
        'PEST分析やSWOT分析の深さを確認',
        '将来展望とリスクシナリオの妥当性を確認'
      ]
    },
    '詳細議事録作成': {
      recommendedSettings: [
        '思考モード: ON（複雑な議論の整理のため）',
        'Canvas: OFF'
      ],
      postProcessing: [
        '話者分離が正しく行われているか確認',
        'セクションごとの要点が議論の盛り上がりを反映しているか確認',
        '決定事項やネクストアクションが明確か確認'
      ]
    },
    'Webサイト分析': {
      recommendedSettings: [
        '思考モード: ON（視覚的・心理的分析のため）',
        'Canvas: OFF',
        'モード: Capture（スクリーンショットを使用）'
      ],
      postProcessing: [
        'ペルソナ分析の具体性を確認',
        'UX/UIの課題と改善案が論理的か確認',
        'オマージュすべき戦略が明確か確認'
      ]
    },
    'NanoBanana Pro 図解作成': {
      recommendedSettings: [
        '思考モード: ON（構造化されたデータ作成のため）',
        'Canvas: ON（図解の視覚化）',
        'ツール: NanoBanana ON'
      ],
      postProcessing: [
        '生成された図解データをNanoBanana Pro形式に変換',
        '各要素の位置、サイズ、色を調整',
        'スマートフォンでの表示を確認',
        'アニメーションやインタラクション要素の実装'
      ]
    }
  };

  // Load prompts from storage
  let prompts = [];
  const promptInfo = document.getElementById('prompt-info');
  const recommendedSettings = document.getElementById('recommended-settings');
  const postProcessing = document.getElementById('post-processing');
  const manualContentPlaceholder = '<<貼り付けたスクリーンショットの内容を参照してください>>';

  const buildPromptText = (template, url, title, contentText) => {
    if (!template) return '';
    return template
      .replace(/\{\{url\}\}/g, url || '')
      .replace(/\{\{URL\}\}/g, url || '')
      .replace(/\{\{title\}\}/g, title || '')
      .replace(/\{\{タイトル\}\}/g, title || '')
      .replace(/\{\{content\}\}/g, contentText || '')
      .replace(/\{\{コンテンツ\}\}/g, contentText || '')
      .replace(/\{\{content\}\}/g, contentText || '')
      .replace(/\{\{コンテンツ\}\}/g, contentText || '');
  };

  const hidePromptCopy = () => {
    if (!promptCopySection) return;
    promptCopySection.style.display = 'none';
    promptCopyText.value = '';
  };

  const showPromptCopy = (text) => {
    if (!promptCopySection) return;
    promptCopyText.value = text || '';
    promptCopySection.style.display = 'flex';
  };
  hidePromptCopy();

  const getPromptDefaultMode = (prompt) => {
    if (prompt && prompt.defaultMode) return prompt.defaultMode;
    if (prompt && prompt.usePageContent) return 'text';
    return 'url';
  };

  const applyPromptDefaultMode = (prompt) => {
    const mode = getPromptDefaultMode(prompt);
    const modeRadio = document.querySelector(`input[name="mode"][value="${mode}"]`);
    if (modeRadio) {
      modeRadio.checked = true;
    }
  };

  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', async () => {
      if (!promptCopyText.value) return;
      const originalLabel = copyPromptBtn.textContent;
      try {
        await navigator.clipboard.writeText(promptCopyText.value);
        copyPromptBtn.textContent = 'コピーしました！';
        setTimeout(() => {
          copyPromptBtn.textContent = originalLabel;
        }, 2000);
      } catch (error) {
        statusMessage.textContent = 'プロンプトのコピーに失敗しました: ' + error.message;
        statusMessage.className = 'status-message error';
      }
    });
  }

  const updatePromptInfo = (promptTitle) => {
    const info = promptInfoMap[promptTitle];
    if (info) {
      recommendedSettings.innerHTML = '<ul>' + info.recommendedSettings.map(s => `<li>${s}</li>`).join('') + '</ul>';
      postProcessing.innerHTML = '<ul>' + info.postProcessing.map(p => `<li>${p}</li>`).join('') + '</ul>';
      promptInfo.style.display = 'block';
    } else {
      promptInfo.style.display = 'none';
    }
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

  const loadPrompts = async () => {
    console.log('[Geminizer Popup] loadPrompts: Starting...');
    // First, try to clear and reinitialize if there's any issue
    let needsReinit = false;

    try {
      // Try to get prompts with error handling
      let data;
      try {
        console.log('[Geminizer Popup] loadPrompts: Attempting to get prompts from storage...');
        data = await chrome.storage.local.get(['prompts', 'version']);
        console.log('[Geminizer Popup] loadPrompts: Storage data received:', data);
      } catch (getError) {
        console.error('[Geminizer Popup] loadPrompts: Error getting prompts:', getError);
        needsReinit = true;
      }

      const currentVersion = '0.9.32';
      const savedVersion = data?.version || '0.9.0';

      // If get failed or data is invalid, reinitialize
      if (needsReinit || !data || typeof data !== 'object') {
        console.log('Storage data invalid, clearing and reinitializing...');
        await chrome.storage.local.clear();
        prompts = defaultPrompts;
        await chrome.storage.local.set({ prompts, version: currentVersion });
        needsReinit = false;
      } else {
        prompts = data.prompts || [];

        // Initialize if empty
        if (prompts.length === 0) {
          prompts = defaultPrompts;
          try {
            await chrome.storage.local.set({ prompts, version: currentVersion });
          } catch (setError) {
            console.error('Error setting prompts:', setError);
            // If setting fails, clear and retry
            await chrome.storage.local.clear();
            await chrome.storage.local.set({ prompts, version: currentVersion });
          }
        } else {
          // Check if version has changed - merge new default prompts and remove old ones
          if (savedVersion !== currentVersion) {
            const defaultPromptsMap = new Map(defaultPrompts.map(dp => [dp.title, dp]));

            // Force update existing default prompts with new content
            prompts = prompts.map(p => {
              if (defaultPromptsMap.has(p.title)) {
                return { ...p, ...defaultPromptsMap.get(p.title) };
              }
              return p;
            });

            // Add truly new ones
            const existingTitles = new Set(prompts.map(p => p.title));
            const newPrompts = defaultPrompts.filter(dp => !existingTitles.has(dp.title));
            if (newPrompts.length > 0) {
              prompts = [...prompts, ...newPrompts];
              console.log(`[Geminizer Popup] Added ${newPrompts.length} new prompts:`, newPrompts.map(p => p.title));
            }

            // Remove prompts that are no longer in defaultPrompts
            const defaultTitles = new Set(defaultPrompts.map(dp => dp.title));
            prompts = prompts.filter(p => defaultTitles.has(p.title) || !data.prompts.find(op => op.title === p.title));

            await chrome.storage.local.set({ prompts, version: currentVersion });
          }
          // Update prompts if needed
          let updated = false;
          prompts = prompts.map((prompt) => {
            if (!prompt.defaultMode) {
              updated = true;
              return { ...prompt, defaultMode: getPromptDefaultMode(prompt) };
            }
            return prompt;
          });
          if (updated) {
            try {
              await chrome.storage.local.set({ prompts });
            } catch (setError) {
              console.error('Error updating prompts:', setError);
              // If update fails, clear and reinitialize
              await chrome.storage.local.clear();
              prompts = defaultPrompts;
              await chrome.storage.local.set({ prompts });
            }
          }
        }
      }

      console.log('[Geminizer Popup] loadPrompts: Populating dropdown with', prompts.length, 'prompts');
      promptSelect.innerHTML = '';

      prompts.forEach((prompt, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = prompt.title;
        promptSelect.appendChild(option);
        console.log('[Geminizer Popup] loadPrompts: Added option', index, ':', prompt.title);
      });
      console.log('[Geminizer Popup] loadPrompts: Dropdown populated, enabling run button');
      runBtn.disabled = false;

      // Load last used prompt and mode
      console.log('[Geminizer Popup] loadPrompts: Loading last used prompt...');
      await loadLastUsed();
      console.log('[Geminizer Popup] loadPrompts: Complete! Selected value:', promptSelect.value);

      // Load pending selection from context menu
      await handlePendingSelection();

      // Update prompt info when prompt is selected
      promptSelect.addEventListener('change', () => {
        const selectedIndex = promptSelect.value;
        hidePromptCopy();
        if (selectedIndex !== '' && prompts[selectedIndex]) {
          updatePromptInfo(prompts[selectedIndex].title);
          applyPromptDefaultMode(prompts[selectedIndex]);

          // Apply prompt-specific model mode
          let modeToSet = 'fast';
          const p = prompts[selectedIndex];

          if (p.targetModel) {
            const tm = p.targetModel.toLowerCase();
            if (tm === 'thinking' || tm === 'thought') modeToSet = 'thinking';
            else if (tm === 'pro') modeToSet = 'pro';
            else modeToSet = 'fast';
          } else if (p.modelMode) {
            modeToSet = p.modelMode;
          } else if (p.thoughtMode) {
            modeToSet = 'thinking';
          } else {
            // Fallback to recommendedSettings in promptInfoMap
            const info = promptInfoMap[p.title];
            if (info && info.recommendedSettings) {
              const rec = info.recommendedSettings.find(s => s.includes('思考モード: ON'));
              if (rec) modeToSet = 'thinking';
              const recPro = info.recommendedSettings.find(s => s.includes('Proモード: ON') || s.includes('Pro: ON'));
              if (recPro) modeToSet = 'pro';
            }
          }
          modelModeRadios.forEach(r => r.checked = (r.value === modeToSet));
        } else {
          promptInfo.style.display = 'none';
        }
      });

      // Clear any previous error messages
      if (statusMessage && statusMessage.className === 'status-message error') {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
      }

    } catch (error) {
      console.error('[Geminizer Popup] loadPrompts: Error occurred:', error);

      // Always try to clear and reinitialize on any error
      try {
        console.log('Error occurred, clearing storage and reinitializing...');
        await chrome.storage.local.clear();
        prompts = defaultPrompts;
        await chrome.storage.local.set({ prompts });

        // Reload the prompts
        promptSelect.innerHTML = '';
        prompts.forEach((prompt, index) => {
          const option = document.createElement('option');
          option.value = index;
          option.text = prompt.title;
          promptSelect.appendChild(option);
        });
        runBtn.disabled = false;

        if (prompts.length > 0) {
          promptSelect.value = '0';
          updatePromptInfo(prompts[0].title);
          applyPromptDefaultMode(prompts[0]);
        }

        statusMessage.textContent = '✅ ストレージをクリアして再初期化しました。デフォルトプロンプトが読み込まれました。';
        statusMessage.className = 'status-message success';
      } catch (reinitError) {
        console.error('Failed to reinitialize:', reinitError);
        // Even if reinit fails, try to use default prompts in memory
        prompts = defaultPrompts;
        promptSelect.innerHTML = '';
        prompts.forEach((prompt, index) => {
          const option = document.createElement('option');
          option.value = index;
          option.text = prompt.title;
          promptSelect.appendChild(option);
        });
        runBtn.disabled = false;

        if (prompts.length > 0) {
          promptSelect.value = '0';
          updatePromptInfo(prompts[0].title);
          applyPromptDefaultMode(prompts[0]);
        }

        statusMessage.textContent = '⚠️ ストレージに保存できませんでしたが、デフォルトプロンプトを使用できます。';
        statusMessage.className = 'status-message warning';
      }
    }
  };

  // Open Options Page
  optionsBtn.addEventListener('click', () => {
    console.log('[Geminizer Popup] Options button clicked');
    try {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options.html'));
      }
    } catch (error) {
      console.error('[Geminizer Popup] Error opening options page:', error);
    }
  });

  // Handle Auto-execute toggle change
  if (autoExecuteToggle) {
    autoExecuteToggle.addEventListener('change', async () => {
      try {
        await chrome.storage.local.set({ autoExecute: autoExecuteToggle.checked });
      } catch (e) {
        console.warn('Failed to save auto-execute preference:', e);
      }
    });
  }

  // Handle Model Mode change
  modelModeRadios.forEach(radio => {
    radio.addEventListener('change', async () => {
      try {
        const selectedMode = Array.from(modelModeRadios).find(r => r.checked)?.value;
        await chrome.storage.local.set({ sessionModelMode: selectedMode });
      } catch (e) {
        console.warn('Failed to save model mode:', e);
      }
    });
  });

  // Handle pending selection from context menu
  const handlePendingSelection = async () => {
    try {
      const data = await chrome.storage.local.get('pendingSelection');
      if (data.pendingSelection) {
        pendingSelectionText = data.pendingSelection;
        // Set mode to text
        const textModeRadio = document.querySelector('input[name="mode"][value="text"]');
        if (textModeRadio) {
          textModeRadio.checked = true;
        }

        // Show status
        statusMessage.textContent = '✅ 右クリックで選択されたテキストを使用します';
        statusMessage.className = 'status-message success';

        // Clear pending selection after reading it
        await chrome.storage.local.remove('pendingSelection');
      }
    } catch (e) {
      console.warn('Failed to handle pending selection:', e);
    }
  };

  // Save last used prompt and mode
  const saveLastUsed = async (promptIndex, mode) => {
    try {
      const currentModelMode = Array.from(modelModeRadios).find(r => r.checked)?.value;
      await chrome.storage.local.set({
        lastUsedPrompt: promptIndex,
        lastUsedMode: mode,
        sessionModelMode: currentModelMode
      });
    } catch (error) {
      // Silently fail - this is not critical functionality
      console.warn('Failed to save last used:', error);
    }
  };

  // Load last used prompt and mode
  const loadLastUsed = async () => {
    try {
      const data = await chrome.storage.local.get(['lastUsedPrompt', 'lastUsedMode']);

      let applied = false;
      if (data && data.lastUsedPrompt !== undefined && prompts[data.lastUsedPrompt]) {
        promptSelect.value = data.lastUsedPrompt;
        updatePromptInfo(prompts[data.lastUsedPrompt].title);
        const modeToApply = data.lastUsedMode || getPromptDefaultMode(prompts[data.lastUsedPrompt]);
        const modeRadio = document.querySelector(`input[name="mode"][value="${modeToApply}"]`);
        if (modeRadio) {
          modeRadio.checked = true;
        }
        applied = true;
      }
      if (!applied && prompts.length > 0) {
        promptSelect.value = '0';
        updatePromptInfo(prompts[0].title);
        applyPromptDefaultMode(prompts[0]);
      }
    } catch (error) {
      // Silently fail and use defaults
      console.warn('Failed to load last used:', error);
      if (prompts.length > 0) {
        promptSelect.value = '0';
        updatePromptInfo(prompts[0].title);
        applyPromptDefaultMode(prompts[0]);
      }
    }

    // Load global model mode setting
    try {
      const globalData = await chrome.storage.local.get('geminiUIEnhancements');
      const globalModelMode = globalData.geminiUIEnhancements?.modelMode ||
        (globalData.geminiUIEnhancements?.thoughtModeEnabled ? 'thinking' : 'fast');

      modelModeRadios.forEach(r => r.checked = (r.value === globalModelMode));

      // override by session setting if available
      const sessionData = await chrome.storage.local.get('sessionModelMode');
      if (sessionData.sessionModelMode !== undefined) {
        modelModeRadios.forEach(r => r.checked = (r.value === sessionData.sessionModelMode));
      }
    } catch (e) {
      console.warn('Failed to load model mode settings:', e);
    }
    // Load global auto-execute setting
    try {
      const globalData = await chrome.storage.local.get('autoExecute');
      if (autoExecuteToggle) {
        autoExecuteToggle.checked = globalData.autoExecute !== false; // Default to true
      }
    } catch (e) {
      console.warn('Failed to load auto-execute setting:', e);
    }
  };

  // Run Summary
  runBtn.addEventListener('click', async () => {
    const selectedIndex = promptSelect.value;
    if (selectedIndex === '') return;

    // Get selected mode
    const selectedMode = document.querySelector('input[name="mode"]:checked')?.value || 'url';

    // Save last used prompt and mode
    await saveLastUsed(selectedIndex, selectedMode);

    hidePromptCopy();
    const mode = selectedMode;
    statusMessage.textContent = '実行中...';
    statusMessage.className = 'status-message';

    try {
      // Get selected prompt (use cached prompts if available)
      if (prompts.length === 0) {
        const data = await chrome.storage.local.get('prompts');
        prompts = data.prompts || defaultPrompts;
      }
      const prompt = prompts[selectedIndex];

      if (!prompt) {
        throw new Error('Selected prompt not found');
      }

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error('No active tab found');
      }

      // Determine flags based on mode
      let usePageContent = false;
      let captureImage = false;

      if (mode === 'text') {
        usePageContent = true;
      } else if (mode === 'capture') {
        captureImage = true;
      }
      // URL mode: usePageContent = false, captureImage = false

      if (captureImage) {
        statusMessage.textContent = 'キャプチャー中...';
        statusMessage.className = 'status-message';

        const fullPageDataUrl = await captureFullPage(tab.id);

        if (!fullPageDataUrl) {
          throw new Error('ページ全体のキャプチャーに失敗しました');
        }

        statusMessage.textContent = 'Geminiへ送信中...';

        // Copy to clipboard for manual paste
        try {
          await copyImageToClipboard(fullPageDataUrl);
          console.log('[Geminizer] Screenshot copied to clipboard');
        } catch (err) {
          console.warn('[Geminizer] Failed to copy to clipboard, user may need to retry:', err);
        }

        const runtimePrompt = { ...prompt, usePageContent: false };
        const currentModelMode = Array.from(modelModeRadios).find(r => r.checked)?.value || 'fast';

        chrome.runtime.sendMessage({
          action: 'runPrompt',
          prompt: runtimePrompt,
          tabId: tab.id,
          tabUrl: tab.url,
          tabTitle: tab.title,
          modelMode: currentModelMode,
          autoExecute: false, // Manual paste means no auto-execute
          imageDataUrl: fullPageDataUrl,
          manualImagePaste: true
        }, (response) => {
          if (chrome.runtime.lastError) {
            statusMessage.textContent = 'エラー: ' + chrome.runtime.lastError.message;
            statusMessage.className = 'status-message error';
          } else if (response && response.success === false) {
            statusMessage.textContent = 'エラー: ' + (response.error || 'Geminiへの送信に失敗しました');
            statusMessage.className = 'status-message error';
          } else {
            statusMessage.textContent = '✅ キャプチャーを送信しました';
            statusMessage.className = 'status-message success';
          }
        });

      } else {
        const runtimePrompt = { ...prompt, usePageContent: usePageContent };
        const currentModelMode = Array.from(modelModeRadios).find(r => r.checked)?.value || 'fast';

        chrome.runtime.sendMessage({
          action: 'runPrompt',
          prompt: runtimePrompt,
          tabId: tab.id,
          tabUrl: tab.url,
          tabTitle: tab.title,
          modelMode: currentModelMode,
          autoExecute: autoExecuteToggle ? autoExecuteToggle.checked : true,
          forcePageContent: pendingSelectionText
        }, (response) => {
          if (chrome.runtime.lastError) {
            statusMessage.textContent = 'エラー: ' + chrome.runtime.lastError.message;
            statusMessage.className = 'status-message error';
          } else if (response && response.success === false && response.validation) {
            // Validation failed
            handleValidationError(response.validation, runtimePrompt, tab.url, tab.title);
          } else {
            // Show warnings if any
            if (response && response.validation && response.validation.warnings && response.validation.warnings.length > 0) {
              statusMessage.innerHTML = '⚠️ 警告: ' + response.validation.warnings.join(' ') + '<br>Geminiを開きました';
              statusMessage.className = 'status-message warning';
            } else {
              statusMessage.textContent = '✅ Geminiを開きました';
              statusMessage.className = 'status-message success';
            }
            // Keep popup open - don't close window
          }
        });
      }

    } catch (error) {
      console.error('Execution failed:', error);
      statusMessage.textContent = 'エラー: ' + error.message;
    }
  });

  // Helper to copy image to clipboard
  async function copyImageToClipboard(dataUrl) {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
    } catch (err) {
      console.error('Failed to copy image:', err);
      throw new Error('画像のコピーに失敗しました');
    }
  }

  // Capture full page by scrolling and combining screenshots
  async function captureFullPage(tabId) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      const TIMEOUT = 120000; // 2分タイムアウト

      // Set up message listener for full page capture
      const messageListener = (message, sender, sendResponse) => {
        if (message.action === 'startFullPageCapture') {
          sendResponse({ success: true });
          return true;
        } else if (message.action === 'captureScreenRequest') {
          // Capture current visible tab when requested by content script
          // Get the active tab first to ensure we're capturing the right one
          chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError) {
              sendResponse({ success: false, error: chrome.runtime.lastError.message });
              return;
            }

            // Capture visible tab
            chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
              if (chrome.runtime.lastError) {
                chrome.tabs.sendMessage(tabId, {
                  action: 'captureScreenResponse',
                  index: message.index,
                  dataUrl: null,
                  error: chrome.runtime.lastError.message
                });
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
              }

              // Send response back to content script
              chrome.tabs.sendMessage(tabId, {
                action: 'captureScreenResponse',
                index: message.index,
                dataUrl: dataUrl
              }, (response) => {
                if (chrome.runtime.lastError) {
                  console.warn('Failed to send capture response:', chrome.runtime.lastError);
                }
              });
            });
          });
          sendResponse({ success: true });
          return true;
        } else if (message.action === 'combineScreenshots') {
          // Combine screenshots in popup (has DOM access)
          clearTimeout(timeoutId);
          combineScreenshots(message.screenshots, message.viewportWidth, message.viewportHeight, message.scrollHeight)
            .then((combinedDataUrl) => {
              chrome.runtime.onMessage.removeListener(messageListener);
              resolve(combinedDataUrl);
            })
            .catch((err) => {
              chrome.runtime.onMessage.removeListener(messageListener);
              reject(err);
            });
          sendResponse({ success: true });
          return true;
        } else if (message.action === 'captureError') {
          clearTimeout(timeoutId);
          chrome.runtime.onMessage.removeListener(messageListener);
          reject(new Error(message.error || 'キャプチャー中にエラーが発生しました'));
          sendResponse({ success: true });
          return true;
        }
      };

      chrome.runtime.onMessage.addListener(messageListener);

      // Set timeout
      timeoutId = setTimeout(() => {
        chrome.runtime.onMessage.removeListener(messageListener);
        reject(new Error('キャプチャーがタイムアウトしました'));
      }, TIMEOUT);

      // Inject content script to start full page capture
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['src/full_page_capture.js']
      }, (results) => {
        if (chrome.runtime.lastError) {
          clearTimeout(timeoutId);
          chrome.runtime.onMessage.removeListener(messageListener);
          reject(new Error(chrome.runtime.lastError.message));
        }
      });
    });
  }

  // Combine multiple screenshots into one full page image
  async function combineScreenshots(screenshots, viewportWidth, viewportHeight, scrollHeight) {
    return new Promise((resolve, reject) => {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = viewportWidth;
      canvas.height = scrollHeight;
      const ctx = canvas.getContext('2d');

      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load and draw each screenshot
      let loadedCount = 0;
      let errorCount = 0;
      const images = [];

      if (screenshots.length === 0) {
        reject(new Error('キャプチャー画像がありません'));
        return;
      }

      // Sort screenshots by index to ensure correct order
      screenshots.sort((a, b) => (a.index || 0) - (b.index || 0));

      screenshots.forEach((screenshot, index) => {
        if (!screenshot.dataUrl) {
          errorCount++;
          if (errorCount === screenshots.length) {
            reject(new Error('すべてのキャプチャー画像の読み込みに失敗しました'));
          }
          return;
        }

        const img = new Image();
        img.onload = () => {
          // Calculate correct Y position
          const y = screenshot.y || (index * viewportHeight);
          images.push({ img, y, index: screenshot.index || index });
          loadedCount++;

          if (loadedCount + errorCount === screenshots.length) {
            // Draw all images in order
            images.sort((a, b) => a.y - b.y);

            // Draw with overlap handling
            let lastY = 0;
            images.forEach(({ img, y }) => {
              // If there's overlap, only draw the new part
              const drawY = Math.max(y, lastY);
              const drawHeight = Math.min(img.height, scrollHeight - drawY);
              if (drawHeight > 0) {
                ctx.drawImage(img, 0, 0, img.width, drawHeight, 0, drawY, img.width, drawHeight);
                lastY = drawY + drawHeight;
              }
            });

            // Convert to data URL
            try {
              const dataUrl = canvas.toDataURL('image/png');
              resolve(dataUrl);
            } catch (err) {
              reject(new Error('画像の結合に失敗しました: ' + err.message));
            }
          }
        };
        img.onerror = () => {
          errorCount++;
          console.warn(`画像の読み込みに失敗しました: ${index}`);
          if (errorCount + loadedCount === screenshots.length) {
            if (loadedCount === 0) {
              reject(new Error('すべてのキャプチャー画像の読み込みに失敗しました'));
            } else {
              // Continue with available images
              images.sort((a, b) => a.y - b.y);
              images.forEach(({ img, y }) => {
                const drawY = Math.max(y, 0);
                const drawHeight = Math.min(img.height, scrollHeight - drawY);
                if (drawHeight > 0) {
                  ctx.drawImage(img, 0, 0, img.width, drawHeight, 0, drawY, img.width, drawHeight);
                }
              });
              const dataUrl = canvas.toDataURL('image/png');
              resolve(dataUrl);
            }
          }
        };
        img.src = screenshot.dataUrl;
      });
    });
  }

  // Handle validation errors
  function handleValidationError(validation, prompt, url, title) {
    let errorMessage = '❌ コンテンツの検証に失敗しました:\n\n';
    errorMessage += validation.errors.join('\n');

    if (validation.warnings && validation.warnings.length > 0) {
      errorMessage += '\n\n⚠️ 警告:\n' + validation.warnings.join('\n');
    }

    // Construct the prompt text for manual copy
    let promptText = prompt.content
      .replace(/\{\{url\}\}/g, url || '{{url}}')
      .replace(/\{\{title\}\}/g, title || '{{title}}')
      .replace(/\{\{content\}\}/g, '{{content}}');

    errorMessage += '\n\n📋 対処方法:\n';
    errorMessage += '1. 以下のプロンプトをコピーしてください\n';
    errorMessage += '2. Geminiを手動で開いてください\n';
    errorMessage += '3. プロンプトをペーストして実行してください\n\n';
    errorMessage += '--- コピー用プロンプト ---\n';
    errorMessage += promptText;

    statusMessage.innerHTML = errorMessage.replace(/\n/g, '<br>');
    statusMessage.className = 'status-message error';
    statusMessage.style.whiteSpace = 'pre-wrap';
    statusMessage.style.textAlign = 'left';
    statusMessage.style.maxHeight = '400px';
    statusMessage.style.overflowY = 'auto';

    // Copy prompt to clipboard
    navigator.clipboard.writeText(promptText).then(() => {
      const copyNotice = document.createElement('div');
      copyNotice.textContent = '✅ プロンプトをクリップボードにコピーしました';
      copyNotice.style.marginTop = '10px';
      copyNotice.style.color = '#34a853';
      copyNotice.style.fontSize = '12px';
      statusMessage.appendChild(copyNotice);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  }

  // Initialize Help Button - Open help page in new tab
  const helpBtn = document.getElementById('help-btn');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('help.html') });
    });
  }

  // Initial Load
  console.log('[Geminizer Popup] Calling loadPrompts()...');
  try {
    loadPrompts().catch(error => {
      console.error('[Geminizer Popup] Error in loadPrompts:', error);
      // Show error message to user
      if (statusMessage) {
        statusMessage.textContent = '❌ プロンプトの読み込みに失敗しました。ページを再読み込みしてください。';
        statusMessage.className = 'status-message error';
      }
    });
  } catch (error) {
    console.error('[Geminizer Popup] Fatal error during initialization:', error);
    if (statusMessage) {
      statusMessage.textContent = '❌ 初期化エラー: ' + error.message;
      statusMessage.className = 'status-message error';
    }
  }

  // Check if current tab is YouTube and auto-run summary if needed
  // This allows the extension icon click on YouTube to trigger summary
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com/watch')) {
      // YouTube video page detected
      // Optionally auto-run summary here, or show a YouTube-specific UI
      // For now, we'll just ensure the button exists (handled by youtube_button_injector.js)
      // If user wants icon click to trigger summary, we can add it here
    }
  });
});
