import { expect, test } from '@playwright/test';
import { createMidsceneAgent, hasMidsceneEnv } from './midscene';

test.describe('PromptEditor smoke flow', () => {
  test('runs the core editor flow on the dumi demo page', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('运行成功');
      await dialog.accept();
    });

    await page.goto('/e2e');
    await expect(
      page.getByRole('heading', { name: '自动化回归测试页' }),
    ).toBeVisible({ timeout: 60_000 });

    const rootNode = page.locator('[data-node-id="1"]').first();
    const expandEditorButton = rootNode.getByRole('button', {
      name: '展开编辑器',
      exact: true,
    });

    if (await expandEditorButton.isVisible()) {
      await expandEditorButton.click();
    }

    await rootNode.getByRole('button', { name: '运行', exact: true }).click();

    const lockButton = rootNode.getByRole('button', {
      name: '锁定节点',
      exact: true,
    });
    await expect(lockButton).toBeEnabled();

    await lockButton.click();
    await expect(
      rootNode.getByRole('button', { name: '解锁节点', exact: true }),
    ).toBeEnabled();

    await rootNode.getByRole('button', { name: '解锁节点', exact: true }).click();
    await rootNode.getByRole('button', { name: '删除节点', exact: true }).click();
    await page.getByRole('button', { name: /确\s*定/ }).click();

    await expect(page.locator('[data-node-id="1"]')).toHaveCount(0);
  });

  test('can attach a Midscene agent to the same smoke page', async ({ page }) => {
    test.skip(
      !hasMidsceneEnv(),
      '未配置 Midscene 模型环境变量，跳过可选 AI 回归断言',
    );

    await page.goto('/e2e');
    await expect(
      page.getByRole('heading', { name: '自动化回归测试页' }),
    ).toBeVisible({ timeout: 60_000 });

    const agent = createMidsceneAgent(page);
    expect(agent).not.toBeNull();

    await agent!.aiAssert('页面上有“添加标题”按钮，并且有一个提示词编辑器区域');
    await agent!.aiAssert('页面中至少能看到两个步骤节点');

    const rootNode = page.locator('[data-node-id="1"]').first();
    const expandEditorButton = rootNode.getByRole('button', {
      name: '展开编辑器',
      exact: true,
    });

    if (await expandEditorButton.isVisible()) {
      await expandEditorButton.click();
    }

    await expect(
      rootNode.getByRole('button', { name: 'AI 优化', exact: true }),
    ).toBeVisible();
    await agent!.aiAssert('当前展开的编辑器底部右侧有两个操作按钮');

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    await rootNode.getByRole('button', { name: '运行', exact: true }).click();

    const lockButton = rootNode.getByRole('button', {
      name: '锁定节点',
      exact: true,
    });
    await expect(lockButton).toBeEnabled();
    await lockButton.click();

    await expect(
      rootNode.getByRole('button', { name: '解锁节点', exact: true }),
    ).toBeVisible();

    await agent!.aiAssert('第一页节点区域已经进入锁定状态');
  });
});
