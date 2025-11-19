// Added missing import for React.ChangeEvent
import { useState, useEffect, type ChangeEvent } from 'react';
import { TaskStatus } from '../types/task';

interface TaskFilterProps {
  onFilterChange: (status: TaskStatus | 'all') => void;
  onSearchChange: (query: string) => void;
  activeFilter?: TaskStatus | 'all';
}

export const TaskFilter = ({
  onFilterChange,
  onSearchChange,
  activeFilter = 'all',
}: TaskFilterProps) => {
  const [searchInput, setSearchInput] = useState('');

  const FILTERS: (TaskStatus | "all")[] = [
    "all",
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
  ];

  useEffect(() => {
    onSearchChange(searchInput);
  }, [searchInput, onSearchChange]);

  // Import missing for React.ChangeEvent
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleFilterClick = (filter: TaskStatus | 'all') => {
    onFilterChange(filter);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="mb-4">
          <label htmlFor="task-search" className="sr-only">
              Search tasks
          </label>
        <input
          type="text"
          placeholder="Search tasks..."
          id="task-search"
          aria-label="Search tasks"
          value={searchInput}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Filter tasks by status">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterClick(filter)}
            role="radio"
            aria-checked={activeFilter === filter}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeFilter === filter
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filter === 'all'
              ? 'All Tasks'
              : filter}
          </button>
        ))}
      </div>
    </div>
  );
};
