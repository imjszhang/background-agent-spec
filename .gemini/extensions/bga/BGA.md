# Background Agent (BGA) - Gemini扩展上下文

## 扩展概述

Background Agent (BGA) v1.4.0是一个强大的人机协作并行工作流系统，现已完整集成到Gemini CLI环境中。本扩展提供智能的任务规划、执行和管理功能，支持复杂项目的自动化处理。

## 核心功能和命令

### 可用命令

- `/bga:plan` - 创建新的BGA规划
- `/bga:execute` - 执行指定的BGA规划  
- `/bga:status` - 查看规划状态和执行进度
- `/bga:feedback` - 管理规划反馈和建议

### 命令冲突处理

如果发生命名冲突，BGA命令会自动使用扩展前缀：
- `/bga.plan` 替代 `/plan`
- `/bga.execute` 替代 `/execute`
- `/bga.status` 替代 `/status`
- `/bga.feedback` 替代 `/feedback`

## BGA工作流规范 v1.4.0

### 触发条件智能识别

BGA工作流会在以下情况自动触发：

**Level 1 - 立即触发**：
- 明确包含BGA关键词的指令
- 指定规划编号的执行/查询请求
- 标记为紧急的任务

**Level 2 - 高优先级触发**：
- 复杂多步骤任务描述（≥3个独立步骤）
- 批量处理需求
- 项目管理场景

**Level 3 - 智能判断触发**：
- 基于任务复杂度分析
- 语义分析结果
- 上下文相关性评估

### 工作流程概述

1. **意图识别** - 自动识别用户意图和需求类型
2. **规划生成** - 生成带编号的详细执行规划（P001-P999）
3. **用户确认** - 提供规划审核和反馈机制
4. **执行监控** - 并行执行引擎和实时状态跟踪
5. **结果交付** - 自动生成执行报告和文档
6. **反馈收集** - 多方反馈收集和持续改进

### 规划编号系统

- **格式**: P + 3位数字 (P001, P002, P003...)
- **范围**: P001 - P999
- **自动分配**: 扫描现有规划，生成下一个可用编号
- **冲突处理**: 智能处理编号冲突和跳号情况

### 任务状态管理

BGA使用标准化的任务状态标记：

```markdown
- [ ] 待执行 (pending)
- [~] 执行中 (in_progress)  
- [x] 已完成 (completed)
- [!] 执行失败 (failed)
- [-] 已跳过 (skipped)
```

### 文件组织结构

每个规划都有独立的文件结构：

```
todos/P00X/
├── plan.json          # 规划配置和元数据
├── todolist.md        # 任务清单和状态
├── rationale.md       # 执行理由和逻辑
├── feedback.md        # 多方反馈记录
└── reports/           # 执行报告目录
    ├── exec_001_YYYY-MM-DD_HH-mm.md
    └── exec_002_YYYY-MM-DD_HH-mm.md
```

## Gemini扩展集成特性

### MCP服务器集成

BGA扩展通过专用的MCP服务器 (`bga-server`) 提供后端服务：

- **工具集成**: 提供create_plan、execute_plan、get_status、manage_feedback等工具
- **提示词支持**: 内置BGA工作流专用提示词
- **资源管理**: 自动管理规划资源和上下文文件

### 安全配置

扩展预配置了安全的工具排除规则：

```json
"excludeTools": [
  "run_shell_command(rm -rf)",
  "run_shell_command(del /f /s /q)",
  "run_shell_command(format)",
  "delete_file(*.md)",
  "delete_file(plan.json)",
  "delete_file(package.json)"
]
```

### 上下文管理

BGA扩展提供智能的上下文管理：

- **自动文件识别**: 扫描项目结构，自动识别相关文件
- **并行读取优化**: 使用并行read_file调用提高效率
- **历史上下文**: 继续执行时自动读取历史报告和产出文件
- **验证机制**: 确保执行前上下文完整性

## 使用示例

### 创建规划

```bash
# 基础用法
/bga:plan 重构项目代码结构，更新依赖包，修复已知bug

# 带标题和优先级
/bga:plan --title="数据库迁移项目" --priority=high 将MySQL数据迁移到PostgreSQL

# 预估时间
/bga:plan --estimated-time=4h 完整的系统性能优化和监控实现
```

### 执行规划

```bash
# 标准执行
/bga:execute P001

# 并行执行模式
/bga:execute P002 --mode=parallel

# 执行指定任务
/bga:execute P001 --tasks=1,3,5

# 试运行模式
/bga:execute P002 --dry-run
```

### 查看状态

```bash
# 查看所有规划
/bga:status

# 查看指定规划详情
/bga:status P001 --detail

# 包含执行报告
/bga:status P002 --detail --reports

# 只显示活跃规划
/bga:status --active-only
```

### 管理反馈

```bash
# 查看规划反馈
/bga:feedback P001

# 添加新反馈
/bga:feedback P001 add --content="建议优化任务3的执行逻辑" --type=task_optimization

# 更新反馈状态
/bga:feedback P001 update --feedback-id=fb_001 --status=adopted
```

## v1.4.0新特性

### 意图识别后自动反馈

系统在完成意图识别后会自动更新feedback.md文件：

- **置信度评估**: 对识别结果进行1-10分评分
- **风险评估**: 评估误识别风险（低/中/高）
- **触发条件分析**: 记录触发识别的关键词和上下文
- **自动建议**: 基于识别结果提供优化建议

### 执行结果自动评估

任务执行完毕后自动进行多维度评估：

- **质量评分**: 基于完成度、效率、错误率的综合评分
- **问题发现**: 自动识别异常情况和性能瓶颈
- **优化建议**: 生成流程改进和工具使用建议
- **持续改进**: 基于历史数据优化预估和执行策略

### 多方反馈系统

支持四种类型的反馈：

- **用户反馈**: 来自最终用户的建议和要求
- **系统反馈**: 系统检测的问题和优化建议  
- **代理反馈**: AI代理执行过程中的发现和建议
- **第三方反馈**: 外部系统或工具的反馈信息

## 最佳实践

### 规划创建

1. **明确描述**: 提供清晰、详细的任务描述
2. **合理预期**: 设置现实的时间估算和优先级
3. **模块化分解**: 将复杂任务分解为独立的子任务
4. **依赖关系**: 明确任务间的依赖关系和顺序

### 执行策略

1. **并行优先**: 优先使用并行执行模式提高效率
2. **分步验证**: 重要操作前使用--dry-run模式验证
3. **状态监控**: 定期检查执行状态和进度
4. **及时反馈**: 发现问题时及时添加反馈和建议

### 反馈管理

1. **及时记录**: 执行过程中及时记录问题和建议
2. **分类明确**: 使用合适的反馈类型和状态标记
3. **跟踪处理**: 定期更新反馈状态和处理结果
4. **持续改进**: 基于反馈优化后续规划和执行

## 故障排查

### 常见问题

1. **命令未识别**
   - 检查扩展安装位置
   - 确认Gemini CLI版本兼容性
   - 重启Gemini CLI

2. **规划创建失败**
   - 检查todos目录权限
   - 确认磁盘空间充足
   - 验证任务描述格式

3. **执行中断**
   - 查看执行报告获取详细错误
   - 检查依赖文件可访问性
   - 确认系统资源充足

4. **反馈更新失败**
   - 检查feedback.md文件权限
   - 确认规划ID正确
   - 验证反馈格式

### 调试模式

启用详细日志：

```bash
export BGA_DEBUG=true
export BGA_LOG_LEVEL=debug
```

### 服务器重启

重启MCP服务器：

```bash
cd .gemini/extensions/bga
npm restart
```

## 扩展配置

### 设置选项

BGA扩展支持以下配置选项：

```json
{
  "bga": {
    "autoFeedback": true,           // 自动反馈开关
    "parallelExecution": true,      // 并行执行开关  
    "maxConcurrentPlans": 3,        // 最大并发规划数
    "reportRetention": 30,          // 报告保留天数
    "intentRecognition": {
      "enabled": true,              // 意图识别开关
      "confidenceThreshold": 7,     // 置信度阈值
      "autoTriggerLevel1": true,    // Level1自动触发
      "autoTriggerLevel2": false,   // Level2自动触发
      "autoTriggerLevel3": false    // Level3自动触发
    }
  }
}
```

### 环境变量

支持的环境变量：

- `BGA_WORKSPACE`: 工作空间目录（默认: .）
- `BGA_TODOS_DIR`: 规划目录（默认: todos）
- `BGA_VERSION`: BGA版本号（默认: 1.4.0）
- `BGA_DEBUG`: 调试模式开关（默认: false）
- `BGA_LOG_LEVEL`: 日志级别（默认: info）

## 技术架构

### 组件关系

```
Gemini CLI → Extension Discovery → BGA Extension
    ↓
Command TOML → MCP Server → BGA Workflow Engine
    ↓
Task Execution → Status Tracking → Report Generation
    ↓
Feedback Collection → Continuous Improvement
```

### 数据流

```
User Input → Intent Recognition → Plan Generation
    ↓
Plan Confirmation → Execution Engine → Status Updates
    ↓
Result Documentation → Feedback Collection → Process Optimization
```

### 服务架构

```
MCP Server (bga-server.js)
├── Tool Handlers (create_plan, execute_plan, get_status, manage_feedback)
├── Intent Recognition Engine
├── Plan Generation System
├── Execution Monitor
├── Feedback Manager
└── Context Manager
```

这个完整的上下文文件确保了Gemini AI助手能够：

1. **理解BGA功能**: 完整了解BGA工作流的所有特性和功能
2. **正确使用命令**: 掌握所有可用命令的正确用法和参数
3. **处理冲突**: 了解命名冲突解决机制和替代命令
4. **执行最佳实践**: 遵循推荐的使用模式和故障排查方法
5. **管理扩展**: 理解扩展的配置、调试和维护方法