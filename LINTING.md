# Sistem Linting dan Formatting

Proyek ini menggunakan ESLint untuk konsistensi kode, Prettier untuk formatting, dan Husky untuk pre-commit hooks.

## ESLint

ESLint digunakan untuk memeriksa gaya kode dan menemukan potensi masalah pada kode JavaScript/TypeScript.

Untuk menjalankan ESLint secara manual:

```bash
./lint.sh
# atau
npx eslint "**/*.{js,jsx,ts,tsx}" --fix
```

## Prettier

Prettier digunakan untuk memformat kode secara otomatis sesuai dengan standar yang telah ditentukan.

Untuk menjalankan Prettier secara manual:

```bash
./format.sh
# atau
npx prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"
```

## Husky dan Lint-staged

Husky digunakan untuk mengatur git hooks, terutama pre-commit hook yang akan menjalankan lint-staged.

Lint-staged akan memastikan bahwa hanya file yang diubah yang akan di-lint dan di-format saat commit.

## Konfigurasi

- `.eslintrc.json` - Konfigurasi ESLint
- `.prettierrc` - Konfigurasi Prettier
- `.lintstagedrc.json` - Konfigurasi lint-staged
- `.husky/pre-commit` - Pre-commit hook

## Catatan

- Semua file JavaScript/TypeScript (.js, .jsx, .ts, .tsx) akan di-lint menggunakan ESLint dan diformat menggunakan Prettier saat commit.
- File JSON, CSS, dan Markdown hanya akan diformat menggunakan Prettier.
- Pre-commit hook akan otomatis dijalankan saat `git commit` dan akan mencegah commit jika ada masalah yang ditemukan oleh ESLint.
