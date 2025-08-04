# BGA扩展命名冲突解决机制

## 概述

BGA Gemini扩展遵循Gemini CLI的标准冲突解决机制，确保与其他扩展的和谐共存。

## 冲突解决优先级

根据Gemini CLI扩展规范，命令优先级从高到低为：

1. **用户命令** - 用户在工作区定义的自定义命令
2. **项目命令** - 项目级别的自定义命令  
3. **扩展命令** - 扩展提供的命令（包括BGA）

## BGA命令冲突处理

### 默认命令名称

当没有冲突时，BGA扩展使用以下自然命名：

```
/plan      -> BGA规划创建命令
/execute   -> BGA规划执行命令
/status    -> BGA状态查询命令
/feedback  -> BGA反馈管理命令
```

### 冲突时的自动重命名

当发生命名冲突时，Gemini CLI会自动为BGA命令添加扩展前缀：

```
/bga.plan      -> BGA规划创建命令 [bga]
/bga.execute   -> BGA规划执行命令 [bga]
/bga.status    -> BGA状态查询命令 [bga]
/bga.feedback  -> BGA反馈管理命令 [bga]
```

### 命令显示格式

在help和命令列表中，冲突解决后的命令会显示为：

```
/plan      - Creates a new BGA plan
/bga.plan  - [bga] Creates a new BGA plan
```

## 冲突场景示例

### 场景1：与用户命令冲突

如果用户定义了自己的`/plan`命令：

```toml
# 用户的 .gemini/commands/plan.toml
[command]
name = "plan"
description = "My custom plan command"
```

结果：
- `/plan` → 执行用户的自定义plan命令
- `/bga.plan` → 执行BGA的规划创建命令

### 场景2：与项目命令冲突

如果项目定义了`/execute`命令：

```toml
# 项目的 .gemini/commands/execute.toml
[command]
name = "execute"
description = "Project specific execute command"
```

结果：
- `/execute` → 执行项目的execute命令
- `/bga.execute` → 执行BGA的规划执行命令

### 场景3：与其他扩展冲突

如果另一个扩展也提供了`/status`命令：

- 优先级取决于扩展的加载顺序
- 两个扩展命令都会被重命名为带前缀的版本
- `/extension1.status` 和 `/bga.status`

## 配置选项

### 扩展配置

在`gemini-extension.json`中的相关配置：

```json
{
  "name": "bga",
  "version": "1.4.0",
  "description": "Background Agent (BGA) - 人机协作并行工作流系统的Gemini CLI扩展"
}
```

扩展名称`"bga"`决定了冲突时使用的前缀。

### 命令文件配置

每个TOML命令文件都正确配置了名称：

```toml
# commands/plan.toml
[command]
name = "plan"
description = "创建新的BGA规划"

# commands/execute.toml  
[command]
name = "execute"
description = "执行指定的BGA规划"

# commands/status.toml
[command]
name = "status" 
description = "查看BGA规划状态和执行进度"

# commands/feedback.toml
[command]
name = "feedback"
description = "管理BGA规划的反馈和建议"
```

## 用户指导

### 检查命令可用性

用户可以通过以下方式检查BGA命令的可用性：

```bash
# 查看所有可用命令
gemini help

# 查看特定命令帮助
gemini help plan
gemini help bga.plan
```

### 使用冲突后的命令

当发生冲突时，用户应该：

1. **明确意图**：确认要使用哪个命令（用户/项目/BGA）
2. **使用完整名称**：使用`/bga.command`格式调用BGA命令
3. **更新文档**：在项目文档中说明命令的使用方式

### 避免冲突的建议

为了减少冲突，建议：

1. **命名空间化**：用户和项目命令使用描述性前缀
2. **检查现有命令**：在添加新命令前检查是否冲突
3. **文档说明**：在项目README中说明命令的用途和冲突处理

## 测试冲突解决

### 测试场景

创建测试用例验证冲突解决机制：

```bash
# 1. 创建测试用户命令
mkdir -p .gemini/commands
cat > .gemini/commands/plan.toml << EOF
[command]
name = "plan"
description = "Test user plan command"
usage = "/plan"

[command.help]
text = "This is a test user command that conflicts with BGA plan"
EOF

# 2. 验证命令列表
gemini help | grep plan

# 3. 测试命令执行
gemini plan --help      # 应该显示用户命令帮助
gemini bga.plan --help  # 应该显示BGA命令帮助
```

### 验证点

确认以下行为正确：

1. **命令发现**：Gemini CLI正确发现并加载BGA扩展
2. **冲突检测**：正确识别命名冲突
3. **自动重命名**：BGA命令自动添加`bga.`前缀
4. **功能正常**：重命名后的命令功能完全正常
5. **帮助显示**：help系统正确显示冲突标记

## 调试冲突问题

### 常见问题

1. **命令未出现在帮助中**
   - 检查扩展是否正确安装
   - 确认TOML文件语法正确
   - 验证扩展配置有效

2. **冲突后命令不工作**
   - 检查MCP服务器状态
   - 确认命令映射正确
   - 验证工具权限设置

3. **前缀不正确**
   - 检查gemini-extension.json中的name字段
   - 确认扩展目录名称与配置一致

### 调试命令

```bash
# 检查扩展状态
gemini extensions list

# 检查命令注册
gemini commands list

# 检查MCP服务器
gemini mcp status

# 详细调试信息
export GEMINI_DEBUG=true
gemini help
```

## 总结

BGA扩展的冲突解决机制：

1. **自动化**：完全依赖Gemini CLI的自动冲突解决
2. **标准化**：遵循Gemini扩展规范的优先级规则
3. **透明化**：用户可以清楚地了解冲突状态和解决方案
4. **可靠性**：确保BGA功能在任何冲突情况下都能正常使用

这种设计确保了BGA扩展能够与任何其他Gemini扩展和用户命令和谐共存。