---
title: "実務で使える汎用プロンプトテンプレートの設計思想と使い方（各セクションはなぜ必要？）"
emoji: "🧩"
type: "tech"
topics: ["prompt-engineering", "ai-agent", "workflow", "template"]
published: true
---

AIを実務で活用しようとすると、「毎回プロンプトを一から書くのが大変」「結果が毎回バラバラになる」といった課題に直面します。  
本記事では **汎用プロンプトテンプレート** を紹介し、**各セクションがなぜ必要なのか**を初心者向けに丁寧に解説します。  
また、各設計判断を裏付けるために、信頼できる外部リファレンスへのリンクも添えています。

---

## 🎯 テンプレート全体（完成形）

以下は、実務向けに設計されたテンプレートの構造です。  
※ この記事内では内側のコードフェンスも含めた構成をそのまま掲載しています。

````markdown
---
allowed-tools: ["Bash(*)", "Read", "Write"]
description: "<アシスタントが実現する具体的な目的と成果物の形式を記述>"
argument-hint: "<ユーザー入力の形式・期待値（例: URL, JSON, Command）>"
---

## あなたの役割

指定されたタスクを安全かつ再現可能な形で実行し、  
最終成果物を指定形式（例: Markdown, JSON, ファイル出力）で提供します。

---

## 実行手順

1. **前提確認**  
   - 必要な情報（URL・認証情報・パスなど）を確認  
   - 不足や曖昧な点はユーザーに質問して補完  

2. **処理フェーズ**  
   - **取得:** 入力データまたはリソースを収集  
   - **変換:** データ整形・検証・解析を実施  
   - **出力:** 結果を指定形式で出力（例: Markdown / JSON）  

3. **反映・報告**  
   - 成果物を保存または連携先に送信（例: GitHub, Notion）  
   - 要約と結果の確認をユーザーに提示  

---

## エラー対処

- 軽微な失敗（API応答遅延など）は1回再試行する。  
- 構文エラーや外部依存エラーは原因を要約し、ユーザーに確認を求める。  
- 失敗時は必ず次の形式で報告：
  ```json
  { "status": "error", "reason": "<原因>", "suggestion": "<修正方針>" }
  ```

---

## 出力ルール

- すべての出力は確定的・再現可能な形で記録する  
- 表記・命名・フォーマットは統一（例: snake_case, kebab-case）  
- 明示的に指定がない限り、Markdown形式で出力  

---

## 開始メッセージ

```
[START] <タスク名>
前提条件を確認し、順に実行します。
```
````

---

## 🧠 各セクションの意図と「なぜ必要か」

### 1. Front Matter（`---` で囲まれた部分）
**何をする場所？**  
テンプレートの「仕様」を定義します。使用可能ツール（`allowed-tools`）、目的（`description`）、入力仕様（`argument-hint`）など、実行時の前提を固定します。

**なぜ必要？**  
- **曖昧性の排除と安全性向上**：どの権限・ツールが使えるかを明示し、想定外の操作を防ぎます。  
- **目的の共有**：`description` により判断基準が定まり、指示のブレを低減します。  
- **入力エラーの抑制**：`argument-hint` で期待する入力形式を示し、ミスを減らします。  
- **再現性の担保**：誰が使っても同じ条件で動かせ、結果の一貫性が上がります。

📚 参考資料:  
- [OpenAI — Prompt Engineering Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)  
- [Arxiv — Reproducibility in Prompt Design (2024)](https://arxiv.org/abs/2411.10541)  

---

### 2. 「あなたの役割」
**何をする場所？**  
AIに求めるスタンス・判断軸・ゴールを明示します。

**なぜ必要？**  
- **意図の共有**：単なる作業実行ではなく、目的に沿った判断が可能になります。  
- **脱線防止**：タスクの範囲と優先度を示すことで拡散を抑制します。  
- **品質の安定**：出力形式（例：Markdown/JSON/ファイル）を先に決めておくとレビューと自動処理が容易。

📚 参考資料:  
- [Anthropic — Role-based Prompt Design](https://www.anthropic.com/research/prompting)  
- [OpenAI — System and Assistant Roles](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api)

---

### 3. 「実行手順」
**何をする場所？**  
作業を段階化し、「何を・どの順で・どうやって」進めるかを示します。

**なぜ必要？**  
- **段階的推論で精度向上**：一気通貫指示より、段階化の方が誤推論を抑制できます。  
- **再利用性**：「取得 → 変換 → 出力」の構造は多くのワークフローに適用可能。  
- **中間チェックポイント**：フェーズごとに確認・補正が可能。

📚 参考資料:  
- [Google DeepMind — Chain-of-Thought Reasoning](https://arxiv.org/abs/2201.11903)  
- [Prompt Engineering Guide — Step-by-step Design](https://www.promptingguide.ai/techniques/step-by-step)

---

### 4. 「エラー対処」
**何をする場所？**  
失敗時のふるまいを事前に定義し、報告形式も固定します。

**なぜ必要？**  
- **失敗の可視化**：暗黙エラーや誤答を“成功扱い”にせずに検知可能。  
- **自動化連携**：JSON形式で報告すれば、CI/CDやSlack通知で扱いやすい。  
- **運用耐性**：再試行ルールを定めて安定化。

📚 参考資料:  
- [MLOps Community — Error Handling for AI Agents](https://mlops.community/error-handling-for-ai-agents/)  
- [Prompting Techniques for Robust LLM Workflows (Arxiv)](https://arxiv.org/abs/2308.13245)

---

### 5. 「出力ルール」
**何をする場所？**  
形式・命名規則・スタイルを統一し、結果を資産化できる状態にします。

**なぜ必要？**  
- **一貫性と機械可読性**：フォーマットを統一すれば、後工程（解析・比較・保存）が容易。  
- **品質の安定**：同じ構造を維持できるため再現性が上がる。  
- **レビュー効率**：差分（diff）が取りやすく、ナレッジ化しやすい。

📚 参考資料:  
- [GeeksforGeeks — Prompt Engineering Output Formatting](https://www.geeksforgeeks.org/blogs/prompt-engineering-best-practices)  
- [Prompting Guide — Output Formatting](https://www.promptingguide.ai/techniques/output-formatting)

---

### 6. 「開始メッセージ」
**何をする場所？**  
タスク開始を明示し、人にも機械にもわかるログ出力を行います。

**なぜ必要？**  
- **トレース性**：いつ・何が始まったかを明示し、デバッグや再実行を容易に。  
- **対話と自動化の両対応**：SlackなどでのChatOps連携やCIログ出力に有効。  
- **運用性向上**：失敗時のトラブルシューティングを高速化。

📚 参考資料:  
- [GitHub Actions — Workflow Logging Best Practices](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#example-setting-an-output-parameter)  
- [Slack API — Event Message Standards](https://api.slack.com/messaging/composing)

---

## 🚀 このテンプレートの強み（要約）
| 観点 | 内容 |
|---|---|
| 再現性 | 初期条件・構造・出力を固定し、誰が使っても同じ流れに |
| 自動化 | JSON/定型メッセージで CI/CD・通知と連携しやすい |
| 拡張性 | 手順・出力規則を差し替えるだけで多用途化 |
| 安全性 | allowed-tools とエラー設計で誤操作を抑制 |
| 運用性 | ログ/開始メッセージで履歴追跡とデバッグが楽 |

---

## 🧩 まとめ
このテンプレートは、AIを「ただの道具」ではなく **運用可能なワークフロー** として扱うための骨格です。  
まずは普段のタスク（レポート生成、ドキュメント整形、Issue 自動化など）をこの構造に落とし込み、**目的・手順・出力・エラー** を統一してみてください。  
それだけで、出力品質・再現性・運用安定性が大きく向上します。

📘 次回は、このテンプレートをベースにした「ChatOps 用（Slack／GitHub Actions 向け）」バージョンも紹介予定です。
