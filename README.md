# Secure PDF Split & Merge

A secure, client-side PDF manipulation tool for splitting and merging PDF files offline.
オフラインでPDFファイルの分割・結合を行うことができる、安全なクライアントサイドツールです。

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features (機能)

- **Secure & Offline**: Operates entirely in your browser. No PDF files are sent to any server.
  - **安全・オフライン**: すべての処理はブラウザ内で完結します。PDFファイルがサーバーに送信されることはありません。
- **Split PDF**: Extract specific pages or split by page count.
  - **PDF分割**: 特定のページを抽出したり、ページ数ごとにファイルを分割できます。
- **Merge PDF**: Combine multiple PDF files into one.
  - **PDF結合**: 複数のPDFファイルを1つに結合できます。
- **Drag & Drop**: Easy file management with drag and drop support.
  - **ドラッグ＆ドロップ**: 直感的なドラッグ＆ドロップ操作でファイルを管理できます。
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

```bash
# Install dependencies
npm install
```

### Development (開発)

```bash
# Start development server
npm run dev
```

### Build (ビルド)

For Chrome Extension or production build:
Chrome拡張機能または本番用ビルド:

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
