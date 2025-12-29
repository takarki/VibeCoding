# バージョン管理ガイドライン

Geminizerプロジェクトのバージョン管理に関するガイドラインです。

## バージョニング方式

[セマンティックバージョニング 2.0.0](https://semver.org/spec/v2.0.0.html)に従います。

### バージョン番号の形式

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: 互換性を壊す大きな変更
  - API変更
  - 構成の大幅な変更
  - ユーザーに影響を与える破壊的変更

- **MINOR**: 後方互換性のある新機能追加
  - 新しいプロンプトテンプレート追加
  - 新しいUI機能追加
  - 既存機能の拡張

- **PATCH**: 後方互換性のあるバグ修正
  - バグ修正
  - パフォーマンス改善
  - ドキュメント修正

## バージョン更新の手順

### 1. 変更内容の確認

変更内容を確認し、適切なバージョン番号を決定します。

```bash
# 現在のバージョンを確認
cat manifest.json | grep version
```

### 2. manifest.jsonの更新

`manifest.json`のバージョン番号を更新します。

```json
{
  "version": "X.Y.Z"
}
```

### 3. CHANGELOG.mdの更新

`CHANGELOG.md`に変更内容を記録します。

#### フォーマット

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added（新機能）
- 追加された機能の説明

### Changed（変更）
- 変更された機能の説明

### Fixed（バグ修正）
- 修正されたバグの説明

### Removed（削除）
- 削除された機能の説明

### Deprecated（非推奨化）
- 非推奨となった機能の説明

### Security（セキュリティ）
- セキュリティに関する修正
```

#### 記載例

```markdown
## [0.9.33] - 2025-12-23

### Fixed
- **Gemini 3モデル切り替え機能の修正**
  - Gemini 3の新UI（2025年11月リリース）に対応
  - test-idマッピングを更新
  - ボタン検出ロジックを改善
```

### 4. コミットメッセージ

バージョン更新のコミットメッセージは以下の形式を使用します。

```bash
git add manifest.json CHANGELOG.md
git commit -m "chore: bump version to X.Y.Z

- 変更内容の要約1
- 変更内容の要約2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 5. タグの作成（オプション）

重要なリリースにはGitタグを作成します。

```bash
git tag -a vX.Y.Z -m "Version X.Y.Z"
git push origin vX.Y.Z
```

## バージョン更新のチェックリスト

変更を加えた際は、必ず以下を確認してください：

- [ ] `manifest.json`のバージョン番号を更新
- [ ] `CHANGELOG.md`に変更内容を記録
- [ ] 変更内容が適切なカテゴリに分類されている
- [ ] 日付が正しい（YYYY-MM-DD形式）
- [ ] セマンティックバージョニングに従っている
- [ ] コミットメッセージが適切

## 現在のバージョン履歴

| バージョン | 日付 | 種類 | 主な変更 |
|-----------|------|------|----------|
| 0.9.33 | 2025-12-23 | PATCH | Gemini 3モデル切り替え機能の修正 |
| 0.9.32 | 2024-12-22以前 | PATCH | 各種バグ修正 |
| 1.0.0 | 2024-12-21 | MAJOR | リファクタリングと新機能追加 |
| 0.9.0 | 2024-12-20 | MINOR | Gemini UI改善機能を追加 |
| 0.8.0 | 2024-12-03 | MINOR | ショートカットキー機能追加 |

## バージョン管理のベストプラクティス

### 1. 変更のたびに更新

コードに変更を加えたら、必ずバージョンを更新します。

### 2. 詳細な説明

CHANGELOG.mdには、ユーザーが理解できる詳細な説明を記載します。

### 3. 一貫性

バージョン番号の付け方を一貫させます。

### 4. リリース前の確認

リリース前に、すべての変更がCHANGELOGに記録されているか確認します。

## トラブルシューティング

### バージョン番号を間違えた場合

1. manifest.jsonとCHANGELOG.mdを修正
2. 修正コミットを作成
3. 必要に応じてタグを削除・再作成

```bash
# ローカルタグの削除
git tag -d vX.Y.Z

# リモートタグの削除
git push origin :refs/tags/vX.Y.Z
```

## 参考資料

- [セマンティックバージョニング 2.0.0](https://semver.org/spec/v2.0.0.html)
- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 更新履歴

| 日付 | 変更内容 |
|------|----------|
| 2025-12-23 | バージョン管理ガイドラインを初版作成 |
