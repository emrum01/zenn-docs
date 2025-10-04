---
title: "AIがMarkdownで“コードブロック内にコードブロック”を安全に出力するためのシステムプロンプトルール"
emoji: "⚙️"
type: "tech"
topics: ["markdown", "prompt-engineering", "zenn", "documentation"]
published: true
---

## 背景
ChatGPTなどの生成AIに「**コードブロックの中にコードブロックを含むMarkdown**」を出力させると、  
内側の```が外側の閉じタグと誤認されて**分割される問題**が発生します。

## 解決策
AIに明示的なルールをシステムプロンプトとして与えることで、この問題を恒久的に回避できます。  
ルールは非常にシンプルです👇

---

## システムプロンプトに追記するルール

````markdown
## 💡「コードブロックの中でコードブロックを書く」ための完全ルール

- 最も外側のコードブロックを **5連バッククォート（`````）** とする。
- その内側にさらにコードブロックを記述する場合は **1段階ずつ減らす**。
  - 例：最外5 → 次4 → 内3
- 一番内側は必ず **3連バッククォート** とする。
- これにより、外側のブロックが誤って閉じることを防ぐ。
````

---

## サンプル出力（外4・内3）

````markdown
```
console.log("これは内側のコードブロックです");
```
````

上記をAIに出力させる場合、外4・内3の構造を維持すれば分割されません。

---

## システムプロンプトへの追加例

````markdown
You are ChatGPT.
When outputting Markdown that contains nested code blocks:
- Use 5 backticks for the outermost code block.
- Use 4 backticks for the next layer.
- Use 3 backticks for the innermost code block.
Always decrease one level per nesting to avoid accidental closure.
````

---

## まとめ
- 問題：AIがコードブロックを誤って閉じる  
- 解決：**外側から1本ずつ減らす構造（5→4→3）をルール化し、システムプロンプトに明記する**  
- 効果：AIがどの深さでも安全にMarkdownをネスト出力できる  

---

このルールをシステムプロンプトに追記すれば、  
AIが自動生成する記事・テンプレート・マークダウンを**一切分割せずに安定出力**できます。
