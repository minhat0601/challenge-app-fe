"use client"

import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showFirstLast?: boolean
  disabled?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLast = false,
  disabled = false,
}: PaginationProps) {
  // Không hiển thị phân trang nếu chỉ có 1 trang
  if (totalPages <= 1) {
    return null
  }

  // Tính toán các trang cần hiển thị
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // Số trang tối đa hiển thị
    
    if (totalPages <= maxPagesToShow) {
      // Hiển thị tất cả các trang nếu tổng số trang ít hơn hoặc bằng maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Hiển thị một số trang giới hạn
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
      let endPage = startPage + maxPagesToShow - 1
      
      if (endPage > totalPages) {
        endPage = totalPages
        startPage = Math.max(1, endPage - maxPagesToShow + 1)
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
      
      // Thêm dấu ... nếu cần
      if (startPage > 1) {
        pageNumbers.unshift(-1) // -1 đại diện cho dấu ...
        pageNumbers.unshift(1) // Luôn hiển thị trang đầu tiên
      }
      
      if (endPage < totalPages) {
        pageNumbers.push(-2) // -2 đại diện cho dấu ... ở cuối
        pageNumbers.push(totalPages) // Luôn hiển thị trang cuối cùng
      }
    }
    
    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      {/* Nút về trang đầu tiên */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || disabled}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">Trang đầu</span>
        </Button>
      )}

      {/* Nút về trang trước */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Trang trước</span>
      </Button>

      {/* Các nút số trang */}
      {pageNumbers.map((pageNumber, index) => {
        if (pageNumber === -1 || pageNumber === -2) {
          // Hiển thị dấu ...
          return (
            <Button
              key={`ellipsis-${index}`}
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-default"
              disabled={true}
            >
              <span>...</span>
            </Button>
          )
        }

        return (
          <Button
            key={pageNumber}
            variant={pageNumber === currentPage ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(pageNumber)}
            disabled={disabled}
          >
            {pageNumber}
          </Button>
        )
      })}

      {/* Nút đến trang sau */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Trang sau</span>
      </Button>

      {/* Nút đến trang cuối cùng */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || disabled}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Trang cuối</span>
        </Button>
      )}
    </div>
  )
}
