<div align="center">
  
  <h1>✨ Smart Expense Dashboard ✨</h1>
  
  <p>
    <strong>A production-quality Next.js application built for an academic assignment.</strong><br>
    Demonstrating modern React patterns, Server Components, client state management, and type-safe server mutations.
  </p>
  
  <p>
    <a href="#-features">Features</a> •
    <a href="#-technology-stack">Tech Stack</a> •
    <a href="#-architecture-highlights">Architecture</a> •
    <a href="#-installation--setup">Setup</a> •
    <a href="#-screenshots">Screenshots</a>
  </p>
</div>

<br/>

## 📸 Screenshots



<div align="center">
  <!-- Replace `ui-screenshot-1.png` and `ui-screenshot-2.png` with your actual screenshot names -->
  <img src="./public/screenshots/ui-screenshot-1.png" alt="Dashboard UI Overview" width="48%" style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-right: 2%;">
  <img src="./public/screenshots/ui-screenshot-2.png" alt="Dark Mode View" width="48%" style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
</div>

---

## 🚀 Features

- ⚡ **Next.js App Router Architecture**: Clear separation of Server and Client Components for optimal performance.
- 🎨 **Accessible UI**: Built with `shadcn/ui` and Radix primitives ensuring a rich, inclusive user experience.
- 🌓 **Dynamic Theming**: Premium Dark, Light, and System modes using `next-themes` (free of hydration errors).
- 💾 **Persistent State**: Client-side filtering and sorting seamlessly managed by `Zustand` with `sessionStorage` persistence.
- 🛡️ **Type-Safe Validation**: End-to-end type safety and validation using `Zod` and `React Hook Form`.
- 🔄 **Server Actions**: Native Next.js data mutations featuring optimistic UI feedback via `Sonner` toasts.
- ⏳ **Loading States**: Integrated React Suspense with beautiful skeleton loaders.

---

## 🛠 Technology Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Client State** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |

---

## 📂 Folder Structure

```text
├── app/                  # Next.js App Router routes and layout
│   ├── actions/          # Next.js Server Actions (data mutations)
│   ├── dashboard/        # Dashboard view (Server Component)
│   ├── expenses/         # Expenses view (Server Component)
│   ├── globals.css       # Global styles and Tailwind variables
│   └── layout.tsx        # Root layout with ThemeProvider
├── components/           # React components
│   ├── dashboard/        # Dashboard specific components
│   ├── expenses/         # Expense list and filter components
│   ├── forms/            # React Hook Form components
│   ├── layout/           # Sidebar, Header, Navigation
│   ├── theme/            # Theme toggling and provider
│   └── ui/               # Reusable shadcn/ui primitives
├── lib/                  # Utilities and mock database
│   ├── validations/      # Zod schemas (shared client/server)
│   ├── db.ts             # Simulated server-side database
│   └── utils.ts          # Tailwind merge utilities
├── public/               # Static assets & screenshots
├── store/                # Zustand stores
│   └── expense-filter-store.ts
└── types/                # Shared TypeScript definitions
```

---

## 🧠 Architecture Highlights

### Server Components vs Client Components
- **Server Components** (`app/dashboard/page.tsx`) fetch data directly from the mock database without exposing fetching logic or endpoints to the client.
- **Client Components** (`components/expenses/expense-filter.tsx`) are strictly used where user interactivity (`useState`, `onChange`) or browser APIs are required.

### Zustand Architecture
- A centralized store (`store/expense-filter-store.ts`) manages filtering and sorting preferences.
- Components utilize **selector-based subscriptions** (e.g., `useExpenseFilterStore(state => state.searchQuery)`) to prevent unnecessary re-renders across the dashboard.

### Server Action Flow
1. User submits the Add Expense form.
2. `createExpenseAction` receives the `FormData`.
3. Server validates data against the Zod schema.
4. If valid, the mock database updates and `revalidatePath` triggers to clear the cache.
5. The Client Component receives the success response, resets the form, and fires a toast notification.

---

## ⚙️ Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🏗 Production Build

To test the optimized production build and verify there are no hydration or accessibility issues:

```bash
npm run build
npm run start
```

---

## 📊 Lighthouse Audit Instructions

To collect the required Core Web Vitals metrics for the technical report:
1. Run the production build (`npm run build && npm run start`).
2. Open the application in Google Chrome **Incognito mode**.
3. Open Developer Tools (`F12`) -> **Lighthouse** tab.
4. Select "Navigation", "Desktop", and check "Performance" and "Accessibility".
5. Click **Analyze page load**.
6. Record the generated LCP, CLS, INP, and overall scores into `docs/TECHNICAL_REPORT.md`.
