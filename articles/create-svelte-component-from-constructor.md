---
title: 'svelteコンポーネントをコンストラクタから呼び出したものをjsとして配信したい'
emoji: '😸'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['svelte', 'vite', 'vitest']
published: false
---

## はじめに

`Svelte` を `html` や他のフレームワークで使用したい場合、以下のどちらかになると思います。

- [Custom elements API](https://svelte.jp/docs/custom-elements-api)を使う
- Javascript に埋め込む

今回は後者を使って、html に svelte コンポーネントを呼び出す内容となっています。

記事用の github リポジトリを作成したので参考にしてください。

- https://github.com/emrum01/svelte-create-component-from-constructor

## 配信したいコンポーネントを実装する

まず、配信するコンテンツ部分である

- button コンポーネント
- コンポーネント作成関数

を実装します。

### ボタンコンポーネントを実装する

適当なボタンコンポーネントを実装します。

::::details ボタンコンポーネントの実装

```html
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  export let buttonText: string = '';
  export let onClick: () => void;
  export let type: HTMLButtonAttributes['type'] = 'button';
  export let buttonWidth: 'sm' | 'md' | 'lg' = 'md';

  const dispatch = createEventDispatcher();
  const handleClick = (e: MouseEvent) => {
    onClick();
    dispatch('click', e);
  };

  // TODO: 型安全ではない値を入れて検証
  $: buttonSize = {
    sm: 'w-[100px]',
    md: 'w-[200px]',
    lg: 'w-[300px]',
  }[buttonWidth];
</script>

<!--
  svelteがシンタックスハイライトされないので、htmlとして表示してますが、
  執筆時の自動フォーマットによって、classが反映されない書き方になっちゃっているのでコピペする際はgithubからお願いします 
-->
<button
  on:click="{handleClick}"
  class="{`${buttonSize}
    text-white
    bg-gray-500
    h-12
    px-4
    py-2
    text-[12px]`}"
  {type}
>
  {buttonText}
</button>
```

::::

### コンポーネント作成関数

[公式ドキュメント](https://svelte.jp/docs/client-side-component-api)にもある通り、コンパイル後の svelte コンポーネントは`javascript`の`class` で api は以下のようになっています。

```javascript
// 公式から引用
import App from './App.svelte';
const app = new App({
  target: document.body,
  props: {
    // assuming App.svelte contains something like
    // `export let answer`:
    answer: 42,
  },
});
```

今回やりたいことはこのクラスをインスタンス化することで描画することです。

しかし、ここで直接 `props` を渡して描画しようとしたら、渡した値が受け取られないトラブルに遭遇しました。
これは`$$set` プロパティに `props` を渡すことで解決出来ました。

```ts
// 動かない
new Button({ target: document.body, ...props });

// 動いた
new Button({ target: document.body }).$$set({ ...props });
```

::::details 最終的なコンポーネント作成関数の実装

```ts
/**
 * svelte以外の環境でButtonコンポーネントを表示するための関数
 *
 * @param target 表示する対象のHTMLElement
 * @param props ButtonコンポーネントのProps
 */
export const createButton = (target: HTMLElement, props: Props) => {
  // 任意の処理

  new Button({
    target,
  }).$$set({
    ...props,
  });
};
```

::::

参考: https://stackoverflow.com/questions/72980128/svelte-not-updating-instantiated-component-when-changing-props-in-parent

## 単一の js ファイルにバンドル

配信したいコンテンツが出来たので、vite を使ってバンドルしていきます。vite をインストールしたら設定を以下のようにします。

```bash
npm i -D vite
```

```js
/// <reference types="vitest" />
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { UserConfig } from 'vite';
import { svelteTesting } from '@testing-library/svelte/vite';

const config: UserConfig = {
  plugins: [cssInjectedByJsPlugin(), svelte(), svelteTesting()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.js'],
    include: ['**/*.test.ts'],
  },
  build: {
    lib: {
      entry: 'src/lib/button/createButton.ts',
      name: 'Svelte-create-component-from-constructorButton', // FIXME: 名称は後で調整
      fileName: 'svelte-create-component-from-constructor-sdk',
      formats: ['es'],
    },
  },
};

export default config;
```

js ファイルにバンドルしたものを dist ディレクトリに出力したいので[ライブラリーモード](https://ja.vitejs.dev/guide/build#library-mode)を使っています。

css を js にまとめてバンドルするために`vite-plugin-css-injected-by-js`を使っています。

注意点としては、js・ts ファイルから svelte コンポーネントを再エクスポートしないと tailwind が当たらなかったことです。
vite の設定次第で別な解決方法があるのかもしれませんが、配信するコンポーネントは再エクスポートすることをお勧めします。

## 動作確認をする

vite でローカルサーバーを立てると cors エラーが出たので自分は http-server を使用しました

使用したコマンドは以下のような感じです。

::::details zsh ユーザーの場合はこれでページまで開けます。

```zsh
npm run build && cat <<EOF >> dist/test.html && npm i -D http-server && open http://127.0.0.1/test.html && npx http-server ./dist -c-1 -p 80
<html>
  <body>
    <script type="module">
      import { createButton } from './svelte-create-component-from-constructor-sdk.js';
      document.addEventListener(
        'DOMContentLoaded',
        createButton(document.body, {
          buttonText: 'Click me!',
          onClick: () => alert('Hello!'),
        })
      );
    </script>
  </body>
</html>
EOF
```

::::

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
      document.addEventListener(
        'DOMContentLoaded',
        createButton(document.body, {
          buttonText: 'Click me!',
          onClick: () => alert('Hello!'),
        })
      );
    </script>
  </body>
</html>
```

```bash
npm i -D http-server
npx http-server ./dist -c-1 -p 80
```

これで以下のように表示されるはずです。

![](/images/create-svelte-component-from-constructor/button-example.png)

あとはどこかにホスティングするなり、npm で配信するだけです。
