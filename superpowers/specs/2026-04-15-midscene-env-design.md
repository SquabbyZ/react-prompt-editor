# Midscene Env Integration Design

## 背景

当前项目已经接入了 `Playwright` 和可选的 `Midscene` 集成，但环境变量仍需要用户手动在终端中 `export`。

这会带来两个问题：

1. 本地使用成本高，每次运行测试都要重复设置变量
2. `Playwright`、后续脚本和其他测试入口无法统一复用同一份配置

用户当前使用的是阿里百炼 API Key，希望同时满足：

- `Playwright/Midscene` 能直接读取 `.env`
- 项目后续其他脚本也能复用同一套 `.env`

## 目标

本轮为项目补充统一的 `.env` 读取能力，并兼容 `Midscene` 所需变量。

需要满足：

1. 支持项目根目录 `.env`
2. 补充 `.env.example` 作为配置模板
3. `.gitignore` 忽略真实 `.env`
4. `playwright.config.ts` 自动加载 `.env`
5. `e2e/midscene.ts` 自动加载 `.env`
6. 默认示例对齐阿里百炼 OpenAI 兼容接口

## 非目标

- 不接入复杂多环境配置体系，例如 `.env.local`、`.env.test`、`.env.production`
- 不在本轮改造 `Vitest` 或其他脚本的变量解析逻辑，只保证统一入口可被后续复用
- 不在仓库中写入真实 API Key

## 变量设计

优先支持以下变量：

- `MIDSCENE_MODEL_NAME`
- `MIDSCENE_MODEL_API_KEY`
- `MIDSCENE_MODEL_BASE_URL`
- `MIDSCENE_MODEL_FAMILY`

同时保留当前兼容逻辑：

- 如果缺少 `MIDSCENE_MODEL_API_KEY`，允许继续回退到 `OPENAI_API_KEY`

## 阿里百炼默认示例

`.env.example` 默认提供以下示例值：

```bash
MIDSCENE_MODEL_NAME=qwen-vl-max-latest
MIDSCENE_MODEL_API_KEY=your_dashscope_api_key
MIDSCENE_MODEL_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MIDSCENE_MODEL_FAMILY=qwen2.5-vl
```

说明：

- 当前 `Midscene 1.7.3` 对百炼视觉模型应使用 `qwen2.5-vl`
- 如用户后续改用其他视觉模型，需要同步调整 family 与模型名

## 实现设计

### 1. `.env.example`

新增根目录 `.env.example`，只放示例，不放真实密钥。

### 2. `.gitignore`

新增 `.env` 忽略规则，防止真实密钥误提交。

### 3. `dotenv` 加载入口

通过 `dotenv/config` 在以下入口自动加载：

- `playwright.config.ts`
- `e2e/midscene.ts`

这样保证：

- 运行 `playwright test` 时可以直接读取 `.env`
- Midscene 辅助逻辑在单独引用时也能读取 `.env`

### 4. 文档补充

在测试说明中补一段简单说明：

- 复制 `.env.example` 为 `.env`
- 填入百炼 API Key
- 运行 `pnpm test:e2e`

## 验收标准

完成后至少满足：

1. 项目根目录放置 `.env` 后，`Playwright` 与 `Midscene` 可直接读取配置
2. `.env.example` 提供阿里百炼可用示例
3. 真实 `.env` 不会被 git 跟踪
4. 未配置 `.env` 时，现有基础 smoke 测试行为不退化
