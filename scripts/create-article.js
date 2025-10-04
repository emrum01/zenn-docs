const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createArticle() {
  console.log('📝 Zenn記事作成ウィザード\n');
  console.log('=====================================\n');

  // 基本情報の入力
  const title = await question('📌 タイトル: ');
  if (!title) {
    console.log('❌ タイトルは必須です');
    process.exit(1);
  }

  const emoji = await question('😊 絵文字 (デフォルト: 📝): ') || '📝';
  const type = await question('📚 タイプ [tech/idea] (デフォルト: tech): ') || 'tech';

  // トピックの入力
  console.log('\n💡 トピックを入力 (カンマ区切り、最大5つ)');
  console.log('   例: javascript,nodejs,react');
  const topicsInput = await question('🏷️  トピック: ');
  const topics = topicsInput
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t)
    .slice(0, 5);

  // 公開設定
  const publishedInput = await question('🚀 すぐに公開する？ [y/n] (デフォルト: n): ');
  const published = publishedInput.toLowerCase() === 'y';

  // 予約投稿
  let publishedAt = '';
  if (!published) {
    const scheduleInput = await question('📅 予約投稿する？ [y/n] (デフォルト: n): ');
    if (scheduleInput.toLowerCase() === 'y') {
      publishedAt = await question('   日時 (YYYY-MM-DD HH:mm): ');
    }
  }

  // スラッグの生成
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  const slug = `${dateStr}-${titleSlug}`;

  console.log(`\n📂 ファイル名: articles/${slug}.md`);

  // 記事ファイルの作成
  try {
    execSync(`npx zenn new:article --slug ${slug}`, { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ 記事の作成に失敗しました:', error.message);
    process.exit(1);
  }

  // フロントマターの設定
  const articlePath = path.join('articles', `${slug}.md`);

  let frontMatter = `---
title: "${title}"
emoji: "${emoji}"
type: "${type}"
topics: [${topics.map(t => `"${t}"`).join(', ')}]
published: ${published}`;

  if (publishedAt) {
    frontMatter += `\npublished_at: "${publishedAt}"`;
  }

  frontMatter += '\n---\n';

  const content = `${frontMatter}

# はじめに

この記事では、

## 環境

-

## 実装



## まとめ



## 参考資料

-
`;

  fs.writeFileSync(articlePath, content);

  console.log('\n✅ 記事を作成しました！');
  console.log(`📝 エディタで開く: code ${articlePath}`);
  console.log(`👀 プレビュー: npm run preview`);

  rl.close();
}

createArticle().catch(error => {
  console.error('エラー:', error);
  rl.close();
  process.exit(1);
});