---
title: "AIに「コードブロックの中にコードブロック」を安全に出力させる最小手順"
emoji: "🧱"
type: "tech"
topics: ["markdown", "zenn", "prompt-engineering", "documentation"]
published: true
---

## この記事の目的
AI（ChatGPT など）に「**コードブロックの中にさらにコードブロック**」を出力させると、内部の ``` が**閉じタグと誤認**され、**外側のコードブロックが分割される**ことがあります。  
本記事では、この分割問題を**最短手順**で回避する方法をまとめます。結論はシンプルです:

> **内側のトリプルバッククォートの先頭に \\（\\）を付ける**
> 例: ``` の先頭に \\（\\）を追加して「\\```」の形にする

この方法なら、**全体を一つのコードブロックとして出力**できます。必要なら、**コピー後に \\ だけ削除**すれば実コードとして使えます。

---

## 背景：なぜ分割が起きるのか
Markdown の**フェンス付きコードブロック**は、開きと同数以上のバッククォート（またはチルダ）で閉じます。内部に**同じ数のバッククォート列**が出現すると、**レンダラが「閉じた」と判断**してしまうため、外側が途中で終わったように扱われ、**分割**が発生します。  
- 仕様上、**同種・同数以上のフェンスで閉じる**のが基本（CommonMark）。[CommonMark Spec 0.30（Fenced code blocks）](https://spec.commonmark.org/0.30/)  
- 実務では **GitHub Flavored Markdown (GFM)** などでも同様の概念で動作します。[GitHub Docs: コードブロックの作成と強調表示](https://docs.github.com/ja/get-started/writing-on-github/working-with-advanced-formatting/creating-and-highlighting-code-blocks)

---

## 結論：最小の回避策
**AIに出力させる段階**では、**内側の ``` の前に \\ を付けて**おけば、レンダラが**「これは閉じフェンスではない」**と解釈し、**外側ブロックが分割されません**。

- 例:
  - **分割されやすい**:
    ```
    (ここで) ``` ← これが外側の閉じと誤解される
    ```
  - **安全**:
    ```
    (ここで) \\``` ← 先頭に \\
    ```

**公開前や実行前**に「**\\ だけを削除**」すれば、**本物の ```** として機能します。

> 注意: 一部レンダラやパイプラインでは**コードブロック内のエスケープを無視**する実装もあります（Stack Overflow でも議論があります）。その場合は**代替案**（後述）を検討してください。  
> 参考: [Stack Overflow: 3-backticks を含むコードブロックのエスケープ](https://stackoverflow.com/questions/49267811/how-can-i-escape-3-backticks-code-block-in-3-backticks-code-block)

---

## 手順（コピペ可）
1. **外側**のコードブロックで全体を囲む。
2. **内側**のトリプルバッククォート **```** を「\\```」に書き換える。
3. 必要に応じて **公開直前**に、「\\```」を **```** に戻す（**\\ のみ削除**）。

---

## 実例：AIに安全に「ネストしたコードブロック」を書かせる
**この節ごと**AI出力に使えます。下のブロックを**そのままプロンプトの回答として返す**と、分割されずに表示されます。

```
外側のコードブロックです。ここに「内側のコードブロック例」を安全に置きます。

内側のコードブロック（ここでは JavaScript とします）:
\```javascript
console.log("これは内側のコードブロックです");
\```

もう一段ネスト（Markdown の例）:
\```md
テキスト
\```md
さらにネスト
\```
\```

ポイント:
- いずれの内側フェンスも「\\```」（先頭に \\）で始めています。
- 公開用に最終整形する際は、**\\ を除去**して **```** に戻せば OK。
```

---

## 代替案（環境依存の揺れを避けたいとき）
### 1) 外側フェンスを「4個以上のバッククォート」にする
外側を ```` で始めると、**内側の ``` は閉じと見なされにくい**ため安全です（GFM系の実用的テクニック）。
参考: 「**トリプルバッククォートを表示するには、クアドラプルバッククォートで囲む**」という解説。  
- 解説例: [「4連バッククォートで内側に3連を表示」](https://nikkie-ftnext.hatenablog.com/entry/markdown-fenced-code-blocks-at-least-3-backticks-and-can-nest)

### 2) 外側フェンスにチルダ（~~~）を使う
**外側を ~~~ で囲い、内側を ``` にする**と、**記号種が違う**ため衝突しにくくなります。
- フェンスは **バッククォートまたはチルダ** を使えるのが一般的（CommonMark）。[CommonMark Spec 0.30（Fenced code blocks）](https://spec.commonmark.org/0.30/)  
- 解説記事: [Qiita: コードブロックの整理（フェンスや仕様の要点）](https://qiita.com/Yarakashi_Kikohshi/items/6ab5122acb2c8be83946)

---

## どうして効くのか（仕様の要点）
- フェンスは「**開きと**同種・同数以上の**閉じ**」でブロックを終了します（CommonMark）。  
  → **種類（` vs ~）**や**個数（3 vs 4+）**を**ずらす**か、**エスケープ**で**閉じと誤認させない**のがコツです。  
  - CommonMark: 「**コードブロックの内容は閉じフェンス（同種・同数以上）が来るまで**」という定義。[CommonMark Spec 0.30](https://spec.commonmark.org/0.30/)
- 一方で、**コードブロック内部のエスケープ解釈は実装差**があります。Stack Overflow でも「**ブロック内のエスケープは無視されることが多い**」との言及があり、**あなたのレンダリング環境で動く手法**を選ぶのが安全です。  
  - 参考: [Stack Overflow の議論](https://stackoverflow.com/questions/49267811/how-can-i-escape-3-backticks-code-block-in-3-backticks-code-block)

---

## よくある落とし穴
- **AI出力→そのまま公開**：内部の「\\```」を**戻し忘れて**、コードハイライトが効かない。
  → 対策: 公開前に **検索置換（「\\```」→「```」）** を実施。
- **言語識別子の付け忘れ**：`javascript` や `bash` などの**情報文字列**を忘れると、ハイライトが当たらないことがあります（GFM・Zenn など）。  
  → 参考: [GitHub Docs: コードブロックの作成と強調表示](https://docs.github.com/ja/get-started/writing-on-github/working-with-advanced-formatting/creating-and-highlighting-code-blocks)
- **レンダラ差の未検証**：社内CMSや静的サイトジェネレータで**挙動が微妙に異なる**。  
  → 対策: **4連以上のバッククォート**や **~~~** 方式も準備しておく。

---

## まとめ（最短ルール）
- **まずは**：**内側の ``` の先頭に \\（\\）を付ける**（AI出力を一つのブロックに保つ）。
- **環境差が不安なら**：外側を **````（4+）** か **~~~** にする。  
- **公開直前に**：**\\ を外す**だけで、本物の ``` として機能。

---

## 参考リンク
- CommonMark Spec 0.30（Fenced code blocks の定義）  
  https://spec.commonmark.org/0.30/
- GitHub Docs: Creating and highlighting code blocks（GFMの実用ガイド）  
  https://docs.github.com/ja/get-started/writing-on-github/working-with-advanced-formatting/creating-and-highlighting-code-blocks
- 「4連バッククォートで内側に3連を表示」紹介記事  
  https://nikkie-ftnext.hatenablog.com/entry/markdown-fenced-code-blocks-at-least-3-backticks-and-can-nest
- Qiita: コードブロックについてまとめて理解したい（仕様の整理）  
  https://qiita.com/Yarakashi_Kikohshi/items/6ab5122acb2c8be83946
- Stack Overflow: 3-backticks を含むコードブロックのエスケープ  
  https://stackoverflow.com/questions/49267811/how-can-i-escape-3-backticks-code-block-in-3-backticks-code-block
- Code with Hugo: Markdownでバッククォートをエスケープする方法（実践的まとめ）  
  https://codewithhugo.com/markdown-escape-backticks/
