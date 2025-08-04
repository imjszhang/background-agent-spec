#!/usr/bin/env node

/**
 * BGA MCP Server - Background Agent工作流系统的MCP服务器实现
 * 提供BGA工作流的后端服务和工具集成
 * 
 * @version 1.4.0
 * @author BGA Team
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class BGAMCPServer {
    constructor() {
        this.workspaceDir = process.env.BGA_WORKSPACE || '.';
        this.todosDir = process.env.BGA_TODOS_DIR || 'todos';
        this.version = process.env.BGA_VERSION || '1.4.0';
        
        // 初始化MCP服务器
        this.server = new Server(
            {
                name: 'bga-server',
                version: this.version,
                description: 'Background Agent工作流系统MCP服务器'
            },
            {
                capabilities: {
                    tools: {},
                    prompts: {},
                    resources: {}
                }
            }
        );

        this.setupTools();
        this.setupPrompts();
        this.setupResources();
    }

    /**
     * 设置MCP工具
     */
    setupTools() {
        // 创建规划工具
        this.server.setRequestHandler('tools/call', async (request) => {
            const { name, arguments: args } = request.params;

            switch (name) {
                case 'create_plan':
                    return await this.createPlan(args);
                case 'execute_plan':
                    return await this.executePlan(args);
                case 'get_status':
                    return await this.getStatus(args);
                case 'manage_feedback':
                    return await this.manageFeedback(args);
                default:
                    throw new Error(`未知工具: ${name}`);
            }
        });

        // 列出可用工具
        this.server.setRequestHandler('tools/list', async () => {
            return {
                tools: [
                    {
                        name: 'create_plan',
                        description: '创建新的BGA规划',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                description: { type: 'string', description: '任务描述' },
                                title: { type: 'string', description: '规划标题' },
                                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                                estimated_time: { type: 'string', description: '预估时间' }
                            },
                            required: ['description']
                        }
                    },
                    {
                        name: 'execute_plan',
                        description: '执行指定的BGA规划',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                plan_id: { type: 'string', description: '规划编号' },
                                mode: { type: 'string', enum: ['parallel', 'sequential'], default: 'parallel' },
                                tasks: { type: 'string', description: '指定任务ID' },
                                force: { type: 'boolean', description: '强制执行' },
                                dry_run: { type: 'boolean', description: '试运行模式' }
                            },
                            required: ['plan_id']
                        }
                    },
                    {
                        name: 'get_status',
                        description: '查看BGA规划状态',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                plan_id: { type: 'string', description: '规划编号' },
                                detail: { type: 'boolean', description: '显示详细信息' },
                                reports: { type: 'boolean', description: '包含执行报告' },
                                active_only: { type: 'boolean', description: '只显示活跃规划' }
                            }
                        }
                    },
                    {
                        name: 'manage_feedback',
                        description: '管理规划反馈',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                plan_id: { type: 'string', description: '规划编号' },
                                action: { type: 'string', enum: ['add', 'view', 'update', 'delete'], default: 'view' },
                                content: { type: 'string', description: '反馈内容' },
                                type: { type: 'string', description: '反馈类型' },
                                status: { type: 'string', description: '反馈状态' },
                                feedback_id: { type: 'string', description: '反馈ID' }
                            },
                            required: ['plan_id']
                        }
                    }
                ]
            };
        });
    }

    /**
     * 设置MCP提示词
     */
    setupPrompts() {
        this.server.setRequestHandler('prompts/list', async () => {
            return {
                prompts: [
                    {
                        name: 'bga_workflow_trigger',
                        description: 'BGA工作流触发条件检测提示词'
                    },
                    {
                        name: 'intent_recognition',
                        description: 'BGA意图识别提示词'
                    },
                    {
                        name: 'plan_generation',
                        description: 'BGA规划生成提示词'
                    }
                ]
            };
        });

        this.server.setRequestHandler('prompts/get', async (request) => {
            const { name } = request.params;
            
            const prompts = {
                'bga_workflow_trigger': this.getBGAWorkflowTriggerPrompt(),
                'intent_recognition': this.getIntentRecognitionPrompt(),
                'plan_generation': this.getPlanGenerationPrompt()
            };

            if (!prompts[name]) {
                throw new Error(`未知提示词: ${name}`);
            }

            return {
                description: `BGA ${name} 提示词`,
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: prompts[name]
                        }
                    }
                ]
            };
        });
    }

    /**
     * 设置MCP资源
     */
    setupResources() {
        this.server.setRequestHandler('resources/list', async () => {
            return {
                resources: [
                    {
                        uri: 'bga://spec',
                        name: 'BGA工作流规范',
                        description: 'Background Agent工作流系统规范文档'
                    },
                    {
                        uri: 'bga://plans',
                        name: 'BGA规划列表',
                        description: '当前所有BGA规划的列表'
                    }
                ]
            };
        });

        this.server.setRequestHandler('resources/read', async (request) => {
            const { uri } = request.params;
            
            switch (uri) {
                case 'bga://spec':
                    return await this.getBGASpec();
                case 'bga://plans':
                    return await this.getPlansList();
                default:
                    throw new Error(`未知资源: ${uri}`);
            }
        });
    }

    /**
     * 创建新规划
     */
    async createPlan(args) {
        try {
            const { description, title, priority = 'medium', estimated_time } = args;
            
            // 获取当前时间
            const now = new Date().toISOString();
            
            // 扫描现有规划，生成新编号
            const planId = await this.generatePlanId();
            
            // 意图识别和反馈更新
            const intentResult = await this.identifyIntent(description);
            
            // 规划生成逻辑
            const plan = {
                plan_id: planId,
                title: title || `规划 ${planId}`,
                description,
                created_at: now,
                updated_at: now,
                status: 'pending',
                priority,
                estimated_time,
                referenced_files: await this.identifyReferencedFiles(description),
                tasks: await this.generateTasks(description),
                execution_history: [],
                metadata: {
                    total_tasks: 0,
                    estimated_total_time: estimated_time || 'unknown',
                    complexity: await this.assessComplexity(description),
                    priority
                }
            };

            // 创建规划目录和文件
            await this.createPlanFiles(planId, plan);

            // 更新反馈文件
            await this.updateIntentFeedback(planId, intentResult);

            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ 规划 ${planId} 创建成功！\\n\\n` +
                              `标题: ${plan.title}\\n` +
                              `描述: ${description}\\n` +
                              `预估任务数: ${plan.tasks.length}\\n` +
                              `复杂度: ${plan.metadata.complexity}\\n\\n` +
                              `请使用 /bga:execute ${planId} 开始执行规划。`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ 创建规划失败: ${error.message}`
                    }
                ]
            };
        }
    }

    /**
     * 执行规划
     */
    async executePlan(args) {
        try {
            const { plan_id, mode = 'parallel', tasks, force = false, dry_run = false } = args;
            
            // 验证规划存在
            const planPath = path.join(this.workspaceDir, this.todosDir, plan_id);
            const planExists = await this.pathExists(planPath);
            
            if (!planExists) {
                throw new Error(`规划 ${plan_id} 不存在`);
            }

            // 读取规划上下文
            const context = await this.readPlanContext(plan_id);
            
            if (dry_run) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🔍 试运行模式 - 规划 ${plan_id}\\n\\n` +
                                  `执行模式: ${mode}\\n` +
                                  `指定任务: ${tasks || '全部'}\\n` +
                                  `强制模式: ${force ? '是' : '否'}\\n\\n` +
                                  `✅ 验证通过，可以正常执行。`
                        }
                    ]
                };
            }

            // 开始执行
            const executionId = await this.startExecution(plan_id, {
                mode,
                tasks: tasks ? tasks.split(',').map(t => parseInt(t.trim())) : null,
                force
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: `🚀 开始执行规划 ${plan_id}\\n\\n` +
                              `执行ID: ${executionId}\\n` +
                              `执行模式: ${mode}\\n` +
                              `使用 /bga:status ${plan_id} 查看进度。`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ 执行规划失败: ${error.message}`
                    }
                ]
            };
        }
    }

    /**
     * 获取状态
     */
    async getStatus(args) {
        try {
            const { plan_id, detail = false, reports = false, active_only = false } = args;
            
            if (plan_id) {
                // 获取指定规划状态
                const status = await this.getPlanStatus(plan_id, detail, reports);
                return {
                    content: [
                        {
                            type: 'text',
                            text: this.formatPlanStatus(status, detail)
                        }
                    ]
                };
            } else {
                // 获取所有规划状态
                const allStatus = await this.getAllPlansStatus(active_only);
                return {
                    content: [
                        {
                            type: 'text',
                            text: this.formatAllPlansStatus(allStatus)
                        }
                    ]
                };
            }
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ 获取状态失败: ${error.message}`
                    }
                ]
            };
        }
    }

    /**
     * 管理反馈
     */
    async manageFeedback(args) {
        try {
            const { plan_id, action = 'view', content, type, status, feedback_id } = args;
            
            switch (action) {
                case 'view':
                    const feedback = await this.getFeedback(plan_id, type);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: this.formatFeedback(feedback)
                            }
                        ]
                    };
                    
                case 'add':
                    if (!content) {
                        throw new Error('添加反馈时必须提供内容');
                    }
                    await this.addFeedback(plan_id, { content, type, status: status || 'pending' });
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `✅ 反馈已添加到规划 ${plan_id}`
                            }
                        ]
                    };
                    
                case 'update':
                    if (!feedback_id) {
                        throw new Error('更新反馈时必须提供反馈ID');
                    }
                    await this.updateFeedback(plan_id, feedback_id, { content, type, status });
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `✅ 反馈 ${feedback_id} 已更新`
                            }
                        ]
                    };
                    
                case 'delete':
                    if (!feedback_id) {
                        throw new Error('删除反馈时必须提供反馈ID');
                    }
                    await this.deleteFeedback(plan_id, feedback_id);
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `✅ 反馈 ${feedback_id} 已删除`
                            }
                        ]
                    };
                    
                default:
                    throw new Error(`未知反馈操作: ${action}`);
            }
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ 反馈操作失败: ${error.message}`
                    }
                ]
            };
        }
    }

    // ==================== 工具方法 ====================

    /**
     * 生成新的规划ID
     */
    async generatePlanId() {
        const todosPath = path.join(this.workspaceDir, this.todosDir);
        
        try {
            const dirs = await fs.readdir(todosPath);
            const planDirs = dirs.filter(dir => /^P\\d{3}$/.test(dir));
            const planNumbers = planDirs.map(dir => parseInt(dir.substring(1)));
            const maxNumber = planNumbers.length > 0 ? Math.max(...planNumbers) : 0;
            
            return `P${String(maxNumber + 1).padStart(3, '0')}`;
        } catch (error) {
            // todos目录不存在，从P001开始
            await fs.mkdir(todosPath, { recursive: true });
            return 'P001';
        }
    }

    /**
     * 路径存在性检查
     */
    async pathExists(path) {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 意图识别
     */
    async identifyIntent(description) {
        // 简化的意图识别逻辑
        const keywords = {
            high_confidence: ['BGA', 'Background Agent', '执行', '规划'],
            medium_confidence: ['批量', '自动化', '并行', '任务'],
            low_confidence: ['处理', '分析', '生成', '创建']
        };

        let confidence = 5;
        let triggers = [];

        for (const [level, words] of Object.entries(keywords)) {
            for (const word of words) {
                if (description.includes(word)) {
                    triggers.push(word);
                    if (level === 'high_confidence') confidence += 2;
                    else if (level === 'medium_confidence') confidence += 1;
                    else confidence += 0.5;
                }
            }
        }

        return {
            confidence: Math.min(confidence, 10),
            triggers,
            type: 'new_plan_creation',
            risk_level: confidence > 8 ? 'low' : confidence > 6 ? 'medium' : 'high'
        };
    }

    /**
     * 获取BGA工作流触发提示词
     */
    getBGAWorkflowTriggerPrompt() {
        return `你是Background Agent (BGA) v1.4.0工作流系统的智能识别引擎。请分析用户输入，判断是否需要触发BGA工作流。

触发条件包括：
1. 明确包含BGA相关关键词
2. 复杂多步骤任务描述
3. 批量处理需求
4. 项目管理场景
5. 反馈收集场景

请分析并返回：
- 是否触发工作流 (true/false)
- 触发置信度 (1-10)
- 触发类型 (new_plan|execute_plan|view_status|manage_feedback)
- 识别到的关键词
- 风险评估 (low|medium|high)`;
    }

    /**
     * 获取意图识别提示词
     */
    getIntentRecognitionPrompt() {
        return `你是BGA意图识别专家。请深度分析用户意图，提供详细的识别结果。

分析维度：
1. 任务复杂度 (简单|中等|复杂)
2. 预估时间范围
3. 所需资源类型
4. 依赖关系分析
5. 风险评估

请返回结构化的分析结果，包括置信度评分和建议的执行策略。`;
    }

    /**
     * 获取规划生成提示词
     */
    getPlanGenerationPrompt() {
        return `你是BGA规划生成专家。基于用户需求，生成详细的执行规划。

规划要素：
1. 任务分解 (3-10个子任务)
2. 依赖关系定义
3. 时间估算
4. 资源需求识别
5. 风险点识别
6. 质量标准定义

请生成符合BGA v1.4.0规范的完整规划结构。`;
    }

    /**
     * 启动服务器
     */
    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('BGA MCP Server started');
    }
}

// 启动服务器
if (require.main === module) {
    const server = new BGAMCPServer();
    server.start().catch(console.error);
}

module.exports = BGAMCPServer;