import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showingText?: string;
}

function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showingText
}: PaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust range if at the edges
    if (currentPage <= 2) {
      endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - maxPagesToShow + 2);
    }
    
    // Add ellipsis before middle pages if needed
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis after middle pages if needed
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  
  if (totalPages <= 1) {
    return showingText ? (
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        {showingText}
      </div>
    ) : null;
  }
  
  return (
    <div className="mt-6 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
      {showingText && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {showingText}
        </div>
      )}
      
      <nav className="flex items-center space-x-2" aria-label="Pagination">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`inline-flex items-center rounded-md px-2 py-1 text-sm ${
            currentPage === 1
              ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        
        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => handlePageChange(page)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm ${
                page === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-1 text-gray-500">
              {page}
            </span>
          )
        ))}
        
        {/* Next button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center rounded-md px-2 py-1 text-sm ${
            currentPage === totalPages
              ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}

export default Pagination;