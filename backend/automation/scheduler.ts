import { api } from "encore.dev/api";
import { automationDB } from "./db";

interface ScheduleConfig {
  name: string;
  type: 'content_generation' | 'link_check' | 'social_posting' | 'analytics_report';
  cronExpression: string;
  config: Record<string, any>;
  isActive?: boolean;
}

interface CreateScheduleResponse {
  id: number;
  nextRun: Date;
}

interface RunTasksResponse {
  executed: number;
  failed: number;
}

interface AutomationSchedule {
  id: number;
  name: string;
  type: string;
  cronExpression: string;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  config: any;
}

interface GetSchedulesResponse {
  schedules: AutomationSchedule[];
}

// Creates or updates an automation schedule.
export const createSchedule = api<ScheduleConfig, CreateScheduleResponse>(
  { expose: true, method: "POST", path: "/automation/schedule" },
  async (req) => {
    const nextRun = calculateNextRun(req.cronExpression);
    
    const schedule = await automationDB.queryRow<{ id: number }>`
      INSERT INTO automation_schedules (
        name, type, cron_expression, config, is_active, next_run_at
      ) VALUES (
        ${req.name}, ${req.type}, ${req.cronExpression}, ${JSON.stringify(req.config)},
        ${req.isActive !== false}, ${nextRun.toISOString()}
      )
      ON CONFLICT (name) DO UPDATE SET
        type = EXCLUDED.type,
        cron_expression = EXCLUDED.cron_expression,
        config = EXCLUDED.config,
        is_active = EXCLUDED.is_active,
        next_run_at = EXCLUDED.next_run_at
      RETURNING id
    `;

    return {
      id: schedule!.id,
      nextRun
    };
  }
);

// Runs pending scheduled tasks.
export const runScheduledTasks = api<void, RunTasksResponse>(
  { expose: true, method: "POST", path: "/automation/run-tasks" },
  async () => {
    const pendingTasks = await automationDB.queryAll<{
      id: number;
      name: string;
      type: string;
      config: any;
      cronExpression: string;
    }>`
      SELECT id, name, type, config, cron_expression as "cronExpression"
      FROM automation_schedules
      WHERE is_active = true
      AND next_run_at <= NOW()
      ORDER BY next_run_at ASC
      LIMIT 10
    `;

    let executed = 0;
    let failed = 0;

    for (const task of pendingTasks) {
      try {
        await executeTask(task);
        
        // Update last run and calculate next run
        const nextRun = calculateNextRun(task.cronExpression);
        await automationDB.exec`
          UPDATE automation_schedules
          SET last_run_at = NOW(), next_run_at = ${nextRun.toISOString()}
          WHERE id = ${task.id}
        `;
        
        executed++;
      } catch (error) {
        console.error(`Failed to execute task ${task.name}:`, error);
        failed++;
      }
    }

    return { executed, failed };
  }
);

async function executeTask(task: any): Promise<void> {
  switch (task.type) {
    case 'content_generation':
      await executeContentGeneration(task.config);
      break;
    case 'link_check':
      await executeLinkCheck();
      break;
    case 'social_posting':
      await executeSocialPosting();
      break;
    case 'analytics_report':
      await executeAnalyticsReport(task.config);
      break;
    default:
      throw new Error(`Unknown task type: ${task.type}`);
  }
}

async function executeContentGeneration(config: any): Promise<void> {
  const { generateContent } = await import('./content_generator');
  
  const topics = config.topics || ['wellness tips', 'healthy living', 'nutrition advice'];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  await generateContent({
    topic: randomTopic,
    targetKeywords: config.keywords || ['wellness', 'health', 'nutrition'],
    includeAffiliateProducts: true
  });
}

async function executeLinkCheck(): Promise<void> {
  const { checkAffiliateLinks } = await import('./link_checker');
  await checkAffiliateLinks();
}

async function executeSocialPosting(): Promise<void> {
  const { publishScheduledPosts } = await import('./social_media_automation');
  await publishScheduledPosts();
}

async function executeAnalyticsReport(config: any): Promise<void> {
  const { analyzeRevenue } = await import('./revenue_optimizer');
  const report = await analyzeRevenue();
  
  // Store report or send notification
  console.log('Analytics Report Generated:', report);
}

function calculateNextRun(cronExpression: string): Date {
  // Simple cron parser for basic expressions
  // In production, use a proper cron library like node-cron
  const now = new Date();
  
  // Default to 1 hour from now for simplicity
  return new Date(now.getTime() + 60 * 60 * 1000);
}

// Gets all automation schedules for admin dashboard.
export const getSchedules = api<void, GetSchedulesResponse>(
  { expose: true, method: "GET", path: "/automation/schedules" },
  async () => {
    const schedules = await automationDB.queryAll<AutomationSchedule>`
      SELECT 
        id, name, type, cron_expression as "cronExpression",
        is_active as "isActive", last_run_at as "lastRun",
        next_run_at as "nextRun", config
      FROM automation_schedules
      ORDER BY next_run_at ASC
    `;

    return { schedules };
  }
);
