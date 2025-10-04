# Zenn Contents

Zennの記事を管理するためのローカルリポジトリです。

## セットアップ

```bash
npm install
```

## 使い方

### 記事の作成

```bash
# 対話形式で記事を作成
npm run create

# CLIで直接作成
npm run new

# スラッグを指定して作成
npm run new:with-slug article-name

```

### プレビュー

```bash
# http://localhost:8000 でプレビュー
npm run preview
```

### 記事の確認

```bash
# 記事一覧を表示
npm run list

# 記事の構文チェック
npm run lint
```

## ディレクトリ構造

- `articles/` - 記事ファイル
- `books/` - 本のコンテンツ
- `images/` - 画像ファイル
- `scripts/` - 自動化スクリプト

## 記事のフロントマター

```yaml
---
title: "記事のタイトル"
emoji: "🎯"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["tag1", "tag2", "tag3"]
published: false # true で公開
published_at: "2024-01-01 09:00" # 予約公開
---
```

## トピックの規則

- 最大5つまで
- 小文字英数字とハイフンのみ
- 既存のトピックから選ぶことを推奨

## 参考リンク

- [Zenn CLIガイド](https://zenn.dev/zenn/articles/zenn-cli-guide)
- [Zenn マークダウン記法](https://zenn.dev/zenn/articles/markdown-guide)