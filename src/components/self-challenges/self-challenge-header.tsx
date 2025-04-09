'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Table, ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ViewMode = 'grid' | 'table';
type SortOption = 'title' | 'estimatedDays' | 'progress';
type SortDirection = 'asc' | 'desc';

interface SelfChallengeHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSortChange: (option: SortOption, direction: SortDirection) => void;
}

export default function SelfChallengeHeader({
  viewMode,
  onViewModeChange,
  sortBy,
  sortDirection,
  onSortChange
}: SelfChallengeHeaderProps) {
  const router = useRouter();

  const handleNavigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(path);
  };

  // Helper function to get sort label
  const getSortLabel = (option: SortOption, direction: SortDirection) => {
    const optionLabels = {
      title: 'Tên',
      estimatedDays: 'Thời gian',
      progress: 'Tiến độ'
    };

    return `${optionLabels[option]} ${direction === 'asc' ? '↑' : '↓'}`;
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold tracking-tight">Thử thách tự học</h2>
      <div className="flex items-center gap-4">
        {/* View mode toggle */}
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-none"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Lưới
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-none"
            onClick={() => onViewModeChange('table')}
          >
            <Table className="h-4 w-4 mr-2" />
            Bảng
          </Button>
        </div>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Sắp xếp: {getSortLabel(sortBy, sortDirection)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem
              onClick={() => onSortChange('title', sortBy === 'title' && sortDirection === 'asc' ? 'desc' : 'asc')}
              className="justify-between"
            >
              Theo tên
              {sortBy === 'title' && (
                <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange('estimatedDays', sortBy === 'estimatedDays' && sortDirection === 'asc' ? 'desc' : 'asc')}
              className="justify-between"
            >
              Theo thời gian
              {sortBy === 'estimatedDays' && (
                <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange('progress', sortBy === 'progress' && sortDirection === 'asc' ? 'desc' : 'asc')}
              className="justify-between"
            >
              Theo tiến độ
              {sortBy === 'progress' && (
                <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          onClick={handleNavigate('/dashboard')}
        >
          Quay lại
        </Button>
      </div>
    </div>
  );
}