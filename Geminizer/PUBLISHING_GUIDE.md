# Chrome Web Store 公開手順書

## 📋 公開前チェックリスト

### ✅ 必須項目

- [ ] **開発者アカウント登録**
  - Chrome Web Store Developer Dashboardにアクセス
  - $5の登録料を支払い
  - 開発者情報を入力

- [ ] **プライバシーポリシー公開**
  - `PRIVACY_POLICY.md`をWebページとして公開
  - GitHub Pagesまたは独自ドメインを使用
  - URLを記録

- [ ] **ストア用画像作成**
  - [ ] プロモーション用タイル (440x280px)
  - [ ] スクリーンショット 5枚 (1280x800px)
  - [ ] 任意: マーキー画像 (1400x560px)

- [ ] **manifest.json最終確認**
  - [ ] バージョン番号が正しい
  - [ ] 説明文が適切
  - [ ] 権限が最小限
  - [ ] アイコンが正しく設定されている

- [ ] **全機能のテスト**
  - [ ] YouTube要約ボタン
  - [ ] ショートカットキー
  - [ ] カスタムプロンプト
  - [ ] 各モード（URL/Text/Capture）
  - [ ] エラーハンドリング

- [ ] **ドキュメント整備**
  - [ ] README.md
  - [ ] CHANGELOG.md
  - [ ] PRIVACY_POLICY.md
  - [ ] STORE_LISTING.md

### 📦 推奨項目

- [ ] GitHubリポジトリ作成・公開
- [ ] サポートページ作成
- [ ] 使い方動画作成（YouTube）
- [ ] FAQページ作成
- [ ] ユーザーガイド作成

---

## 🚀 公開手順

### ステップ1: 開発者アカウント登録

1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)にアクセス

2. Googleアカウントでログイン

3. 「登録料を支払う」をクリック
   - 金額: $5（一度限り）
   - 支払い方法: クレジットカード

4. 開発者情報を入力:
   - 開発者名
   - メールアドレス
   - ウェブサイト（任意）

### ステップ2: プライバシーポリシーの公開

#### オプションA: GitHub Pagesを使用（推奨）

1. GitHubリポジトリを作成
```bash
cd /path/to/Geminizer
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/[username]/geminizer.git
git push -u origin main
```

2. GitHub Pagesを有効化
   - リポジトリの Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / docs
   - `PRIVACY_POLICY.md`を`docs/privacy.md`にコピー

3. URLを取得
   - 例: `https://[username].github.io/geminizer/privacy.html`

#### オプションB: 独自ドメインを使用

1. Webサーバーに`PRIVACY_POLICY.md`をアップロード
2. HTMLに変換（Pandocなど使用）
3. URLを取得

### ステップ3: ストア用画像の作成

#### 必要な画像

1. **プロモーション用タイル** (440x280px) - 必須
   - 拡張機能の主要機能を示すビジュアル
   - テキストは最小限に
   - ブランドカラーを使用

2. **スクリーンショット** (1280x800px) - 最低1枚、推奨5枚
   - スクリーンショット1: YouTube要約ボタンの使用例
   - スクリーンショット2: ポップアップUIの表示
   - スクリーンショット3: カスタムプロンプト設定画面
   - スクリーンショット4: ショートカットキー設定画面
   - スクリーンショット5: Geminiでの要約結果例

3. **マーキー画像** (1400x560px) - 任意
   - ストアの注目セクションに表示される

#### 画像作成ツール

- **Figma**: https://www.figma.com/
- **Canva**: https://www.canva.com/
- **Adobe Photoshop**
- **GIMP** (無料)

#### デザインのヒント

- シンプルで分かりやすいデザイン
- ブランドカラー（青・紫系）を使用
- 実際のUIスクリーンショットを含める
- テキストは読みやすく、最小限に

### ステップ4: ZIPファイルの作成

1. 不要なファイルを除外
```bash
cd /path/to/Geminizer

# 除外するファイル
# - .git/
# - .DS_Store
# - node_modules/
# - *.md (README, CHANGELOG等)
# - development_guidelines.md
# - requirements*.md
# - Require.md
# - architecture.md
```

2. ZIPファイルを作成
```bash
# macOS/Linux
zip -r geminizer-0.8.0.zip . -x "*.git*" -x "*.DS_Store" -x "*.md" -x "Gemini_parts/*"

# Windows
# 右クリック → 送る → 圧縮(zip形式)フォルダー
# または7-Zipを使用
```

3. ファイルサイズを確認
   - 最大サイズ: 128MB
   - 推奨: 10MB以下

### ステップ5: Chrome Web Storeにアップロード

1. [Developer Dashboard](https://chrome.google.com/webstore/devconsole/)にアクセス

2. 「新しいアイテム」をクリック

3. ZIPファイルをアップロード
   - ドラッグ&ドロップまたは「ファイルを選択」

4. 基本情報を入力

#### ストアの掲載情報

**言語**: 日本語

**拡張機能名**:
```
Geminizer - YouTube & Web Page Summarizer with Gemini
```

**短い説明** (132文字以内):
```
YouTube動画やWebページをGeminiで要約。カスタムプロンプト対応。ショートカットキーで素早く実行。
```

**詳細な説明**:
```
Geminizerは、YouTube動画やWebページを簡単に要約できるChrome拡張機能です。

【主な機能】

✨ YouTube動画の要約
• 動画ページに表示される「要約」ボタンをクリックするだけ
• ショートカットキー（Ctrl+Shift+U / Command+Shift+U）で素早く実行
• タイムスタンプ付きの詳細な要約を生成

📝 Webページの要約
• URLとタイトルのみ、またはページ全体のコンテンツを抽出
• 3つのモード: URL、Text、Capture（スクリーンショット）

🎯 カスタムプロンプト
• 自分専用のプロンプトを作成・保存
• デフォルトで8種類の便利なプロンプトを用意

⌨️ ショートカットキー
• 各プロンプトにカスタムショートカットを設定可能
• 競合検出機能で安心

🚀 高速・シンプル
• Geminiに直接プロンプトを送信
• バックグラウンドで動作し、元のタブに戻る

【使い方】
1. YouTube動画またはWebページを開く
2. 拡張機能アイコンをクリック、またはショートカットキーを押す
3. プロンプトを選択して実行
4. Geminiで要約が自動的に開始されます

【注意事項】
• Geminiアカウントが必要です（無料版でも使用可能）
• 一部の機能はGemini Advancedで最適化されています
```

**カテゴリ**:
- 主カテゴリ: 生産性向上（Productivity）

**プライバシーの実施**:
- 「単一目的」を選択
- 目的: 「Webページの要約とGeminiへのプロンプト送信」

**権限の正当性**:
```
• activeTab: 現在のページのURL・タイトルを取得するため
• storage: ユーザーのカスタムプロンプトと設定を保存するため
• scripting: Webページからテキストコンテンツを抽出するため
• notifications: 成功・エラーメッセージを表示するため
```

**ホスト権限の正当性**:
```
• https://gemini.google.com/*: Geminiを開いてプロンプトを挿入するため
• https://www.youtube.com/*: YouTube動画に要約ボタンを追加するため
```

**プライバシーポリシーURL**:
```
https://[username].github.io/geminizer/privacy.html
```

5. 画像をアップロード
   - プロモーション用タイル (440x280px)
   - スクリーンショット 1-5枚 (1280x800px)
   - マーキー画像 (1400x560px) - 任意

6. 配信設定
   - **公開設定**: 公開（または非公開でテスト）
   - **地域**: すべての地域（または日本のみ）
   - **言語**: 日本語

7. 価格設定
   - **無料**を選択
   - （将来的に有料化する場合は設定変更可能）

8. 「審査のため送信」をクリック

### ステップ6: 審査待ち

- **審査期間**: 通常1-3営業日
- **審査中の確認**: Developer Dashboardで状態を確認
- **通知**: 審査結果はメールで通知

#### 審査で確認される項目

1. **コンテンツポリシー遵守**
   - 不正な広告なし
   - マルウェアなし
   - ユーザーの同意なしにデータ収集しない

2. **権限の正当性**
   - 各権限の使用目的が明確
   - 最小限の権限のみ要求

3. **プライバシーポリシー**
   - 明確で理解しやすい
   - データの収集・使用方法を説明

4. **ユーザー体験**
   - 直感的なUI
   - エラーハンドリング
   - ヘルプドキュメント

### ステップ7: 公開！

審査が承認されたら:
1. Developer Dashboardで「公開」をクリック
2. 数時間以内にChrome Web Storeに表示されます
3. URLを共有: `https://chrome.google.com/webstore/detail/[extension-id]`

---

## 📊 公開後の管理

### 統計情報の確認

Developer Dashboardで以下を確認できます:
- インストール数
- アクティブユーザー数
- 評価・レビュー
- クラッシュレポート

### アップデート方法

1. コードを修正
2. `manifest.json`のバージョンを更新
3. `CHANGELOG.md`を更新
4. 新しいZIPファイルを作成
5. Developer Dashboardで「パッケージをアップロード」
6. 審査待ち（通常1日以内）
7. 自動更新（ユーザーのブラウザに自動配信）

### レビュー対応

- 定期的にレビューを確認
- 問題報告には迅速に対応
- ポジティブなレビューには感謝のコメント

### バージョン管理

- セマンティックバージョニング（MAJOR.MINOR.PATCH）を使用
- バグ修正: PATCH（0.8.0 → 0.8.1）
- 新機能: MINOR（0.8.0 → 0.9.0）
- 破壊的変更: MAJOR（0.8.0 → 1.0.0）

---

## 💰 収益化（将来的な検討）

### 収益化オプション

1. **有料拡張機能**
   - 価格: $0.99 〜 $1,000
   - 買い切り型

2. **アプリ内課金**
   - プレミアム機能の追加
   - 追加プロンプトパック
   - 高度な設定

3. **サブスクリプション**
   - 月額: $0.99 - $1.99
   - 年額: $9.99 - $19.99
   - 継続的な収益

### 推奨価格設定

**無料版（現在）**:
- 基本機能をすべて提供
- 広告なし
- ユーザーベースを構築

**プレミアム版（将来）**:
- 買い切り: $2.99 - $4.99
- 月額: $0.99
- 年額: $9.99

**プレミアム機能案**:
- 無制限のカスタムプロンプト
- プロンプトのインポート/エクスポート
- 高度な設定オプション
- 優先サポート

---

## 🔧 トラブルシューティング

### 審査が却下された場合

1. **却下理由を確認**
   - メールまたはDashboardで理由を確認

2. **よくある却下理由**:
   - プライバシーポリシーが不明確
   - 権限の正当性が説明不足
   - スクリーンショットが不適切
   - コンテンツポリシー違反

3. **修正して再提出**
   - 問題を修正
   - 「再審査を依頼」をクリック

### アップロードエラー

- **ファイルサイズが大きすぎる**: 不要なファイルを削除
- **manifest.jsonエラー**: 構文を確認
- **権限エラー**: 不要な権限を削除

---

## 📚 参考資料

### 公式ドキュメント
- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)

### コミュニティ
- [Stack Overflow - Chrome Extensions](https://stackoverflow.com/questions/tagged/google-chrome-extension)
- [Reddit - r/chrome_extensions](https://www.reddit.com/r/chrome_extensions/)
- [Chrome Extensions Google Group](https://groups.google.com/a/chromium.org/g/chromium-extensions)

---

## ✅ 最終チェックリスト

公開前に以下をすべて確認してください:

- [ ] 開発者アカウント登録完了
- [ ] プライバシーポリシー公開済み
- [ ] ストア用画像作成完了
- [ ] manifest.json最終確認完了
- [ ] 全機能のテスト完了
- [ ] ZIPファイル作成完了
- [ ] ストア掲載情報準備完了
- [ ] サポート体制構築完了

すべて完了したら、「審査のため送信」をクリック！

**Good luck! 🚀**












