'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, Grid3X3, Filter, SortAsc, SortDesc, Calendar, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

type ViewMode = 'grid' | 'table';
type SortOption = 'startDate' | 'title' | 'participants';
type SortDirection = 'ASC' | 'DESC';
type FilterOption = 'all' | 'planning' | 'ongoing' | 'completed' | 'cancelled';

interface TripHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSortChange: (option: SortOption, direction: SortDirection) => void;
  filter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export default function TripHeader({
  viewMode,
  onViewModeChange,
  sortBy,
  sortDirection,
  onSortChange,
  filter,
  onFilterChange,
}: TripHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kế hoạch chuyến đi</h1>
        <p className="text-muted-foreground">
          Quản lý và lên kế hoạch cho các chuyến đi của bạn
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Dropdown lọc */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 mr-2" />
              Lọc
              {filter !== 'all' && <span className="ml-1 w-2 h-2 rounded-full bg-primary"></span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={filter} onValueChange={(value) => onFilterChange(value as FilterOption)}>
              <DropdownMenuRadioItem value="all">Tất cả chuyến đi</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="planning">Đang lên kế hoạch</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ongoing">Đang diễn ra</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="completed">Đã hoàn thành</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="cancelled">Đã hủy</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dropdown sắp xếp */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              {sortDirection === 'ASC' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
              Sắp xếp
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSortChange('startDate', sortDirection)} className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Ngày bắt đầu
              </div>
              {sortBy === 'startDate' && <span className="h-2 w-2 rounded-full bg-primary"></span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('title', sortDirection)} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2 text-sm">T</span>
                Tên chuyến đi
              </div>
              {sortBy === 'title' && <span className="h-2 w-2 rounded-full bg-primary"></span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('participants', sortDirection)} className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Số người tham gia
              </div>
              {sortBy === 'participants' && <span className="h-2 w-2 rounded-full bg-primary"></span>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSortChange(sortBy, sortDirection === 'ASC' ? 'DESC' : 'ASC')}>
              {sortDirection === 'ASC' ? 'Giảm dần' : 'Tăng dần'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Nút chuyển chế độ xem */}
        <div className="flex items-center space-x-1 rounded-md border p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="sr-only">Grid view</span>
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onViewModeChange('table')}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">Table view</span>
          </Button>
        </div>

        {/* Nút tạo mới */}
        <Button onClick={() => router.push('/dashboard/trips/create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tạo chuyến đi mới
        </Button>
      </div>
    </div>
  );
}
