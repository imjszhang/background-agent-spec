# BGA Gemini扩展架构设计

## 扩展概览

BGA (Background Agent) Gemini扩展是将Background Agent工作流系统完整集成到Gemini CLI环境的扩展。该扩展提供统一的命令行界面，支持BGA的所有核心功能。

## 架构组件

### 1. 扩展目录结构

```
.gemini/extensions/bga/
├── gemini-extension.json          # 扩展配置文件
├── commands/                      # 命令定义目录
│   ├── plan.toml                 # 创建新规划命令
│   ├── execute.toml              # 执行规划命令  
│   ├── status.toml               # 查看状态命令
│   └── feedback.toml             # 反馈管理命令
├── BGA.md                        # 上下文文件
├── bga-server.js                 # MCP服务器实现
└── package.json                  # Node.js依赖配置
```

### 2. 核心集成点

#### 2.1 Gemini CLI扩展系统
- **扩展发现**: 通过`gemini-extension.json`被Gemini CLI自动发现
- **命令注册**: 通过`commands/`目录下的TOML文件注册BGA命令
- **上下文集成**: 通过`BGA.md`为Gemini提供BGA工作流的完整上下文
- **MCP服务器**: 通过`mcpServers`配置集成BGA的后端服务

#### 2.2 BGA工作流系统
- **意图识别**: 集成BGA v1.4.0的智能意图识别引擎
- **规划管理**: 支持P001-P999规划编号系统
- **执行引擎**: 集成并行执行和状态跟踪机制
- **反馈系统**: 支持多方反馈和自动评估机制

### 3. 命令映射设计

#### 3.1 核心命令
```
/bga:plan        # 创建新规划
/bga:execute     # 执行指定规划
/bga:status      # 查看规划状态  
/bga:feedback    # 管理反馈
```

#### 3.2 命令冲突解决
- **无冲突**: 使用自然名称（如`/plan`，如果无冲突）
- **有冲突**: 自动添加扩展前缀（如`/bga.plan`）
- **优先级**: 扩展命令优先级最低，用户和项目命令优先

### 4. MCP服务器架构

#### 4.1 服务器实现 (bga-server.js)
```javascript
// BGA MCP服务器核心功能
class BGAMCPServer {
  // 工作流核心接口
  async createPlan(request) { /* 规划生成逻辑 */ }
  async executePlan(planId) { /* 规划执行逻辑 */ }
  async getStatus(planId) { /* 状态查询逻辑 */ }
  async manageFeedback(planId, feedback) { /* 反馈管理逻辑 */ }
  
  // 意图识别引擎
  async identifyIntent(userInput) { /* 意图识别逻辑 */ }
  
  // 自动反馈系统
  async autoFeedback(planId, type) { /* 自动反馈逻辑 */ }
}
```

#### 4.2 服务器配置
```json
{
  "name": "bga-server",
  "command": "node bga-server.js",
  "env": {
    "BGA_WORKSPACE": ".",
    "BGA_TODOS_DIR": "todos"
  }
}
```

### 5. 上下文文件设计 (BGA.md)

#### 5.1 内容结构
```markdown
# Background Agent (BGA) Gemini扩展

## 扩展概述
- BGA工作流系统的完整介绍
- 扩展功能和使用场景

## 命令使用指南
- 每个命令的详细使用说明
- 参数说明和示例

## 工作流规范
- BGA v1.4.0完整规范
- 触发条件和执行流程

## 最佳实践
- 常用工作流场景
- 故障排查指南
```

### 6. 数据流设计

#### 6.1 命令执行流程
```
用户输入 → Gemini CLI → TOML命令解析 → MCP服务器调用 → BGA工作流执行 → 结果返回
```

#### 6.2 状态同步机制
```
MCP服务器 ↔ todos/目录 ↔ 规划文件 ↔ 执行报告
```

### 7. 错误处理和安全

#### 7.1 错误处理策略
- **工具排除**: 配置`excludeTools`避免危险操作
- **权限控制**: 限制文件系统访问范围
- **错误恢复**: 实现断点续执和状态回滚

#### 7.2 安全考虑
- **沙箱隔离**: MCP服务器运行在隔离环境
- **输入验证**: 严格验证用户输入和规划参数
- **文件保护**: 防止意外删除重要文件

### 8. 性能优化

#### 8.1 并发处理
- **异步执行**: 支持多个规划并行执行
- **资源管理**: 智能资源分配和冲突检测
- **缓存机制**: 缓存常用数据和上下文信息

#### 8.2 扩展兼容性
- **版本兼容**: 支持BGA工作流的版本升级
- **扩展共存**: 与其他Gemini扩展和谐共存
- **配置隔离**: 独立的配置和数据存储

## 实现路径

### 阶段1: 基础架构
1. 创建扩展配置文件 (gemini-extension.json)
2. 实现基础MCP服务器
3. 创建核心命令TOML文件

### 阶段2: 功能集成
1. 集成BGA工作流引擎
2. 实现命令处理逻辑
3. 创建上下文文件

### 阶段3: 优化完善
1. 实现冲突解决机制
2. 性能优化和错误处理
3. 文档和测试完善

## 预期收益

### 用户体验
- **统一界面**: 通过Gemini CLI统一访问BGA功能
- **简化操作**: 减少复杂的配置和设置步骤
- **无缝集成**: 与现有Gemini工作流完美融合

### 技术优势
- **标准化**: 遵循Gemini扩展标准，确保兼容性
- **可扩展**: 支持功能扩展和版本升级
- **可维护**: 清晰的架构设计，便于维护和调试

### 生态价值
- **示范作用**: 为其他AI工作流系统提供集成参考
- **社区贡献**: 丰富Gemini扩展生态系统
- **标准推动**: 推动AI辅助工具的标准化发展