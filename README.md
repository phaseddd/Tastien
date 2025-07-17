# Tastien - 游戏组队效率系统

一个专为游戏玩家设计的组队效率系统，帮助玩家快速找到合适的队友，提高游戏体验。

## 🚀 功能特性

- **智能匹配** - 基于战力、职业、时间等多维度匹配
- **实时组队** - 支持创建、加入、管理组队房间
- **时间协调** - 智能时间安排和提醒
- **信誉系统** - 队友评价和信誉积分
- **数据统计** - 详细的组队数据分析
- **响应式设计** - 支持桌面端和移动端

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **UI组件库**: Ant Design 5.x
- **状态管理**: Zustand
- **路由管理**: React Router v6
- **HTTP客户端**: Axios
- **时间处理**: Day.js
- **构建工具**: Vite
- **测试框架**: Vitest + Testing Library
- **代码规范**: ESLint + Prettier

## 📦 安装和运行

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量模板：
```bash
cp .env.example .env.local
```

2. 配置GitHub相关信息：
```env
VITE_GITHUB_TOKEN=your_github_token_here
VITE_GITHUB_USERNAME=your_github_username
VITE_GIST_ID=your_gist_id_here
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000/Tastien/

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🧪 测试

### 运行测试

```bash
npm run test
```

### 测试覆盖率

```bash
npm run test:coverage
```

### 测试UI界面

```bash
npm run test:ui
```

## 📝 代码规范

### 代码检查

```bash
npm run lint
```

### 自动修复

```bash
npm run lint:fix
```

### 代码格式化

```bash
npm run format
```

### 类型检查

```bash
npm run type-check
```

## 📁 项目结构

```
src/
├── components/          # 通用组件
│   ├── common/         # 基础组件
│   └── layout/         # 布局组件
├── pages/              # 页面组件
│   ├── Home/           # 首页
│   ├── Profile/        # 个人资料
│   ├── Teams/          # 组队大厅
│   └── Statistics/     # 数据统计
├── hooks/              # 自定义Hook
├── services/           # API服务
├── stores/             # 状态管理
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
├── constants/          # 常量配置
└── test/               # 测试文件
```

## 🔧 开发指南

### 组件开发

1. 使用TypeScript编写组件
2. 遵循React Hooks最佳实践
3. 使用Ant Design组件库
4. 编写单元测试

### 状态管理

使用Zustand进行状态管理：

```typescript
import { useAppStore } from '@/stores';

const { user, actions } = useAppStore();
```

### 路径别名

项目配置了路径别名，可以使用：

```typescript
import { UserProfile } from '@/types';
import { useRooms } from '@/hooks';
import { gistService } from '@/services/gistService';
```

### 工具函数

```typescript
import { formatTime, generateId, storage } from '@/utils';
```

## 🚀 部署

项目配置为部署到GitHub Pages：

1. 推送代码到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择GitHub Actions作为部署源
4. 代码推送后自动构建和部署

## 📊 性能优化

- **代码分割** - 使用动态导入和懒加载
- **Bundle分析** - `npm run analyze`
- **缓存策略** - 合理使用浏览器缓存
- **图片优化** - 使用SVG格式图标

## 🐛 问题排查

### 常见问题

1. **端口占用**: 修改vite.config.ts中的端口配置
2. **依赖冲突**: 删除node_modules重新安装
3. **类型错误**: 运行`npm run type-check`检查

### 调试技巧

- 使用React DevTools
- 查看浏览器控制台
- 使用Vite的HMR功能

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码
4. 创建Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请提交Issue或联系开发团队。

---

**Happy Coding! 🎮**
