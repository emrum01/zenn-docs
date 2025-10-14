---
title: "要件マッピングから仕様をオンデマンド生成する──“ドキュメントを持たない”開発運用の設計"
emoji: "🧠"
type: "idea"
topics: ["llm", "requirements", "documentation", "prompt-engineering"]
published: false
---

> ドキュメントを増やさず、でも仕様は常に正確にしたい。  
> その両立を、**LLMと要件マッピング**の仕組みで実現するアイデアです。  
> ここで紹介するのは、「仕様書を保存しないドキュメント設計」。  
> 情報をマッピング1枚に集約し、LLMで必要なときにだけ仕様を再構成します。

---

## 💡 背景

プロジェクトが成長すると、**要件・仕様・テストの整合**がすぐ崩れます。  
WikiやNotionを整えても、数ヶ月後には陳腐化。  
仕様書を保管し続けること自体がメンテナンスコストになります。

それならいっそ、**仕様書を持たない**という選択肢を。  
必要な情報だけを1つのマッピングで管理し、  
LLMに「仕様書の材料をオンデマンドで取得」させるのです。

---

## 🗂 全体構成（極小）

```
/specs/
  registry.md              # 要件・テストのマッピング（唯一のソース）
  templates/
    screen-spec.md         # 出力テンプレート
    api-spec.md            # 出力テンプレート
  guides/
    prompting.md           # LLMへの依頼テンプレート
.gitignore                 # generated/ を除外（仕様書を保持しない）
```

> この構成では `generated/` フォルダを使いません。  
> 出力はあくまで「その場限り」。LLMが毎回新鮮な仕様を整形します。

---

## 📘 要件マッピング（registry.md）

```markdown
# Requirements Traceability Index

| タグ | 要件ファイル | 要件ID | テストファイル |
|------|--------------|--------|----------------|
| **phoenix-feed** | requirements/phoenix-feed.md | REQ-PF-001 | tests/e2e/phoenix-feed.spec.ts |
| **phoenix-feed** | requirements/phoenix-feed.md | REQ-PF-002 | |
| **stardust-inbox** | requirements/stardust-inbox.md | REQ-SI-010 | |

### 要件本文
#### phoenix-feed.md
- **REQ-PF-001**: フィード画面は最新20件を時系列降順で表示する  
- **REQ-PF-002**: ネットワーク遅延時はスケルトンを1秒以内に表示する

#### stardust-inbox.md
- **REQ-SI-010**: 未読メッセージ数をバッジで示す（0件時は非表示）
```

> このファイルが“唯一の正”。  
> LLMはここからタグ・要件ID・要件文・関連テストを抽出し、仕様テンプレートを埋めます。

---

## 🧩 テンプレート（仕様書の型）

### `/specs/templates/screen-spec.md`

```markdown
## 画面名: {{screen_name}}
- 対応要件: {{req_ids}}

### 1. 目的
- {{why}}

### 2. 構造
- コンポーネント: {{components}}
- 状態管理: {{state}}

### 3. 振る舞い
- Given / When / Then 形式で要件ごとの動作を記述

### 4. 検証・計測
- {{metrics}}
- {{accessibility}}
```

> LLMはこの構造を守って出力するため、  
> チーム全員が同じフォーマットで仕様を共有できます。

---

## 🧠 LLMへの依頼テンプレート（prompting.md）

```markdown
# /spec screen
目的: {概要}
対象タグ: {phoenix-feed}
要件ID: {REQ-PF-001, REQ-PF-002}
参照: /specs/registry.md, /specs/templates/screen-spec.md

出力条件:
- テンプレートを完全に埋める
- Given/When/Then 形式で記述
- 不足情報は <TODO> で明示
```

> LLMは registry.md の情報を参照し、  
> テンプレートに沿って「仕様の材料」を出力します。  
> これがそのまま会話・議論・レビューの起点になります。

---

## ⚙️ 実行の流れ

1. **registry.md** に要件を追加  
2. LLMに `/spec screen` でリクエスト  
3. LLMがテンプレートを埋めた仕様を出力  
4. 出力は保存せず、必要に応じて共有（PRやSlackなど）

```mermaid
flowchart TD
    A[registry.md] --> B[LLM]
    B --> C[テンプレート展開]
    C --> D[仕様出力 (一時的)]
```

> “保存しない設計”により、  
> 常に最新の要件・テスト構成をもとにした仕様を得られます。

---

## 🧾 運用ルール

| 目的 | 操作 |
|------|------|
| 要件の追加 | registry.md に追記 |
| 仕様の取得 | `/spec screen` or `/spec api` |
| テスト紐づけ | テーブルのテスト列を編集 |
| ドキュメント更新 | LLMが再生成、保存しない |

> 編集するのは registry.md のみ。  
> 情報が古くなることはありません。

---

## ✅ メリット

- **ドキュメントを持たない**ことで整合性が崩れない  
- **材料（マッピング）だけを永続化**するので更新が軽い  
- **LLMの整形能力を最大限活用**して出力形式を自在に変更可能  
- チームの誰でも `/spec screen` で即座に仕様を取得できる

---

## 🧭 まとめ

この仕組みの本質は「仕様を保存しない」こと。  
保存せず、必要なときに**再構成できる環境を持つ**ことで、  
ドキュメントの陳腐化や管理負担を根本的に排除します。

> 永続化するのは「要件のマッピング」だけ。  
> 仕様は**動的に生成される表現**であり、  
> LLMがいつでも最新状態から再構成できるようにする。  

これが、**ドキュメントを持たない開発運用**の最小単位です。
