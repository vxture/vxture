# 落地指南

## 文件清单

```
vxture-v1.3.0-components/
├── README.md
├── INSTALL.md                              ← 这里
│
├── components/
│   ├── ai/
│   │   ├── ModelBadge.tsx
│   │   ├── GenerationStream.tsx
│   │   ├── PromptInput.tsx
│   │   ├── AIAssistantBubble.tsx
│   │   ├── TokenCounter.tsx
│   │   └── index.ts
│   └── ui/
│       ├── Toast.tsx
│       ├── Drawer.tsx
│       ├── Skeleton.tsx
│       └── index.ts
│
├── styles/
│   ├── components-ai.css
│   └── components-toast-drawer-skeleton.css
│
├── theme/
│   ├── ThemeProvider.tsx
│   ├── script.ts
│   └── index.ts
│
├── _index-additions.ts                     ← 追加到 src/index.ts
└── _components-css-additions.css           ← 追加到 styles/components.css
```

## 应用步骤

### 1. 复制源码

```bash
DS=packages/design/design-system/src

cp -r vxture-v1.3.0-components/components/ai   $DS/components/
cp -r vxture-v1.3.0-components/components/ui/{Toast,Drawer,Skeleton}.tsx $DS/components/ui/
cp vxture-v1.3.0-components/styles/*.css      $DS/styles/
cp -r vxture-v1.3.0-components/theme/*         $DS/theme/  # 已有 theme/ 目录则只补差异文件
```

### 2. 更新公共导出

把 `_index-additions.ts` 的内容追加到 `src/index.ts`。

### 3. 聚合样式入口

把 `_components-css-additions.css` 的两行追加到 `src/styles/components.css`。

### 4. 更新 components/ui/index.ts

确保 Toast / Drawer / Skeleton 三个新组件在 `src/components/ui/index.ts` 中已有导出，否则补：

```ts
export { ToastProvider, useToast } from "./Toast";
export { Drawer } from "./Drawer";
export { Skeleton } from "./Skeleton";
```

### 5. 应用 ThemeProvider（业务层）

每个 portal 的 `app/layout.tsx`：

```tsx
import { ThemeProvider, themeBootstrapScript } from "@vxture/design-system";

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <ThemeProvider defaultMode="system">{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### 6. 验收

```bash
pnpm lint:design
pnpm --filter @vxture/design-system lint
pnpm --filter @vxture/design-system type-check
pnpm --filter @vxture/design-system build

# 消费者 smoke test
pnpm --filter @vxture/website build
pnpm --filter @vxture/console build
```

## 使用示例

```tsx
import {
  ToastProvider,
  useToast,
  ModelBadge,
  GenerationStream,
  PromptInput,
  TokenCounter,
  ThemeProvider,
  useTheme,
  Drawer,
  Skeleton,
} from "@vxture/design-system";

function ChatPage() {
  const { theme, toggle } = useTheme();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [streaming, setStreaming] = useState(false);

  async function run() {
    setStreaming(true);
    // ... stream into setOutput
    setStreaming(false);
    toast({ tone: "success", title: "Generation complete" });
  }

  return (
    <div>
      <button onClick={toggle}>{theme === "dark" ? "☾" : "☀"}</button>

      <ModelBadge modelId="claude-haiku-4-5" status="active" />

      <PromptInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={run}
        busy={streaming}
        chips={[{ label: "@claude-haiku", active: true }]}
      />

      <GenerationStream
        text={output}
        streaming={streaming}
        modelId="claude-haiku-4-5"
        tokensProduced={output.length}
        tokensPerSecond={32}
      />

      <TokenCounter used={6240} total={8000} />
    </div>
  );
}
```
