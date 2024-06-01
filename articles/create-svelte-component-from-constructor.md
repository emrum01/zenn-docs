---
title: 'svelteコンポーネントをコンストラクタから呼び出したものをjsとして配信したい'
emoji: '😸'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['svelte', 'vite', 'vitest']
published: false
---

## はじめに

Svelte を html ファイルや他のフレームワークで使用したい場合、以下のどっちかになると思います。

- [Custom elements API](https://svelte.jp/docs/custom-elements-api)を使う
- Javascript に埋め込む

今回は後者を使って、html に svelte コンポーネントを呼び出す内容となっています。

記事用の github リポジトリを作成したので参考にしてください。

- https://github.com/emrum01/svelte-create-component-from-constructor

##

まず、button コンポーネントとボタンコンポーネントのインスタンス化処理をラップした関数を用意します。
addEventListener がないと html でロードされません。

vite を使ってバンドルしていきます。
lib モードを使います。

entry を ts ファイルにしたら cssCodeSplit が効かなかったので、別なプラグインを用意して単一の js としてバンドルできるようにします。

vite でローカルサーバーを立てると cors エラーが出たので自分は http-server を使用しました

zsh を利用していれば、リポジトリのプロジェクトルートで以下のコマンドを打てば

```bash
npm run build
touch dist/test.html
```

内容を以下のようにする

```html
<!-- dist/test.html -->
<html>
  <body>
    <script type="module">
      import { createButton } from './svelte-create-component-from-constructor-sdk.js';
      createButton(document.body, {
        buttonText: 'Click me!',
        onClick: () => alert('Hello!'),
      });
    </script>
  </body>
</html>
```

```bash
npm i -D http-server
npx http-server ./dist -c-1 -p 80
```
