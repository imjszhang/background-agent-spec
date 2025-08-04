# BGA Gemini扩展安装指南

## 系统要求

### 必要条件

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0  
- **Gemini CLI**: >= 1.0.0
- **操作系统**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)

### 推荐配置

- **内存**: >= 4GB RAM
- **磁盘空间**: >= 500MB 可用空间
- **网络**: 稳定的互联网连接（用于依赖包下载）

## 安装方式

### 方式1：工作区级别安装（推荐）

适用于特定项目的BGA使用：

```bash
# 1. 进入你的项目目录
cd your-project

# 2. 创建扩展目录
mkdir -p .gemini/extensions

# 3. 克隆或复制BGA扩展
# 选项A: 从Git仓库克隆
git clone https://github.com/background-agent/bga-gemini-extension.git .gemini/extensions/bga

# 选项B: 手动复制文件
# 将BGA扩展文件复制到 .gemini/extensions/bga/ 目录

# 4. 安装依赖
cd .gemini/extensions/bga
npm install

# 5. 验证安装
gemini help | grep bga
```

### 方式2：全局级别安装

适用于在所有项目中使用BGA：

```bash
# 1. 创建全局扩展目录
mkdir -p ~/.gemini/extensions

# 2. 安装BGA扩展
# 选项A: 从Git仓库克隆
git clone https://github.com/background-agent/bga-gemini-extension.git ~/.gemini/extensions/bga

# 选项B: 使用npm全局安装（如果已发布）
npm install -g bga-gemini-extension
ln -s $(npm root -g)/bga-gemini-extension ~/.gemini/extensions/bga

# 3. 安装依赖
cd ~/.gemini/extensions/bga
npm install

# 4. 验证安装
gemini help | grep bga
```

## 安装验证

### 检查扩展注册

```bash
# 查看已安装的扩展
gemini extensions list

# 应该看到类似输出：
# bga (v1.4.0) - Background Agent工作流系统
```

### 检查命令可用性

```bash
# 查看BGA命令
gemini help | grep -E "(plan|execute|status|feedback)"

# 应该看到类似输出：
# /plan       - 创建新的BGA规划
# /execute    - 执行指定的BGA规划
# /status     - 查看BGA规划状态和执行进度
# /feedback   - 管理BGA规划的反馈和建议
```

### 检查MCP服务器

```bash
# 检查MCP服务器状态
gemini mcp status

# 应该看到bga-server在运行列表中
```

### 测试基本功能

```bash
# 测试状态查询（应该返回空的规划列表）
gemini status

# 或使用完整命令名（如果有冲突）
gemini bga.status
```

## 配置选项

### 基础配置

BGA扩展包含默认配置，通常无需修改。如需自定义，可编辑 `.gemini/extensions/bga/gemini-extension.json`：

```json
{
  "name": "bga",
  "version": "1.4.0",
  "mcpServers": {
    "bga-server": {
      "command": "node bga-server.js",
      "env": {
        "BGA_WORKSPACE": ".",
        "BGA_TODOS_DIR": "todos",
        "BGA_VERSION": "1.4.0"
      }
    }
  },
  "settings": {
    "bga": {
      "autoFeedback": true,
      "parallelExecution": true,
      "maxConcurrentPlans": 3
    }
  }
}
```

### 环境变量配置

可在shell配置文件（`.bashrc`, `.zshrc`, `.profile`）中设置：

```bash
# BGA扩展配置
export BGA_WORKSPACE="."          # 工作空间目录
export BGA_TODOS_DIR="todos"      # 规划存储目录
export BGA_VERSION="1.4.0"       # BGA版本
export BGA_DEBUG="false"          # 调试模式
export BGA_LOG_LEVEL="info"       # 日志级别
```

## 卸载指南

### 工作区级别卸载

```bash
# 1. 停止MCP服务器（如果在运行）
gemini mcp stop bga-server

# 2. 删除扩展目录
rm -rf .gemini/extensions/bga

# 3. 清理工作区数据（可选）
rm -rf todos/  # 注意：这会删除所有BGA规划数据

# 4. 验证卸载
gemini help | grep bga  # 应该没有输出
```

### 全局级别卸载

```bash
# 1. 停止MCP服务器
gemini mcp stop bga-server

# 2. 删除全局扩展
rm -rf ~/.gemini/extensions/bga

# 3. 卸载npm包（如果使用npm安装）
npm uninstall -g bga-gemini-extension

# 4. 验证卸载
gemini extensions list | grep bga  # 应该没有输出
```

## 故障排查

### 安装问题

#### 1. Node.js版本不兼容

```bash
# 检查Node.js版本
node --version

# 如果版本过低，更新Node.js
# macOS (使用Homebrew):
brew install node

# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows:
# 从 https://nodejs.org 下载并安装最新LTS版本
```

#### 2. npm依赖安装失败

```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules并重新安装
cd .gemini/extensions/bga
rm -rf node_modules package-lock.json
npm install

# 如果仍然失败，尝试使用yarn
npm install -g yarn
yarn install
```

#### 3. 权限问题

```bash
# Linux/macOS: 修复权限
sudo chown -R $(whoami) ~/.gemini/extensions/bga
chmod -R 755 ~/.gemini/extensions/bga

# Windows: 以管理员身份运行PowerShell
# 或确保对目录有完整读写权限
```

### 运行时问题

#### 1. 命令未识别

```bash
# 检查扩展是否正确加载
gemini extensions list

# 重启Gemini CLI
gemini restart

# 检查扩展配置
cat .gemini/extensions/bga/gemini-extension.json
```

#### 2. MCP服务器启动失败

```bash
# 检查Node.js可执行性
node .gemini/extensions/bga/bga-server.js --version

# 检查依赖
cd .gemini/extensions/bga
npm list

# 手动启动服务器进行调试
export BGA_DEBUG=true
node bga-server.js
```

#### 3. 规划创建失败

```bash
# 检查todos目录权限
ls -la todos/

# 创建todos目录（如果不存在）
mkdir -p todos

# 检查磁盘空间
df -h
```

### 诊断工具

#### 系统信息收集

```bash
# 创建诊断脚本
cat > bga-diagnostic.sh << 'EOF'
#!/bin/bash
echo "=== BGA Gemini扩展诊断报告 ==="
echo "时间: $(date)"
echo
echo "=== 系统信息 ==="
echo "操作系统: $(uname -a)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Gemini CLI: $(gemini --version)"
echo
echo "=== 扩展状态 ==="
echo "扩展列表:"
gemini extensions list
echo
echo "=== BGA扩展文件 ==="
echo "扩展目录:"
find .gemini/extensions/bga -type f -name "*.json" -o -name "*.js" -o -name "*.toml" 2>/dev/null | head -10
echo
echo "=== MCP服务器状态 ==="
gemini mcp status | grep bga
echo
echo "=== 最近错误日志 ==="
# 如果有日志文件的话
tail -5 ~/.gemini/logs/*.log 2>/dev/null | grep bga
EOF

chmod +x bga-diagnostic.sh
./bga-diagnostic.sh
```

#### 详细调试

```bash
# 启用详细日志
export GEMINI_DEBUG=true
export BGA_DEBUG=true
export BGA_LOG_LEVEL=debug

# 运行命令查看详细输出
gemini status --verbose
```

## 获取帮助

### 文档资源

- **项目主页**: https://github.com/background-agent/bga-gemini-extension
- **用户文档**: https://docs.background-agent.com/gemini-extension
- **API文档**: https://docs.background-agent.com/api
- **示例项目**: https://github.com/background-agent/examples

### 社区支持

- **GitHub Issues**: https://github.com/background-agent/bga-gemini-extension/issues
- **讨论区**: https://github.com/background-agent/bga-gemini-extension/discussions
- **Stack Overflow**: 标签 `bga-gemini-extension`

### 报告Bug

提交bug报告时，请包含：

1. **系统信息**: 操作系统、Node.js、Gemini CLI版本
2. **BGA版本**: `cat .gemini/extensions/bga/package.json | grep version`
3. **重现步骤**: 详细的操作步骤
4. **错误信息**: 完整的错误日志
5. **诊断报告**: 运行上述诊断脚本的输出

### 功能请求

在GitHub Issues中提交功能请求，包含：

1. **用例描述**: 详细说明使用场景
2. **期望行为**: 希望实现的功能
3. **替代方案**: 当前的解决方法
4. **影响评估**: 对现有功能的潜在影响