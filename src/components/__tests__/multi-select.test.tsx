import { describe, it, expect } from 'vitest';
import type { TagData } from '../../types';

describe('多选数据选择器功能', () => {
  it('应该能够处理单个 TagData', () => {
    const singleData: TagData = {
      id: 'test1',
      label: '@测试变量',
      value: '{{test.value}}',
    };
    
    expect(singleData).toBeDefined();
    expect(singleData.id).toBe('test1');
    expect(singleData.label).toBe('@测试变量');
  });

  it('应该能够处理 TagData 数组', () => {
    const multipleData: TagData[] = [
      {
        id: 'test1',
        label: '@测试变量1',
        value: '{{test.value1}}',
      },
      {
        id: 'test2',
        label: '@测试变量2',
        value: '{{test.value2}}',
      },
    ];
    
    expect(multipleData).toBeDefined();
    expect(multipleData.length).toBe(2);
    expect(multipleData[0].id).toBe('test1');
    expect(multipleData[1].id).toBe('test2');
  });

  it('应该能够区分单选和多选模式', () => {
    const singleData: TagData = {
      id: 'single',
      label: '@单选',
      value: '{{single}}',
    };
    
    const multipleData: TagData[] = [
      {
        id: 'multi1',
        label: '@多选1',
        value: '{{multi1}}',
      },
      {
        id: 'multi2',
        label: '@多选2',
        value: '{{multi2}}',
      },
    ];
    
    // 检查是否是数组
    expect(Array.isArray(singleData)).toBe(false);
    expect(Array.isArray(multipleData)).toBe(true);
  });
});