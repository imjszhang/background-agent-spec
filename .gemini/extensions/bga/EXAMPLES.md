# BGA Gemini扩展使用示例

## 基础使用示例

### 示例1：简单项目重构

**场景**: 重构一个Node.js项目的代码结构

```bash
# 1. 创建规划
/bga:plan 重构Node.js项目代码结构，包括模块分离、依赖更新、测试补充

# 系统会生成类似P001的规划，输出：
# ✅ 规划 P001 创建成功！
# 
# 标题: 重构Node.js项目代码结构
# 描述: 重构Node.js项目代码结构，包括模块分离、依赖更新、测试补充
# 预估任务数: 6
# 复杂度: medium
# 
# 请使用 /bga:execute P001 开始执行规划。

# 2. 查看规划详情
/bga:status P001 --detail

# 3. 执行规划
/bga:execute P001

# 4. 监控进度
/bga:status P001 --detail --reports

# 5. 执行完成后查看反馈
/bga:feedback P001
```

### 示例2：数据库迁移项目

**场景**: 将MySQL数据迁移到PostgreSQL

```bash
# 1. 创建高优先级规划
/bga:plan --title="数据库迁移项目" --priority=high --estimated-time=6h \
  将现有MySQL数据库完整迁移到PostgreSQL，包括架构转换、数据迁移、索引重建、性能优化

# 输出：规划 P002 创建成功

# 2. 在执行前进行试运行
/bga:execute P002 --dry-run

# 3. 确认无误后正式执行
/bga:execute P002 --mode=sequential  # 使用顺序模式确保数据安全

# 4. 执行过程中添加反馈
/bga:feedback P002 add --content="迁移过程中发现索引性能问题，建议优化" --type=performance

# 5. 查看最终报告
/bga:status P002 --detail --reports
```

### 示例3：批量文件处理

**场景**: 批量处理和转换图片文件

```bash
# 1. 创建批量处理规划
/bga:plan 批量处理photos目录下的1000张图片，包括格式转换、大小调整、水印添加、分类存储

# 2. 执行特定任务（只执行任务1和3）
/bga:execute P003 --tasks=1,3

# 3. 查看执行状态
/bga:status P003

# 4. 继续执行剩余任务
/bga:execute P003 --tasks=2,4,5

# 5. 查看完整执行历史
/bga:status P003 --detail --reports
```

## 高级使用示例

### 示例4：多项目协调开发

**场景**: 同时开发前端、后端和移动端应用

```bash
# 1. 创建前端项目规划
/bga:plan --title="前端开发" 开发React前端应用，包括组件开发、状态管理、路由配置、API集成

# 2. 创建后端项目规划  
/bga:plan --title="后端开发" 开发Node.js后端API，包括数据库设计、接口开发、认证系统、部署配置

# 3. 创建移动端项目规划
/bga:plan --title="移动端开发" 开发React Native移动应用，包括导航、状态同步、推送通知、发布准备

# 4. 查看所有活跃项目
/bga:status --active-only

# 5. 并行执行多个项目
/bga:execute P004 &
/bga:execute P005 &
/bga:execute P006 &

# 6. 监控所有项目状态
/bga:status
```

### 示例5：CI/CD流水线搭建

**场景**: 为项目建立完整的CI/CD流水线

```bash
# 1. 创建CI/CD规划
/bga:plan --title="CI/CD流水线" --priority=high \
  建立完整的CI/CD流水线，包括GitHub Actions配置、自动化测试、Docker容器化、生产部署

# 2. 分阶段执行
# 第一阶段：基础设施
/bga:execute P007 --tasks=1,2,3

# 等待第一阶段完成，查看状态
/bga:status P007 --detail

# 第二阶段：自动化测试
/bga:execute P007 --tasks=4,5

# 第三阶段：部署配置
/bga:execute P007 --tasks=6,7,8

# 3. 添加执行反馈
/bga:feedback P007 add --content="Docker构建时间较长，建议优化镜像层" --type=performance

# 4. 查看完整项目报告
/bga:status P007 --detail --reports
```

### 示例6：大规模重构项目

**场景**: 重构大型遗留系统

```bash
# 1. 创建大型重构规划
/bga:plan --title="系统重构" --estimated-time=20h \
  重构遗留系统，包括架构现代化、代码分离、数据库优化、性能提升、文档更新

# 2. 强制执行（跳过某些验证）- 谨慎使用
/bga:execute P008 --force --mode=parallel

# 3. 执行过程中管理反馈
# 添加系统反馈
/bga:feedback P008 add --content="检测到循环依赖，需要重新设计模块结构" --type=task_optimization

# 更新反馈状态
/bga:feedback P008 update --feedback-id=fb_001 --status=processing

# 4. 监控长时间运行的任务
while true; do
  /bga:status P008 --detail
  sleep 300  # 每5分钟检查一次
done
```

## 错误处理示例

### 示例7：处理执行失败

**场景**: 当任务执行失败时的恢复处理

```bash
# 1. 创建可能失败的规划
/bga:plan 下载并处理大量网络资源，包括数据获取、验证、转换、存储

# 2. 执行规划
/bga:execute P009

# 3. 发现执行失败，查看详细状态
/bga:status P009 --detail --reports

# 4. 添加失败原因反馈
/bga:feedback P009 add --content="网络超时导致任务3失败，建议增加重试机制" --type=task_optimization

# 5. 只重新执行失败的任务
/bga:execute P009 --tasks=3

# 6. 更新反馈状态
/bga:feedback P009 update --feedback-id=fb_002 --status=adopted
```

### 示例8：调试和优化

**场景**: 使用BGA的调试功能优化执行效果

```bash
# 1. 启用调试模式
export BGA_DEBUG=true
export BGA_LOG_LEVEL=debug

# 2. 创建测试规划
/bga:plan --title="性能测试" 测试系统各组件性能，包括数据库查询、API响应、内存使用

# 3. 试运行查看执行计划
/bga:execute P010 --dry-run

# 4. 正式执行并监控详细日志
/bga:execute P010 --mode=sequential

# 5. 分析执行报告
/bga:status P010 --detail --reports

# 6. 基于结果添加优化建议
/bga:feedback P010 add --content="数据库查询需要增加索引优化" --type=performance
/bga:feedback P010 add --content="建议使用缓存减少API调用" --type=performance
```

## 团队协作示例

### 示例9：团队项目管理

**场景**: 多人团队使用BGA进行项目协调

```bash
# 团队领导创建主要规划
/bga:plan --title="产品发布v2.0" --priority=high \
  准备产品v2.0发布，包括功能开发、测试、文档、部署

# 团队成员查看规划
/bga:status P011 --detail

# 成员A负责前端任务
/bga:execute P011 --tasks=1,2

# 成员B负责后端任务  
/bga:execute P011 --tasks=3,4

# 成员C负责测试任务
/bga:execute P011 --tasks=5,6

# 团队成员添加反馈
/bga:feedback P011 add --content="前端组件需要更多单元测试" --type=task_optimization
/bga:feedback P011 add --content="API接口文档需要补充示例" --type=user_experience

# 项目经理查看整体进度
/bga:status P011 --detail --reports

# 查看所有反馈
/bga:feedback P011
```

### 示例10：跨项目依赖管理

**场景**: 处理多个相互依赖的项目

```bash
# 1. 创建基础设施项目
/bga:plan --title="基础设施" 建立共享基础设施，包括数据库、缓存、消息队列

# 2. 创建依赖项目（需要等待基础设施完成）
/bga:plan --title="Web服务" 开发Web服务，依赖基础设施项目的数据库和缓存

/bga:plan --title="移动API" 开发移动API，依赖基础设施项目的消息队列

# 3. 按依赖顺序执行
# 首先执行基础设施
/bga:execute P012

# 等待基础设施完成
while [ "$(/bga:status P012 | grep '已完成')" = "" ]; do
  echo "等待基础设施项目完成..."
  sleep 30
done

# 基础设施完成后，并行执行依赖项目
/bga:execute P013 &
/bga:execute P014 &

# 4. 监控所有项目
/bga:status
```

## 自动化脚本示例

### 示例11：自动化项目初始化

创建自动化脚本简化项目初始化：

```bash
#!/bin/bash
# bga-init-project.sh

PROJECT_NAME=$1
PROJECT_TYPE=$2

if [ -z "$PROJECT_NAME" ] || [ -z "$PROJECT_TYPE" ]; then
    echo "用法: $0 <项目名称> <项目类型: web|mobile|api>"
    exit 1
fi

case $PROJECT_TYPE in
    "web")
        DESCRIPTION="创建$PROJECT_NAME Web应用，包括React设置、状态管理、路由配置、样式系统、测试框架"
        ;;
    "mobile")
        DESCRIPTION="创建$PROJECT_NAME 移动应用，包括React Native设置、导航、状态管理、原生模块集成"
        ;;
    "api")
        DESCRIPTION="创建$PROJECT_NAME API服务，包括Express设置、数据库集成、认证、API文档、测试"
        ;;
    *)
        echo "不支持的项目类型: $PROJECT_TYPE"
        exit 1
        ;;
esac

echo "正在为 $PROJECT_NAME ($PROJECT_TYPE) 创建BGA规划..."

# 创建规划
PLAN_OUTPUT=$(/bga:plan --title="$PROJECT_NAME" "$DESCRIPTION")
PLAN_ID=$(echo "$PLAN_OUTPUT" | grep -o 'P[0-9]\{3\}')

echo "规划 $PLAN_ID 已创建"

# 询问是否立即执行
read -p "是否立即执行规划? (y/n): " answer
if [ "$answer" = "y" ]; then
    /bga:execute $PLAN_ID
    echo "规划 $PLAN_ID 执行中，使用 '/bga:status $PLAN_ID' 查看进度"
fi
```

使用方式：

```bash
# 创建Web项目
./bga-init-project.sh "我的博客" web

# 创建移动应用
./bga-init-project.sh "购物应用" mobile

# 创建API服务
./bga-init-project.sh "用户服务" api
```

### 示例12：批量状态监控

创建批量监控脚本：

```bash
#!/bin/bash
# bga-monitor.sh

echo "=== BGA项目监控面板 ==="
echo "时间: $(date)"
echo

# 获取所有活跃规划
ACTIVE_PLANS=$(/bga:status --active-only | grep -o 'P[0-9]\{3\}' | sort -u)

if [ -z "$ACTIVE_PLANS" ]; then
    echo "当前没有活跃的规划"
    exit 0
fi

echo "活跃规划:"
for plan in $ACTIVE_PLANS; do
    echo
    echo "=== $plan ==="
    /bga:status $plan --detail | head -10
    
    # 检查是否有新反馈
    FEEDBACK_COUNT=$(/bga:feedback $plan | grep -c "反馈")
    if [ $FEEDBACK_COUNT -gt 0 ]; then
        echo "⚠️  有 $FEEDBACK_COUNT 条反馈需要处理"
    fi
done

echo
echo "=== 系统概览 ==="
/bga:status | tail -5
```

### 示例13：自动反馈收集

创建自动反馈收集脚本：

```bash
#!/bin/bash
# bga-feedback-collector.sh

PLAN_ID=$1
if [ -z "$PLAN_ID" ]; then
    echo "用法: $0 <规划ID>"
    exit 1
fi

echo "正在收集规划 $PLAN_ID 的执行反馈..."

# 检查执行状态
STATUS=$(/bga:status $PLAN_ID | grep "状态:")

if [[ $STATUS == *"completed"* ]]; then
    echo "✅ 规划已完成，收集执行反馈"
    
    # 添加自动反馈
    /bga:feedback $PLAN_ID add \
        --content="自动执行完成，建议review执行报告确认质量" \
        --type=task_optimization
        
    # 生成执行总结
    echo "生成执行总结..."
    /bga:status $PLAN_ID --detail --reports > "summary_${PLAN_ID}_$(date +%Y%m%d).txt"
    
    echo "执行总结已保存到 summary_${PLAN_ID}_$(date +%Y%m%d).txt"
    
elif [[ $STATUS == *"failed"* ]]; then
    echo "❌ 规划执行失败，收集错误信息"
    
    /bga:feedback $PLAN_ID add \
        --content="执行失败，需要分析失败原因并重新执行" \
        --type=task_optimization \
        --status=pending
        
else
    echo "ℹ️  规划仍在执行中，添加进度反馈"
    
    /bga:feedback $PLAN_ID add \
        --content="执行进行中，监控正常" \
        --type=performance \
        --status=recorded
fi

echo "反馈收集完成"
```

这些示例展示了BGA Gemini扩展在各种实际场景中的使用方法，从简单的项目任务到复杂的团队协作和自动化脚本，帮助用户充分利用BGA的强大功能。