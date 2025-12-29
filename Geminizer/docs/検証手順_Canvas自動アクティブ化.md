# Canvas自動アクティブ化機能の検証手順

## 問題の状況
- Geminizerはプロンプトを送信することには成功している
- Canvas機能を自動的にオンにすることができない
- コンソールに `[Geminizer] No tools requested in this prompt` が表示される

## 検証ステップ

### ステップ1: プロンプトの設定を確認（オプションページ）

1. **拡張機能のオプションページを開く**
   - 拡張機能アイコンを右クリック → 「オプション」
   - または `chrome://extensions/` → Geminizer → 「オプション」

2. **プロンプトを編集**
   - インフォグラフィック用のプロンプトを探す
   - 編集ボタンをクリック

3. **ツール選択の確認**
   - 「実行時にツールを自動アクティブ化」セクションを確認
   - **「Canvas」のチェックボックスにチェックが入っているか確認**
   - チェックが入っていない場合は、チェックを入れて保存

4. **保存を確認**
   - 「保存」ボタンをクリック
   - 「保存されました」メッセージが表示されることを確認

---

### ステップ2: ストレージにデータが保存されているか確認（Applicationタブ）

1. **開発者ツールを開く**
   - `F12` キーを押す、または右クリック → 「検証」

2. **Applicationタブを開く**
   - 開発者ツールの上部タブから「Application」を選択

3. **Storage → Local Storage を確認**
   - 左サイドバーで「Storage」を展開
   - `chrome-extension://[拡張機能ID]` をクリック
   - または「Local Storage」→ 拡張機能のURLを選択

4. **chrome.storage.sync の内容を確認**
   - 左サイドバーで「Storage」→「chrome-extension://[拡張機能ID]」を展開
   - 実際には、`chrome.storage.sync`は開発者ツールでは直接確認できません
   - 代わりに、以下の方法で確認：

#### 代替方法: コンソールでストレージを確認

1. **Consoleタブを開く**
2. **以下のコードを実行**：

```javascript
chrome.storage.sync.get(null, (items) => {
    console.log('All storage items:', items);
    const prompts = items.prompts || [];
    console.log('Prompts:', prompts);
    // インフォグラフィックプロンプトを探す
    const infoPrompt = prompts.find(p => p.title && p.title.includes('インフォグラフィック'));
    if (infoPrompt) {
        console.log('Infographic prompt:', infoPrompt);
        console.log('Tools config:', infoPrompt.tools);
    } else {
        console.log('Infographic prompt not found');
    }
});
```

3. **結果を確認**
   - `tools` プロパティが存在するか
   - `tools.canvas` が `true` になっているか

---

### ステップ3: プロンプト実行時のログを確認（Consoleタブ）

1. **Consoleタブを開く**
   - 開発者ツールの「Console」タブを選択

2. **フィルターを設定**
   - コンソールのフィルターバーに「Geminizer」と入力
   - または「すべてのレベルを表示」に設定

3. **プロンプトを実行**
   - ポップアップまたはショートカットでプロンプトを実行

4. **以下のログが表示されるか確認**：

**期待されるログ（背景スクリプト）**：
```
[Geminizer Background] Prompt tools configuration: {canvas: true, deepResearch: false, nanobanana: false}
[Geminizer Background] Full prompt object: {...}
[Geminizer Background] Sending message to ai_injector: {...}
```

**期待されるログ（ai_injector.js）**：
```
[Geminizer] Tools requested: {canvas: true, deepResearch: false, nanobanana: false}
[Geminizer] Attempting to activate tools after delay...
[Geminizer] Attempting to activate tool: canvas with icon: note_stack_add
[Geminizer] Found inactive tool button, clicking...
[Geminizer] Tool menu found, looking for tool icon...
[Geminizer] Found tool icon: note_stack_add
[Geminizer] Clicking tool button...
[Geminizer] Successfully activated tool: canvas
```

**問題がある場合のログ**：
```
[Geminizer] No tools requested in this prompt
```

---

### ステップ4: プロンプトオブジェクトの構造を確認（Consoleタブ）

1. **Consoleタブで以下のコードを実行**：

```javascript
// 背景スクリプトのログを確認
// （背景スクリプトは別のコンテキストなので、直接は見えません）
// 代わりに、popup.jsやoptions.jsから確認する方法：

// オプションページを開いて、Consoleタブで：
chrome.storage.sync.get('prompts', (result) => {
    const prompts = result.prompts || [];
    prompts.forEach((prompt, index) => {
        console.log(`Prompt ${index}:`, prompt);
        if (prompt.tools) {
            console.log(`  Tools:`, prompt.tools);
        } else {
            console.log(`  ⚠️ No tools property!`);
        }
    });
});
```

---

### ステップ5: 実際のメッセージ送信を確認（Networkタブ）

1. **Networkタブを開く**
   - 開発者ツールの「Network」タブを選択

2. **フィルターを設定**
   - フィルターバーに「geminizer」や「background」と入力
   - または「すべて」を表示

3. **プロンプトを実行**
   - ポップアップまたはショートカットでプロンプトを実行

4. **メッセージの送信を確認**
   - ただし、`chrome.tabs.sendMessage`はNetworkタブには表示されません
   - 代わりに、Consoleログで確認してください

---

## トラブルシューティング

### ケース1: `tools` プロパティが存在しない

**症状**: Consoleで `prompt.tools` が `undefined`

**原因**: プロンプトが保存される際に `tools` プロパティが含まれていない

**解決策**:
1. オプションページでプロンプトを再編集
2. 「Canvas」のチェックボックスを確認
3. 保存ボタンをクリック
4. 再度ストレージを確認

### ケース2: `tools` は存在するが `canvas` が `false`

**症状**: `prompt.tools` は存在するが、`prompt.tools.canvas` が `false`

**原因**: チェックボックスが保存時に正しく読み取れていない

**解決策**:
1. オプションページでプロンプトを再編集
2. 「Canvas」のチェックボックスを一度外して、再度チェック
3. 保存ボタンをクリック

### ケース3: ログに `[Geminizer] No tools requested in this prompt` が表示される

**症状**: プロンプト実行時にツール情報が渡されない

**原因**: 
- `prompt.tools` が `null` または `undefined`
- または、`tools` オブジェクトのすべてのプロパティが `false`

**解決策**:
1. ステップ1-4を実行して、どこで情報が失われているか確認
2. `background.js` の192行目で `tools` の値を確認
3. `ai_injector.js` の19-23行目で `request.tools` の値を確認

---

## 確認チェックリスト

- [ ] オプションページで「Canvas」にチェックが入っている
- [ ] 「保存されました」メッセージが表示された
- [ ] ストレージに `tools` プロパティが保存されている
- [ ] `tools.canvas` が `true` になっている
- [ ] プロンプト実行時に `[Geminizer Background] Prompt tools configuration:` ログが表示される
- [ ] プロンプト実行時に `[Geminizer] Tools requested:` ログが表示される
- [ ] `[Geminizer] No tools requested in this prompt` が表示されない

---

## 次のステップ

上記の確認を行い、どのステップで問題が発生しているかを特定してください。結果を共有していただければ、より具体的な解決策を提案できます。


