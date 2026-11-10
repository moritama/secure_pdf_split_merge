# Secure PDF Split & Merge (v1.1)

A secure, client-side PDF manipulation tool for splitting and merging PDF files offline.
オフラインでPDFファイルの分割・結合を行うことができる、安全なクライアントサイドツールです。

![Version: 1.1](https://img.shields.io/badge/Version-1.1-blue.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features (機能)

- **Secure & Offline**: Operates entirely in your browser. No PDF files are sent to any server.
  - **安全・オフライン**: すべての処理はブラウザ内で完結します。PDFファイルがサーバーに送信されることはありません。
- **Split PDF**: Extract specific pages or split by page count.
  - **PDF分割**: 特定のページを抽出したり、ページ数ごとにファイルを分割できます。
- **Merge PDF**: Combine multiple PDF files into one.
  - **PDF結合**: 複数のPDFファイルを1つに結合できます。
- **Page Editing before Merge (New in v1.1)**: Preview all pages in a grid, reorder pages across files via drag & drop, rotate pages (±90°), delete unwanted pages, and view high-resolution zoom previews before merging.
  - **結合前のページ編集 (v1.1 新機能)**: ファイル結合前に全ページをサムネイル一覧で表示し、ページ単位での入れ替え（異なるファイル間も対応）・ページの回転（±90°）・不要ページの削除・モーダルでの拡大プレビューが行えます。
- **Drag & Drop**: Easy file and page management with drag and drop support.
  - **ドラッグ＆ドロップ**: 直感的なドラッグ＆ドロップ操作でファイルやページの順序を管理できます。
- **Multilingual**: Supports English and Japanese (auto-detect).
  - **多言語対応**: 英語と日本語に対応（ブラウザ設定を自動検出）。

## Technologies (使用技術)

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [pdf-lib](https://pdf-lib.js.org/)
- [PDF.js](https://mozilla.github.io/pdf.js/)

## Getting Started (始め方)

### Prerequisites (前提条件)
- Node.js (v18 or higher)

### Installation (インストール)

Downloads required libraries (React, pdf-lib, PDF.js, Vite, etc.) defined in `package.json` into `node_modules/`.
`package.json` に定義された必要なライブラリ（React, pdf-lib, PDF.js, Vite など）を `node_modules/` にダウンロードします。

```bash
# Install dependencies
npm install
```

### Development (開発)

Starts a local development server (e.g., `http://localhost:5173/`) with hot-reload for quick browser preview during development (does not update `dist/`).
開発用のローカルWebサーバー（`http://localhost:5173/` 等）を起動します。コードの変更がリアルタイムでブラウザ画面に反映されます（※ `dist/` は更新されません）。

```bash
# Start development server
npm run dev
```

### Build (ビルド)

Bundles the source code and copies static files from `public/` into `dist/` for production or loading as an unpacked Chrome Extension (`chrome://extensions/`).
ソースコードを変換・圧縮し、`public/` 内の静的ファイルとあわせて Chrome拡張機能（`chrome://extensions/` の「パッケージ化されていない拡張機能を読み込む」）や本番公開用の `dist/` フォルダに出力します。

```bash
npm run build
```

## License (ライセンス)

This project is licensed under the MIT License - see below for details.
本プロジェクトはMITライセンスの下で公開されています。詳細は以下をご覧ください。

---

**MIT License**

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
