// Default Prompts for Geminizer
// This file defines the built-in prompts available in the extension

window.defaultPrompts = [
  {
    title: 'YouTube要約 (Summary)',
    targetAi: 'gemini',
    usePageContent: true,
    autoExecute: true,
    defaultMode: 'text',
    modelMode: 'thinking',
    tools: {
      deepResearch: false,
      canvas: false,
      nanobanana: false
    },
    content: `以下のYouTube動画について、日本語で詳しく要約してください。

【動画情報】
URL: {{url}}
タイトル: {{title}}

【文字起こし/説明】
{{content}}

【要約の形式】
1. 概要（3-4行で動画の主旨を説明）
2. キーポイント（5-8個の重要なポイント、各2-3行）
3. タイムスタンプ付きの詳細な要約（重要な部分ごとに）
4. まとめ（実践的な学び）

各セクションは見やすく、##または###で区切ってください。`
  },

  {
    title: 'インフォグラフィック構成案',
    targetAi: 'gemini',
    usePageContent: true,
    autoExecute: false,
    defaultMode: 'text',
    modelMode: 'thinking',
    tools: {
      deepResearch: false,
      canvas: true,
      nanobanana: false
    },
    content: `以下のコンテンツをもとに、視覚的で分かりやすいインフォグラフィックの構成案を作成してください。

URL: {{url}}
タイトル: {{title}}

【コンテンツ】
{{content}}

【作成要件】
- HTML/CSSで実装可能な設計にする
- 色合いは統一感のあるカラーパレットを提案
- レスポンシブデザイン対応
- 日本語対応

【出力形式】
1. 全体のコンセプト説明
2. レイアウト案（テキスト図解）
3. HTML/CSSの基本構造
4. 提案するカラーパレット
5. アニメーション提案（あれば）`
  },

  {
    title: 'NanoBanana Pro 図解作成',
    targetAi: 'gemini',
    usePageContent: true,
    autoExecute: false,
    defaultMode: 'text',
    modelMode: 'thinking',
    tools: {
      deepResearch: false,
      canvas: false,
      nanobanana: true
    },
    content: `以下のコンテンツについて、複雑な概念を視覚的に理解できるような図解を作成してください。

URL: {{url}}
タイトル: {{title}}

【コンテンツ】
{{content}}

【図解の要件】
- 階層構造を明確に表現
- 重要な概念は色分け
- 矢印や繋がりを明示
- 日本語ラベル付き

NanoBanana Proを使用して、高品質な図解を生成してください。`
  },

  {
    title: 'ポッドキャスト台本',
    targetAi: 'gemini',
    usePageContent: true,
    autoExecute: false,
    defaultMode: 'text',
    modelMode: 'thinking',
    tools: {
      deepResearch: false,
      canvas: true,
      nanobanana: false
    },
    content: `以下のコンテンツをもとに、2人の会話形式のポッドキャスト台本を作成してください。

URL: {{url}}
タイトル: {{title}}

【コンテンツ】
{{content}}

【台本の要件】
- 自然な会話体
- パーソナリティA、パーソナリティBが交互に話す
- 時間：15-20分程度を想定
- わかりやすい説明を心がける
- 最後に学んだポイントをまとめる

【出力形式】
時間 | パーソナリティ | セリフ
の表形式で、Canvasで見やすく表現してください。`
  },

  {
    title: 'ファクトチェック (Fact Check)',
    targetAi: 'gemini',
    usePageContent: true,
    autoExecute: false,
    defaultMode: 'text',
    modelMode: 'thinking',
    tools: {
      deepResearch: true,
      canvas: false,
      nanobanana: false
    },
    content: `以下のコンテンツに含まれる主張や事実について、ファクトチェックを実施してください。

URL: {{url}}
タイトル: {{title}}

【コンテンツ】
{{content}}

【チェック項目】
1. 重要な主張の抽出（5-10個）
2. 各主張の事実性チェック
3. データや統計の正確性確認
4. 出典の信頼性評価
5. 誤解や不正確な表現の指摘

Deep Researchを活用して、最新の信頼できる情報源から検証してください。`
  },

  {
    title: '文系新卒1年目向け詳細解説',
    targetAi: 'gemini',
    usePageContent: true,
    autoExecute: false,
    defaultMode: 'text',
    modelMode: 'thinking',
    tools: {
      deepResearch: false,
      canvas: false,
      nanobanana: false
    },
    content: `以下のコンテンツについて、文系出身で社会人1年目の人にもわかりやすく、かつ深く理解できるように解説してください。

URL: {{url}}
タイトル: {{title}}

【コンテンツ】
{{content}}

【解説の要件】
- 専門用語は最小限、使う場合は必ず説明
- 日常例や身近な例を多用
- 実務への活かし方を明示
- 初心者の疑問を予測して先に説明
- 段階的に複雑さを増していく

【出力形式】
1. 概要（新卒向けに簡潔に）
2. 基本概念の説明
3. 実務での活用シーン
4. 具体例
5. よくある質問への回答
6. 次に学ぶべきこと`
  },

  {
    title: '🔍 DeepResearch業界分析',
    targetAi: 'gemini',
    usePageContent: true,
    autoExecute: false,
    defaultMode: 'text',
    modelMode: 'thinking',
    tools: {
      deepResearch: true,
      canvas: false,
      nanobanana: false
    },
    content: `以下のテーマについて、Deep Researchを活用して包括的な業界分析を実施してください。

URL: {{url}}
テーマ: {{title}}

【分析対象】
{{content}}

【分析項目】
1. 市場規模と成長率
2. 主要企業とプレイヤー
3. 業界トレンド
4. 課題と機会
5. 将来展望
6. 投資機会の評価

Deep Researchで最新データを収集し、根拠のある分析をしてください。`
  },

  {
    title: '📝 詳細記事作成',
    targetAi: 'gemini',
    usePageContent: true,
    autoExecute: false,
    defaultMode: 'text',
    modelMode: 'thinking',
    tools: {
      deepResearch: false,
      canvas: false,
      nanobanana: false
    },
    content: `以下のコンテンツをもとに、詳細で構造化された記事を作成してください。

URL: {{url}}
タイトル: {{title}}

【ソースコンテンツ】
{{content}}

【記事の要件】
- 見出しは階層構造で整理
- 各セクションは500-800文字程度
- メイン画像、サブ画像の配置を提案
- 内部リンク候補を提示
- SEO対応のメタディスクリプション
- 読了時間を計算

【出力形式】
- タイトル
- メタディスクリプション
- 目次
- 詳細本文（見出し付き）
- 関連リンク提案
- 参考資料`
  },

  {
    title: '🎬 動画制作プラン (Veo3.1)',
    targetAi: 'gemini',
    usePageContent: true,
    autoExecute: false,
    defaultMode: 'text',
    modelMode: 'thinking',
    tools: {
      deepResearch: false,
      canvas: false,
      nanobanana: false
    },
    content: `以下のコンテンツについて、Google Veo 3.1を使用した動画制作の詳細な構成案を作成してください。

URL: {{url}}
タイトル: {{title}}

【コンテンツ】
{{content}}

【動画構成案】
1. シーン構成（シーン番号、時間、説明）
2. 各シーンのビジュアル説明
3. ナレーション/音声設計
4. BGM・SE提案
5. テキストオーバーレイ案
6. トランジション提案
7. 字幕案

【Veo 3.1活用】
- 生成するべきビジュアル要素
- ビデオプロンプト案
- クオリティ目標

詳細で実装可能な構成案をお願いします。`
  },

  {
    title: '📚 ガイド付き学習カリキュラム',
    targetAi: 'gemini',
    usePageContent: true,
    autoExecute: false,
    defaultMode: 'text',
    modelMode: 'thinking',
    tools: {
      deepResearch: false,
      canvas: false,
      nanobanana: false
    },
    content: `以下のテーマについて、インストラクショナルデザインに基づいた段階的な学習カリキュラムを作成してください。

URL: {{url}}
テーマ: {{title}}

【学習内容】
{{content}}

【カリキュラム要件】
- 学習目標（SMART形式）
- 前提知識
- 学習段階（5-8段階）
- 各段階の学習時間
- チェックポイント（確認問題）
- 実践課題
- 参考資料

【学習デザイン】
- スキャフォルディング手法
- 認知的負荷の段階的増加
- 記憶の定着を促す復習計画
- 評価方法`
  }
];
