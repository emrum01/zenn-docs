---
title: "AI駆動E2E設計 — Claude CodeとChrome DevTools MCPを1行コマンドで動かす"
emoji: "🧩"
type: "tech"
topics: ["e2e-testing", "gherkin", "chrome-devtools", "mcp", "claude-code", "slash-command"]
published: false
---

## 💡 はじめに

E2Eテストは**動作確認ひとつでもアプリ状態が複雑で再現が面倒**なことがあります。  
そんな作業をAIに任せられたらどうでしょう？

本記事では、**Claude Code** と **Chrome DevTools MCP** を使って  
AIがブラウザを自律的に操作するE2Eテスト設計を紹介します。  
しかも、**1行のスラッシュコマンドで動く**形にします。

---

## 🧩 サンプルリポジトリ

この記事で紹介する構成は、以下のリポジトリで動作する実装例です。  
👉 [emrum01/chrome-devtools-e2e-sample](https://github.com/emrum01/chrome-devtools-e2e-sample/tree/main)

このリポジトリには、  
Claude CodeとChrome DevTools MCPを組み合わせた**AI駆動E2Eテストの最小構成**がまとめられています。  

---

## 🎯 目的

> 「E2Eテストは、AIに“頼む”だけにする。」

Claude Codeを通じて自然言語で操作を指示し、  
Chrome DevTools MCP経由でAIがブラウザを直接操作します。

### 特徴
- Claude Codeを実行環境に使用  
- Chrome DevTools MCPで**実ブラウザ制御**  
- featureファイルは**日本語Gherkin**  
- `/e2e-chrome-devtools-mcp` コマンド1行で実行  
- **入力 → 状態確認 → 再入力** のループで安定化  

---

## ⚙️ 前提と準備

Claude Codeで  
`dangerously skip permissions` を利用できるようにしておく必要があります。  

安全な実行管理には以下の記事が参考になります：  
> 📰 [wasabeefさん: Claude CodeでセキュアにBashを使う方法](https://wasabeef.jp/blog/claude-code-secure-bash)

また、DevTools MCPのセットアップは公式リポジトリを参照してください。  
👉 [https://github.com/ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)

---

## 📁 ディレクトリ構成

リポジトリ内の構成は次のようになっています。

````markdown
docs/e2e-testing/
├─ RUNBOOK.md
├─ guidelines/
│  └─ ai-rules.md
├─ snippets/
├─ features/
└─ scenarios/
````

- `RUNBOOK.md`：AIの実行起点  
- `guidelines/ai-rules.md`：環境・自然言語マッピング定義  
- `snippets/`：操作失敗時のフォールバックJS  
- `features/`：各機能を日本語Gherkinで記述  
- `scenarios/`：複数featureを組み合わせた長尺シナリオ  

---

## 💬 featureファイル例

````gherkin
Feature: 購入（支払い方法の切り替え）

  Background:
    前提 ステージング環境を開いている
    かつ テストユーザーでログインしている
    かつ カートに商品が1点以上入っている

  Scenario: ペイパルで購入を完了する
    もし 支払い方法 "paypal" を選択する
    かつ "注文を確定する" をクリックする
    ならば "注文が完了しました" が表示されていること
````

---

## 🧭 Claude Codeコマンド設定

`.claude/commands/e2e-chrome-devtools-mcp.md` を作成し、次の1行だけ記述します。

````markdown
docs/e2e-testing/RUNBOOK.md を読み込んでその中身を実行する
````

---

## 🚀 実行方法

Claude Codeのチャットで次のように入力します。

````bash
/e2e-chrome-devtools-mcp "ペイパルで購入して"
````

AIは次の順序で自律的に進行します：

1. `RUNBOOK.md` を読み込み、対象featureを特定  
2. Chrome DevTools MCPを通してブラウザを操作  
3. **入力 → スナップショット取得 → 検証 → 再入力** を繰り返し進行  
4. 結果をログ・スクリーンショットで出力  

---

## 🧠 なぜうまく動くのか

Chrome DevTools MCPは、AIが**ブラウザと直接通信できるプロトコル**です。  
そのため、AIは以下のように操作を検証しながら進められます。

- **観測:** DOM構造や要素状態をリアルタイムで取得  
- **操作:** クリック・入力・スクロールなどを実行  
- **確認:** スナップショットや属性を比較して結果を判断  

これにより、AIは「入力した結果が反映されたか？」を自分で判断し、  
必要に応じて再入力します。  
まるで人間のテスターが画面を見ながら操作しているように動作します。  

また、実行は**staging環境限定**とすることで安全にテストを行えます。

---

## ✅ できるようになること

- **gherkinの内容をガイドラインとして画面操作を実行できる**  
  - featureファイルをそのまま手順書としてAIが読み取り、クリック・入力・検証を自律的に行います。  

- **環境を指示に含めるだけで切り替えられる**  
  - たとえば「本番ではなくステージングで実行して」と伝えるだけで、`RUNBOOK.md`内の設定が自動的に反映されます。  

- **操作に失敗したときは強制実行できる**  
  - DevTools MCPの [`evaluate_script`](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md#evaluate_script) を使い、  
    クリックできない要素や非表示UIにもJavaScriptで直接アクセスして操作を完了できます。  
  - さらに、同名のスニペットを `snippets/` に用意しておくことで、  
    フォールバック的に同じ処理をスムーズに再実行できるようになっています。  

---

## 🧭 使ってみた所感

実際に使ってみると、**UI操作はゆっくりだが確実**です。  
「すぐ確認したい」ケースでは手動の方が早いものの、  
クリック順や画面遷移をミスなく踏んでくれる安心感があります。

特に便利なのは、**動作確認を並行して進められる点**。  
複数の条件を自然言語で切り替えて「ステージングで再実行して」「今度はPayPalで」といった指示を出すだけで、  
AIが自動的に環境・操作手順を切り替えて実行してくれます。  

テストスクリプトを書くよりも、**対話でテストを操る感覚**に近く、  
ブラウザを実際に“動かすAI”という印象です。

---

## 📘 まとめ

この設計は、[emrum01/chrome-devtools-e2e-sample](https://github.com/emrum01/chrome-devtools-e2e-sample/tree/main) に実装された  
**Claude Code × Chrome DevTools MCP連携の最小サンプル**です。

AIが実ブラウザを操作しながら**入力 → 確認 → 再入力**を繰り返すことで、  
人間のように画面を見て判断するE2Eテストを実現します。  

> **E2Eテストは“書く”ものではなく、“頼む”もの。**  
> Claude CodeとDevTools MCPが、その新しい開発体験を可能にします。
