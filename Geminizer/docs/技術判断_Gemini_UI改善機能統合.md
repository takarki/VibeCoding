# 技術判断: Gemini UI改善機能統合について

## 1. コンテンツスクリプトの登録方法

### 方法A: manifest.jsonの`content_scripts`に登録（推奨）

#### 実装方法
```json
"content_scripts": [
  {
    "matches": ["https://www.youtube.com/*"],
    "js": ["youtube_button_injector.js"],
    "run_at": "document_idle"
  },
  {
    "matches": ["https://gemini.google.com/*"],
    "js": ["gemini_enhancer.js"],
    "run_at": "document_idle"
  }
]
```

#### メリット
✅ **確実な実行**: Geminiページがロードされるたびに自動実行される  
✅ **ユーザーが手動でGeminiを開いた場合にも機能**: Geminizer経由でなくても機能が有効  
✅ **ページリロード後も機能が継続**: ページをリロードしても再実行される  
✅ **実装がシンプル**: 特別な注入ロジックが不要  
✅ **パフォーマンス**: ページロード時に自動実行されるため、追加のオーバーヘッドが少ない

#### デメリット
⚠️ **常に実行される**: ユーザーが機能をOFFにしていてもスクリプトは読み込まれる（ただし、設定チェックで機能をOFFにできる）  
⚠️ **既存のai_injector.jsとの関係**: `ai_injector.js`は動的注入だが、`gemini_enhancer.js`は自動実行されるため、両方が同時に動作する（互いに干渉しない設計が必要）

#### 現在のGeminizerでの実装例
`youtube_button_injector.js`はこの方法で実装されており、確実に動作している実績がある。

---

### 方法B: 動的注入（chrome.scripting.executeScript）

#### 実装方法
```javascript
// background.js または popup.js から
chrome.scripting.executeScript({
  target: { tabId: tabId },
  files: ['gemini_enhancer.js']
});
```

#### メリット
✅ **必要な時だけ実行**: ユーザーが機能をONにしている時だけ注入される  
✅ **柔軟性**: 特定の条件を満たした時だけ実行できる

#### デメリット
❌ **ユーザーが手動でGeminiを開いた場合に機能しない**: Geminizer経由で開いた場合のみ動作  
❌ **ページリロード後は機能が失われる**: リロードのたびに再注入が必要  
❌ **実装が複雑**: タイミングの管理が必要（ページが完全にロードされるまで待つ必要がある）  
❌ **現在のai_injector.jsと競合する可能性**: 同じ動的注入メカニズムを使用しているため、タイミング管理が複雑になる

---

## 推奨: 方法A（manifest.jsonのcontent_scripts）

### 理由
1. **Enhancer4Googleの設計思想と一致**: Enhancer4Googleも`content_scripts`で実装されており、常時動作することを前提としている
2. **ユーザー体験**: ユーザーが直接Geminiを開いても機能が有効になる（Geminizer経由でなくても）
3. **既存コードとの整合性**: `youtube_button_injector.js`と同じパターンで実装でき、コードベースが統一される
4. **機能の性質**: UI改善機能は「常に動作する」ことが期待される機能

### 注意点
- `gemini_enhancer.js`内で設定をチェックし、OFFの場合は機能を実行しないようにする
- `ai_injector.js`との競合を避けるため、DOM操作のタイミングを適切に管理する

---

## 2. 設定の保存形式

### 方法A: 既存の`prompts`データと分離（推奨）

#### 実装方法
```javascript
// chrome.storage.sync に保存
{
  "prompts": [...],  // 既存のプロンプトデータ
  "geminiUIEnhancements": {
    "enterKeyEnabled": true,
    "toolShortcutsEnabled": true,
    "layoutWidthEnabled": false,
    "layoutWidthValue": 1200,
    "submitKeyModifier": "shift"  // "shift" or "ctrl"
  }
}
```

#### メリット
✅ **データの分離**: プロンプト設定とUI設定が明確に分離される  
✅ **既存コードへの影響が少ない**: `prompts`データ構造を変更する必要がない  
✅ **拡張性**: 将来的に他のサービス（NotebookLM等）の設定を追加しやすい  
✅ **デフォルト値の管理が容易**: 新規ユーザーと既存ユーザーへの初期値設定が簡単

#### デメリット
⚠️ **ストレージキーが増える**: 管理するキーが1つ増える（影響は軽微）

---

### 方法B: 既存の`prompts`データに統合

#### 実装方法
```javascript
{
  "prompts": [...],
  "settings": {
    "geminiUIEnhancements": {...}
  }
}
```

#### メリット
✅ **設定を1箇所にまとめられる**: すべての設定が`settings`配下に

#### デメリット
❌ **既存のデータ構造との整合性**: 現在`settings`というキーが存在するか不明（確認が必要）  
❌ **既存コードへの影響**: 設定読み込み処理を変更する必要がある可能性

---

## 推奨: 方法A（分離したキー）

### 理由
1. **既存コードへの影響が最小限**: `prompts`配列の構造を変更する必要がない
2. **明確な責務分離**: UI改善設定とプロンプト設定は異なる性質のデータ
3. **Enhancer4Googleとの互換性**: Enhancer4Googleも各機能ごとに設定キーを分けている

---

## 3. ai_injector.jsとの統合方法

### 現在の状況
- `ai_injector.js`: 動的注入、プロンプト注入時に実行
- `gemini_enhancer.js`: 常時実行（content_scriptsとして）

### 競合の可能性と対策

#### 潜在的な競合点
1. **DOM操作のタイミング**: 両方が同じDOM要素（入力欄、送信ボタン）を操作する可能性
2. **Enterキーイベント**: `gemini_enhancer.js`がEnterキーを処理する際、`ai_injector.js`の自動送信と競合する可能性

#### 対策

**1. 機能の分離**
- `ai_injector.js`: プロンプト注入専用（一時的な操作）
- `gemini_enhancer.js`: UI改善専用（常時動作）

**2. イベントハンドリングの優先順位**
```javascript
// gemini_enhancer.js内
function handleKeyDown(event) {
  // ai_injector.jsがプロンプト注入中かチェック
  // 注入中は機能を一時的に無効化する
  if (document.querySelector('[data-geminizer-injecting="true"]')) {
    return; // ai_injector.jsの処理を優先
  }
  
  // 通常のEnterキー処理
  // ...
}
```

**3. データ属性による通信**
```javascript
// ai_injector.js側
document.body.setAttribute('data-geminizer-injecting', 'true');
// 注入完了後
document.body.removeAttribute('data-geminizer-injecting');
```

---

## 4. 実装の優先順位

### Phase 1: 基本実装
1. `gemini_enhancer.js`ファイルを作成
2. `manifest.json`に`content_scripts`を追加
3. Enterキー動作変更機能を実装
4. オプションページに設定UIを追加

### Phase 2: 拡張機能
1. ツールショートカット（DeepResearch/Canvas）を追加
2. コンテンツ幅カスタマイズ機能を追加

### Phase 3: 最適化
1. `ai_injector.js`との競合対策
2. パフォーマンス最適化
3. エラーハンドリングの強化

---

## 5. デフォルト値について

### 既存ユーザーへの影響
- デフォルトでONにする場合、既存ユーザーは次回のアップデート後に自動的に機能が有効になる
- `chrome.storage.sync`に設定が存在しない場合、デフォルト値（true）を使用

### 実装方法
```javascript
// gemini_enhancer.js
function loadSettings() {
  chrome.storage.sync.get({
    geminiEnterKey: true,  // デフォルト: ON
    geminiToolShortcuts: true,  // デフォルト: ON
    geminiLayoutWidthEnabled: false,  // デフォルト: OFF
    geminiLayoutWidthValue: 1200,
    submitKeyModifier: 'shift'
  }, (items) => {
    settings = items;
    // 機能を適用
  });
}
```

---

## まとめ

### 推奨する実装方針

1. **コンテンツスクリプト**: `manifest.json`の`content_scripts`に登録（方法A）
2. **設定保存**: 独立したキー`geminiUIEnhancements`で保存（方法A）
3. **ファイル構成**: 別ファイル`gemini_enhancer.js`を作成
4. **既存コードとの統合**: データ属性による通信で競合を回避

### 次のステップ
この方針で実装を進めてよろしいでしょうか？


