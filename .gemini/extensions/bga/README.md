# BGA Gemini Extension

Background Agent (BGA) - 人机协作并行工作流系统的Gemini CLI扩展

## 概述

BGA Gemini扩展将强大的Background Agent工作流系统完整集成到Gemini CLI环境中，提供统一的命令行界面和无缝的工作流体验。

## 功能特性

- **智能规划生成**: 基于任务描述自动生成详细的执行规划
- **并行执行引擎**: 支持任务的并行和顺序执行模式
- **实时状态跟踪**: 实时监控任务执行进度和状态变更
- **多方反馈系统**: 支持用户、系统、代理多方反馈收集和管理
- **意图识别**: 智能识别用户意图，自动触发相应工作流
- **上下文管理**: 完整的项目上下文读取和管理机制

## 安装

将此扩展放置在以下位置之一：

- 工作区扩展: `<workspace>/.gemini/extensions/bga/`
- 全局扩展: `<home>/.gemini/extensions/bga/`

确保已安装Node.js (>=16.0.0)和npm依赖：

```bash
cd .gemini/extensions/bga
npm install
```

## 命令使用

### `/bga:plan` - 创建规划

创建新的BGA规划：

```bash
/bga:plan 重构项目代码结构，更新依赖包，修复已知bug
/bga:plan --title="数据库迁移项目" 将MySQL数据迁移到PostgreSQL
/bga:plan --priority=high 紧急修复生产环境安全漏洞
```

### `/bga:execute` - 执行规划

执行指定编号的规划：

```bash
/bga:execute P001
/bga:execute P002 --mode=parallel
/bga:execute P001 --tasks=1,3,5
/bga:execute P002 --dry-run
```

### `/bga:status` - 查看状态

查看规划状态和执行进度：

```bash
/bga:status
/bga:status P001
/bga:status P002 --detail --reports
/bga:status --active-only
```

### `/bga:feedback` - 管理反馈

管理规划反馈和建议：

```bash
/bga:feedback P001
/bga:feedback P001 add --content="建议优化任务3的执行逻辑" --type=task_optimization
/bga:feedback P001 update --feedback-id=fb_001 --status=adopted
```

## 配置

扩展配置在 `gemini-extension.json` 中定义：

- **MCP服务器**: 自动配置BGA后端服务
- **工具排除**: 预设安全的工具排除规则
- **上下文文件**: 自动加载BGA.md提供完整上下文
- **扩展设置**: 支持自定义BGA行为参数

## 工作流程

1. **意图识别**: 自动识别用户输入中的BGA触发条件
2. **规划生成**: 基于任务描述生成详细执行规划
3. **用户确认**: 提供规划审核和修改机制
4. **执行监控**: 实时跟踪执行进度和状态变更
5. **结果交付**: 生成详细的执行报告和结果文档
6. **反馈收集**: 多方反馈收集和持续改进机制

## 扩展架构

```
.gemini/extensions/bga/
├── gemini-extension.json    # 扩展配置
├── commands/               # 命令定义
│   ├── plan.toml          # 规划创建命令
│   ├── execute.toml       # 规划执行命令
│   ├── status.toml        # 状态查询命令
│   └── feedback.toml      # 反馈管理命令
├── BGA.md                 # 上下文文件
├── bga-server.js          # MCP服务器
├── package.json           # Node.js配置
└── README.md              # 说明文档
```

## 与其他扩展的兼容性

BGA扩展遵循Gemini CLI扩展标准，具有最低优先级，支持：

- **命名冲突解决**: 自动处理与其他扩展的命令冲突
  - 无冲突时使用自然名称：`/plan`, `/execute`, `/status`, `/feedback`
  - 有冲突时自动添加前缀：`/bga.plan`, `/bga.execute`, `/bga.status`, `/bga.feedback`
- **独立配置**: 独立的MCP服务器和配置管理
- **资源隔离**: 不干扰其他扩展的正常运行
- **优先级规则**: 用户命令 > 项目命令 > 扩展命令（BGA）

## 故障排查

### 常见问题

1. **命令未识别**: 检查扩展是否正确安装在指定目录
2. **MCP服务器启动失败**: 确认Node.js版本和npm依赖安装
3. **权限问题**: 确保对工作区目录有读写权限
4. **规划创建失败**: 检查todos目录的可访问性

### 调试模式

启用详细日志输出：

```bash
export BGA_DEBUG=true
/bga:status
```

### 服务器重启

重启MCP服务器：

```bash
cd .gemini/extensions/bga
npm restart
```

## 版本信息

- **扩展版本**: 1.4.0
- **BGA规范**: v1.4.0
- **MCP SDK**: ^0.4.0
- **Node.js**: >=16.0.0
- **Gemini CLI**: >=1.0.0

## 支持和社区

- **GitHub**: https://github.com/background-agent/bga-gemini-extension
- **文档**: https://docs.background-agent.com/gemini-extension
- **问题反馈**: https://github.com/background-agent/bga-gemini-extension/issues

## 许可证

MIT License - 详见 LICENSE 文件