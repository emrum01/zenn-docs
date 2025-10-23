---
title: "チケットから始めるミニマル設計ドキュメント生成 — ticket-impact-estimation の使い方と思想"
emoji: "🧩"
type: "tech"
topics: ["ai", "frontend", "documentation", "prompt-engineering"]
published: false
publication_name: "ai-catchup"
---

# 背景：仕様書駆動開発の限界を超えるために

フロントエンドの軽微な改修でも、AI仕様書生成を使うと以下のような課題が生じます。

- **FEの小さな修正でもスキーマや型情報まで出力される**
- **簡単な修正なのに数千行の設計書が生成される**
- **複数ファイルに分割され、どれを参照すれば良いか直感的にわからない**
- **ボリュームが大きく、結局すべて読まれない**

結果として「読まれない設計書」が量産され、**実装フローと設計ドキュメントのリズムが乖離**します。

この問題に対して、`ticket-impact-estimation` は **「チケット単位の最小限ドキュメント生成」** を提案します。  
つまり「完璧な仕様」ではなく「修正の意図と影響」を明確にするためのAIプロンプトです。

---

# リポジトリ概要：`emrum01/ticket-impact-estimation`

### 📘 プロジェクトの目的
- チケットを入力に、AIが「影響範囲・設計意図・変更理由」を簡潔に出力する
- 「受け入れ条件」から最小限の実装情報を切り出す  
- 仕様書駆動開発を**チケット駆動開発に適応させる実験的リポジトリ**

### 🗂️ 構成要素と意図

| ファイル / ディレクトリ | 役割 | 解説 |
|--------------------------|------|------|
| `prompt/impact_estimation_prompt.md` | メインプロンプト | 受け入れ条件を解析し、設計影響・変更対象を出力 |
| `context_prompt.md` | チケットの履歴や関連情報を補足 |
| `format_prompt.md` | 出力形式をMarkdownで統一 |
| `examples/` | 実際の入力（チケット）と出力例 |
| `scripts/` | スラッシュコマンドやCI用スクリプト |
| `README.md` | フローや使用手順の概要 |

---

# 使い方：スラッシュコマンドによる実行例

以下のようにシンプルなコマンドで呼び出します。

```bash
/impact "ユーザー情報編集画面の保存ボタンが効かないバグ修正"
```

AIが以下のようなドキュメントを生成します。

```markdown
### 影響範囲
- `UserEditForm.tsx`: onSubmit のバインド処理
- `api/user/update.ts`: エンドポイントの呼び出し確認

### 変更意図
- バインド忘れによるイベント未発火
- 型不一致によるAPI層のバリデーション失敗
```

この出力を **チケットやPRに添付** することで、
実装レビュー前に「意図と影響範囲」を簡潔に共有できます。

---

# プロンプト設計の解説 — ファイルを分けている理由

大きなプロンプト1つに全てを書くのではなく、**目的ごとに分割**しています。

| ファイル | 内容 | 分割意図 |
|----------|------|----------|
| `impact_estimation_prompt.md` | 受け入れ条件→影響推定のロジック | コアロジックを独立 |
| `context_prompt.md` | チケットの履歴・関連PR情報 | 汎用化・再利用性 |
| `format_prompt.md` | 出力テンプレート | Markdown構造の一貫性 |
| `examples/*.md` | 入出力サンプル | 回帰テスト・学習補助 |
| `scripts/` | 実行スクリプト | 実装環境依存の分離 |

---

# メインプロンプト例（再現テンプレート）

~~~~markdown
```markdown
あなたはフロントエンドエンジニア向けの“チケット→ミニ設計”作成アシスタントです。
以下のルールを厳守して、入力（Issue本文）から **実装に必要な最小限の情報** を抽出して出力してください。

## 出力フォーマット
### 概要
- 1行で「何をするか」を簡潔に書く

### 受け入れ条件
- チケット内の主要な受け入れ条件を抜粋（最大3件）

### 影響範囲
- 該当コンポーネントやファイル名を列挙し、理由を一言添える

### 実装手順
- 3ステップ以内の実装要約（必要に応じて簡単なコード例）

### テスト観点
- 確認すべき観点を短文で記述

### リスクと注意点
- 既存仕様や型変更リスクがあれば簡潔に

### 見積り
- S / M / L で相対評価
```
~~~~

---

# 出力テンプレート（生成結果の例）

```markdown
### 概要
- 保存ボタン押下時のユーザー情報更新処理の修正

### 受け入れ条件
- 保存時にAPIが正しく呼び出されること
- 入力必須項目でエラーが表示されること

### 影響範囲
- `src/components/UserEditForm.tsx` — onSubmit 内のイベント制御
- `src/api/user.ts` — updateUser 呼び出し時のバリデーション

### 実装手順
1. onSubmit で preventDefault 処理を追加  
2. API 呼び出しを async/await に統一  
3. エラー時に Snackbar を表示

### テスト観点
- 保存ボタンの多重クリックが防止される
- バリデーションエラーが即座に表示される

### リスクと注意点
- API レスポンススキーマ変更の影響に注意

### 見積り
- S（1〜2時間）
```

---

# スラッシュコマンド・自動化例

### ローカルスクリプト

```bash
#!/usr/bin/env bash
ISSUE_BODY="$(cat -)"
API_KEY="YOUR_API_KEY"
PROMPT_FILE="prompt/impact_estimation_prompt.md"

payload=$(jq -n --arg body "$ISSUE_BODY" --arg prompt "$(cat $PROMPT_FILE)" '{body:$body, prompt:$prompt}')
curl -s -X POST "https://api.your-ai-provider/v1/generate" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$payload"
```

### GitHub Actions での自動生成

```yaml
name: generate-impact-doc
on:
  pull_request:
    types: [opened, edited]
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate ticket impact doc
        run: |
          ISSUE_BODY="$(gh pr view ${{ github.event.pull_request.number }} --json body -q .body)"
          echo "$ISSUE_BODY" | ./scripts/generate_impact_doc.sh > out.md
      - name: Comment on PR
        uses: peter-evans/create-or-update-comment@v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          issue-number: ${{ github.event.pull_request.number }}
          body-file: out.md
```

---

# 設計の便利ポイント

1. **一貫したフォーマット**  
   - 全員が同じテンプレートで設計意図を共有できる  
2. **開発リズムとの整合**  
   - チケット・PR単位での軽量なドキュメント化  
3. **レビュー負担の軽減**  
   - ドキュメントが「読める長さ」に抑えられる  
4. **拡張性**  
   - フォーマット・文脈・ロジックが独立しているため、組み合わせて再利用可能  

---

# まとめ

- 大規模な仕様書ではなく、**「チケット単位の小さな設計書」** をAIで生成  
- `ticket-impact-estimation` は、仕様書駆動開発を**現場の速度に合わせる**実践的アプローチ  
- これにより、**読まれるドキュメント**・**更新されるドキュメント**を実現する
