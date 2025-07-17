import React from 'react';
import { isGistServiceConfigured } from '@/services/gistService';

interface ConfigStatusProps {
  className?: string;
}

/**
 * 配置状态检查组件
 * 显示环境变量配置状态，帮助用户了解是否需要配置 .env 文件
 */
export const ConfigStatus: React.FC<ConfigStatusProps> = ({ className = '' }) => {
  if (isGistServiceConfigured) {
    return null; // 配置正确时不显示任何内容
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            需要配置环境变量
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              为了使用完整功能，请配置 <code className="bg-yellow-100 px-1 rounded">.env</code> 文件：
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>设置 <code className="bg-yellow-100 px-1 rounded">VITE_GITHUB_TOKEN</code> - GitHub Personal Access Token</li>
              <li>设置 <code className="bg-yellow-100 px-1 rounded">VITE_GIST_ID</code> - 用于存储数据的 Gist ID</li>
            </ul>
            <p className="mt-2">
              详细配置说明请参考项目根目录下的 <code className="bg-yellow-100 px-1 rounded">ENV_SETUP.md</code> 文件。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigStatus;