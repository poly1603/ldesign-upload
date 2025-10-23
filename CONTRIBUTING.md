# Contributing to @ldesign/upload

感谢您考虑为 @ldesign/upload 做出贡献！

## 🚀 开发设置

### 1. 克隆仓库
```bash
git clone https://github.com/ldesign/upload.git
cd upload
```

### 2. 安装依赖
```bash
pnpm install
```

### 3. 开发模式
```bash
pnpm dev
```

### 4. 构建
```bash
pnpm build
```

### 5. 运行测试
```bash
pnpm test
```

---

## 📁 项目结构

```
libraries/upload/
├── src/                 # 源代码
│   ├── core/           # 核心类
│   ├── ui/             # UI 组件
│   ├── processors/     # 处理器
│   ├── adapters/       # 存储适配器
│   ├── framework-adapters/ # 框架适配器
│   ├── utils/          # 工具函数
│   ├── styles/         # 样式
│   └── types/          # 类型定义
├── examples/           # 示例项目
├── docs/              # 文档
└── tests/             # 测试
```

---

## 🔧 开发指南

### 代码风格

- 使用 TypeScript
- 遵循 ESLint 规则
- 添加 JSDoc 注释
- 保持代码简洁

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 其他
```

### 测试

- 为新功能添加测试
- 确保所有测试通过
- 保持测试覆盖率

---

## 📝 Pull Request 流程

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 🐛 报告 Bug

使用 GitHub Issues 报告 bug，请包含：

- 问题描述
- 重现步骤
- 期望行为
- 实际行为
- 环境信息（浏览器、版本等）

---

## 💡 功能请求

我们欢迎新功能建议！请创建 Issue 并包含：

- 功能描述
- 使用场景
- 可能的实现方案

---

## 📄 License

通过贡献，您同意您的代码使用 MIT 许可证。

---

感谢您的贡献！❤️

