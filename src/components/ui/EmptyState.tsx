import React, { ReactNode } from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

function EmptyState({ 
  title, 
  description, 
  icon = <FileQuestion size={48} className="text-gray-400" />,
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;