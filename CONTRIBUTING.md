# Contributing to SPBU Management System

Terima kasih atas ketertarikan Anda untuk berkontribusi pada SPBU Management System!

## 🤝 Cara Berkontribusi

### Melaporkan Issue

Sebelum membuat issue baru, silakan cek apakah issue serupa sudah ada:

1. Buka [Issues](https://github.com/anfalblank/spbu-management-system/issues)
2. Gunakan search untuk mengecek issue yang sudah ada
3. Jika tidak ada, buat issue baru dengan:
   - Judul yang jelas dan spesifik
   - Deskripsi detail masalah
   - Langkah untuk reproduksi (jika bug)
   - Environment info (OS, browser, Node version)
   - Screenshot/video (jika relevan)

### Pull Request Process

1. **Fork Repository**
   ```bash
   # Fork repository dari GitHub
   git clone https://github.com/YOUR_USERNAME/spbu-management-system.git
   cd spbu-management-system
   ```

2. **Buat Branch Baru**
   ```bash
   git checkout -b feature/fitur-anda
   # atau
   git checkout -b fix/perbaikan-bug
   ```

3. **Lakukan Perubahan**
   - Ikuti struktur kode yang sudah ada
   - Tambah komentar untuk kode yang kompleks
   - Update dokumentasi jika perlu
   - Pastikan kode lulus linting

4. **Testing**
   ```bash
   npm run lint
   npm run build
   # Manual test fitur yang diubah
   ```

5. **Commit**
   ```bash
   git add .
   git commit -m "type: deskripsi singkat"

   # Contoh commit message:
   # feat: tambah fitur auto-order untuk stok menipis
   # fix: perbaiki perhitungan selisih pada settlement
   # docs: update README dengan instruksi instalasi
   ```

6. **Push dan Buat PR**
   ```bash
   git push origin feature/fitur-anda
   ```
   - Buat Pull Request dari GitHub
   - Jelaskan perubahan yang dilakukan
   - Link issue terkait (jika ada)

## 📝 Commit Message Convention

Gunakan format berikut untuk commit message:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: Fitur baru
- **fix**: Perbaikan bug
- **docs**: Perubahan dokumentasi
- **style**: Perubahan formatting (tidak mengubah kode)
- **refactor**: Refactoring kode
- **perf**: Perbaikan performa
- **test**: Menambah/mengubah test
- **chore**: Perubahan build/config, dll

### Contoh

```bash
# Feat
git commit -m "feat(auto-order): tambah prediksi stok dengan machine learning"

# Fix
git commit -m "fix(pos): perbaiki quantity selector untuk nilai desimal"

# Docs
git commit -m "docs(api): tambah dokumentasi endpoint orders"
```

## 🏗️ Struktur Kode

### Lokasi File

```
spbu-management-system/
├── app/                          # Pages dan routing
│   ├── dashboard/                # Dashboard pages
│   ├── pos/                      # POS pages
│   ├── spbu/                     # SPBU module pages
│   └── ...
├── components/
│   ├── ui/                       # Base UI components (shadcn/ui)
│   ├── common/                   # Reusable components
│   ├── composables/              # Custom hooks
│   ├── dashboard/                # Dashboard components
│   ├── orders/                   # Order components
│   └── ...
├── store/                        # Zustand stores
├── lib/                          # Utilities dan services
│   ├── api/                      # API client & services
│   ├── auth/                     # Auth utilities
│   ├── ai/                       # AI services
│   └── ...
└── docs/                         # Documentation
```

### Menambah Komponen Baru

#### 1. Komponen UI (shadcn/ui)
```bash
# Gunakan shadcn CLI
npx shadcn@latest add [component-name]
```

#### 2. Komponen Common
```typescript
// components/common/my-component.tsx
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface MyComponentProps {
  // props definitions
}

export function MyComponent({ /* props */ }: MyComponentProps) {
  return (
    <div className={cn(/* tailwind classes */)}>
      {/* component implementation */}
    </div>
  )
}
```

#### 3. Composables (Custom Hooks)
```typescript
// components/composables/use-my-feature.ts
import { useState } from 'react'

export function useMyFeature() {
  const [state, setState] = useState(null)

  const doSomething = () => {
    // logic
  }

  return { state, doSomething }
}
```

#### 4. Store Baru
```typescript
// store/useMyFeatureStore.ts
import { create } from 'zustand'

interface MyFeatureState {
  // state definition
}

export const useMyFeatureStore = create<MyFeatureState>((set) => ({
  // store implementation
}))
```

## 🎨 Style Guide

### TypeScript
- Gunakan TypeScript untuk semua file baru
- Definisikan types/interfaces dengan jelas
- Hindari penggunaan `any`
- Gunakan `readonly` untuk array yang tidak boleh diubah

### React
- Gunakan functional components dengan hooks
- Hindari class components
- Gunakan `React.memo` untuk komponen yang sering re-render
- Definisikan types untuk props

### Tailwind CSS
- Gunakan utility classes dari Tailwind
- Gunakan `cn()` helper untuk conditional classes
- Hindari inline styles
- Gunakan semantic colors dari `tailwind.config.ts`

### Contoh Kode yang Baik
```typescript
interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  variant?: 'default' | 'compact'
}

export const ProductCard = React.memo(function ProductCard({
  product,
  onAddToCart,
  variant = 'default'
}: ProductCardProps) {
  return (
    <Card className={cn(
      "hover:shadow-lg transition-shadow",
      variant === 'compact' && "p-4"
    )}>
      {/* card content */}
    </Card>
  )
})
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

### Writing Tests
```typescript
// Example test
import { render, screen } from '@testing-library/react'
import { MyComponent } from './my-component'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## 📚 Documentation

### Menambah Dokumentasi

1. **JSDoc untuk fungsi**
```typescript
/**
 * Calculate total price with tax
 * @param subtotal - Subtotal amount
 * @param taxRate - Tax rate percentage (default: 11)
 * @returns Total price including tax
 * @example
 * calculateTotal(10000, 11) // 11100
 */
export function calculateTotal(subtotal: number, taxRate: number = 11): number {
  return subtotal * (1 + taxRate / 100)
}
```

2. **Update README**
   - Tambah fitur baru ke section fitur
   - Update instruksi instalasi jika perlu
   - Tambah contoh penggunaan

3. **Update docs/**
   - Tambah dokumentasi teknis di `docs/`
   - Update ARCHITECTURE.md untuk perubahan besar

## 🐛 Debugging

### Debug di Browser
```typescript
// Gunakan console.log dengan prefix
console.log('[MyFeature]', data)

// Gunakan debugger
debugger

// React DevTools
// Install React DevTools browser extension
```

### Debug di VS Code
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Next.js: debug server-side",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["inspect"],
      "cwd": "${workspaceFolder}"
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Next.js: debug client-side",
      "url": "http://localhost:3000"
    }
  ]
}
```

## 📋 Checklist Sebelum PR

Sebelum membuat Pull Request, pastikan:

- [ ] Kode mengikuti style guide
- [ ] Tidak ada error TypeScript (`npm run build`)
- [ ] Tidak ada warning ESLint (`npm run lint`)
- [ ] Fitur berfungsi sesuai expected
- [ ] Tambah/update unit tests (jika perlu)
- [ ] Tambah/update dokumentasi
- [ ] Commit messages mengikuti convention
- [ ] Branch sudah up-to-date dengan main

## 💡 Tips

### Performa
- Gunakan `useMemo` untuk komputasi berat
- Gunakan `useCallback` untuk functions yang diberikan ke child
- Hindari inline object/array di render
- Gunakan `React.memo` untuk komponen yang sering re-render

### State Management
- Gunakan Zustand untuk global state
- Gunakan `useState` untuk local state
- Hindari prop drilling dengan Zustand atau Context
- Pilih yang paling tepat untuk use case

### Error Handling
- Selalu gunakan try-catch untuk async operations
- Tampilkan error message yang jelas ke user
- Log error untuk debugging
- Gunakan Error Boundary untuk error handling

## 🎯 Goals

- Kode yang mudah dibaca dan di-maintain
- Performa yang optimal
- Type safety dengan TypeScript
- Testing coverage yang baik
- Dokumentasi yang lengkap

## 📞 Kontak

Untuk pertanyaan:
- GitHub Issues: [Create Issue](https://github.com/anfalblank/spbu-management-system/issues)
- Email: dev@spbu.id

---

Happy Coding! 🚀
