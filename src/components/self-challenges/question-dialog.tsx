'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TestResult, submitTestAnswers } from '@/services/api';
import { TestResultDialog } from './test-result-dialog';
import { fireConfetti } from '@/components/confetti-effect';

import { CheckCircle, AlertTriangle, Code, Copy, X, Clipboard } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: string[];
  onSubmit: (answers: Record<number, string>) => Promise<void>;
  tabSwitchCount: number;
  onTabSwitch?: () => void;
  challengeId: number; // Thêm challengeId để gửi lên API
}

export function QuestionDialog({
  open,
  onOpenChange,
  questions,
  onSubmit,
  tabSwitchCount,
  onTabSwitch,
  challengeId
}: QuestionDialogProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [devToolsCount, setDevToolsCount] = useState(0); // Đếm số lần sử dụng công cụ developer
  const [copyCount, setCopyCount] = useState(0); // Đếm số lần sử dụng copy
  const [pasteCount, setPasteCount] = useState(0); // Đếm số lần dán văn bản
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  // Theo dõi khi người dùng chuyển tab hoặc mở F12
  useEffect(() => {
    if (!open) return;

    // Hàm xử lý khi người dùng chuyển tab
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Chỉ gọi onTabSwitch để tăng counter ở component cha
        // Không tăng tabSwitchCount ở đây vì nó được truyền từ component cha
        if (onTabSwitch) {
          onTabSwitch();
        }

        toast.warning(`Bạn đã chuyển tab!`, {
          id: 'tab-switch',
          duration: 3000,
        });
      }
    };

    // Chặn F12 và các phím tắt developer tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Chặn F12
      if (e.key === 'F12' || e.code === 'F12') {
        e.preventDefault();
        setDevToolsCount(prev => prev + 1);
        toast.error('Không được phép mở công cụ developer!', {
          id: 'dev-tools-error',
          duration: 3000,
        });
        return false;
      }

      // Chặn Ctrl+Shift+I / Cmd+Option+I
      if ((e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.metaKey && e.altKey && e.key === 'i')) {
        setDevToolsCount(prev => prev + 1);
        toast.error('Không được phép mở công cụ developer!', {
          id: 'dev-tools-error',
          duration: 3000,
        });
        return false;
      }

      // Chặn Ctrl+Shift+J / Cmd+Option+J
      if ((e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.metaKey && e.altKey && e.key === 'j')) {
        setDevToolsCount(prev => prev + 1);
        toast.error('Không được phép mở công cụ developer!', {
          id: 'dev-tools-error',
          duration: 3000,
        });
        return false;
      }

      // Chặn Ctrl+Shift+C / Cmd+Option+C
      if ((e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.metaKey && e.altKey && e.key === 'c')) {
        setDevToolsCount(prev => prev + 1);
        toast.error('Không được phép mở công cụ developer!', {
          id: 'dev-tools-error',
          duration: 3000,
        });
        return false;
      }

      // Không xử lý Ctrl+C / Cmd+C và Ctrl+V / Cmd+V ở đây
      // vì đã có handleCopy và handlePaste để tránh bị đếm double

      return true;
    };

    // Chặn menu chuột phải
    const handleContextMenu = (e: MouseEvent) => {
      toast.error('Không được phép mở menu chuột phải trong quá trình làm bài!', {
        id: 'context-menu-error',
        duration: 3000,
      });
      return false;
    };

    // Chặn copy
    const handleCopy = (e: ClipboardEvent) => {
      setCopyCount(prev => prev + 1);
      toast.error('Không được phép sao chép trong quá trình làm bài!', {
        id: 'copy-error',
        duration: 3000,
      });
      return false;
    };

    // Chặn paste
    const handlePaste = (e: ClipboardEvent) => {
      setPasteCount(prev => prev + 1);
      toast.error('Không được phép dán văn bản trong quá trình làm bài!', {
        id: 'paste-error',
        duration: 3000,
      });
      return false;
    };

    // Chặn select all
    const handleSelectStart = () => {
      toast.error('Không được phép chọn tất cả trong quá trình làm bài!', {
        id: 'select-error',
        duration: 3000,
      });
      return false;
    };

    // Đăng ký các sự kiện
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('selectstart', handleSelectStart);

    // Hủy đăng ký khi component unmount hoặc dialog đóng
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [open, onTabSwitch]);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleSubmitAnswers = async () => {
    // Kiểm tra xem có ít nhất một câu trả lời không
    const hasAnswers = Object.values(answers).some(answer => answer.trim() !== '');

    if (!hasAnswers) {
      toast.error('Vui lòng trả lời ít nhất một câu hỏi!');
      return;
    }

    setSubmitting(true);

    try {
      // Gọi API để gửi câu trả lời và nhận kết quả đánh giá
      const result = await submitTestAnswers(challengeId, answers);

      if (result) {
        // Lưu kết quả và hiển thị dialog kết quả
        setTestResult(result);
        setShowResultDialog(true);

        // Hiển thị confetti nếu điểm cao
        if (result.score >= 8.5) {
          setTimeout(() => {
            fireConfetti();
          }, 500);
        }

        // Gọi hàm onSubmit để cập nhật trạng thái ngay lập tức
        // Sử dụng Promise.all để đảm bảo cả hai tác vụ được thực hiện song song
        await onSubmit(answers);
      } else {
        toast.error('Không thể gửi bài làm. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error('Có lỗi xảy ra khi gửi bài làm. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Dialog kết quả đánh giá */}
      <TestResultDialog
        open={showResultDialog}
        onOpenChange={(open) => {
          setShowResultDialog(open);
          if (!open) {
            // Đóng dialog câu hỏi khi đóng dialog kết quả
            onOpenChange(false);
          }
        }}
        result={testResult}
      />

      {/* Dialog câu hỏi */}
      <Dialog open={open} onOpenChange={(open) => {
        // Chỉ cho phép đóng dialog khi bấm nút Hủy
        // Không cho phép bấm ra ngoài để thoát
        if (open === false) {
          // Không làm gì khi bấm ra ngoài
          return;
        }
        onOpenChange(open);
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b px-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Câu hỏi kiểm tra</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Bài kiểm tra gồm {questions.length} câu hỏi
              </p>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex flex-wrap gap-1 justify-end">
                {tabSwitchCount > 0 && (
                  <Badge variant="destructive" className="animate-pulse text-[10px] px-1.5 py-0 h-5">
                    <AlertTriangle className="h-3 w-3 mr-0.5" />
                    {tabSwitchCount}
                  </Badge>
                )}

                {devToolsCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                    <Code className="h-3 w-3 mr-0.5" />
                    {devToolsCount}
                  </Badge>
                )}

                {copyCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                    <Copy className="h-3 w-3 mr-0.5" />
                    {copyCount}
                  </Badge>
                )}

                {pasteCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                    <Clipboard className="h-3 w-3 mr-0.5" />
                    {pasteCount}
                  </Badge>
                )}
              </div>

              {(tabSwitchCount > 0 || devToolsCount > 0 || copyCount > 0 || pasteCount > 0) && (
                <span className="text-[10px] text-destructive font-medium">
                  Vi phạm
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 my-4 px-6">
          {questions.map((question, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {index + 1}
                </div>
                <h4 className="text-base font-medium flex-1">{question}</h4>
              </div>
              <div className="ml-10">
                <div className="text-xs text-muted-foreground mb-2">Câu trả lời {index + 1}:</div>
                <Textarea
                  placeholder="Nhập câu trả lời của bạn..."
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="min-h-[120px] focus:border-primary resize-none w-full border-primary/20 focus:ring-1 focus:ring-primary"
                  disabled={submitting}
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="sticky bottom-0 bg-background z-10 pt-2 pb-4 border-t px-6">
          {(tabSwitchCount > 0 || devToolsCount > 0 || copyCount > 0 || pasteCount > 0) && (
            <div className="w-full text-center mb-2 text-xs text-destructive">
              <span className="font-medium">Cảnh báo:</span> Các hành vi vi phạm có thể ảnh hưởng đến điểm số của bạn.
            </div>
          )}

          <div className="flex flex-row justify-between items-center w-full">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <X className="mr-2 h-5 w-5" />
              Hủy
            </Button>

            <Button
              onClick={handleSubmitAnswers}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary ml-2"
              size="lg"
            >
              {submitting ? (
                <>
                  <span className="animate-spin mr-2">&#8635;</span>
                  Đang gửi...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Nộp bài
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
