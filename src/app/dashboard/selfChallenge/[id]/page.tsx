'use client';

import { useEffect, useState } from 'react';
import './styles.css';
import { ConfettiEffect, fireConfetti } from '@/components/confetti-effect';
import { useParams, useRouter } from 'next/navigation';
import { fetchChallengeById, submitChallengeAnswer } from '@/services/api';
import { UserChallengeData } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, Clock, XCircle, MessageSquare, Calendar, Timer, BookOpen, GraduationCap, Target } from 'lucide-react';
import { QuestionDialog } from '@/components/self-challenges/question-dialog';
import { toast } from 'sonner';
import { getElapsedTime, isDeadlineExpired } from '@/utils/date';
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ChallengePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [challenge, setChallenge] = useState<UserChallengeData | null>(null);
  const [loading, setLoading] = useState(true);

  const [elapsedTime, setElapsedTime] = useState('');
  const [isLearningCompleted, setIsLearningCompleted] = useState(false); // State để theo dõi trạng thái đã học xong
  const [tabSwitchCount, setTabSwitchCount] = useState(0); // State để đếm số lần thoát tab
  const [showQuestionDialog, setShowQuestionDialog] = useState(false); // State để hiển thị dialog câu hỏi

  // Fetch challenge data
  useEffect(() => {
    const loadChallenge = async () => {
      setLoading(true);
      try {
        const data = await fetchChallengeById(id);
        setChallenge(data);

        // Kiểm tra nếu điểm cao thì hiển thị confetti
        // if (data?.selfLearningChallenge[0]?.score !== null &&
        //     data?.selfLearningChallenge[0]?.score !== undefined &&
        //     data?.selfLearningChallenge[0]?.score >= 8.5) {
        //   setShowConfetti(true);
        //   fireConfetti();
        // }
      } catch (error) {
        console.error('Failed to load challenge:', error);
        toast.error('Không thể tải dữ liệu thử thách. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadChallenge();
    }
  }, [id]);

  // Update elapsed time - chỉ đếm khi thử thách đang học
  useEffect(() => {
    if (!challenge?.createdAt) return;

    // Nếu thử thách đã hoàn thành hoặc thất bại, chỉ cập nhật một lần
    if (challenge.status === 'completed' || challenge.status === 'abandoned' || challenge.status === 'failed') {
      setElapsedTime(getElapsedTime(challenge.createdAt, challenge.completedAt || undefined));
      return;
    }

    // Nếu đang học, cập nhật liên tục
    const updateElapsedTime = () => {
      setElapsedTime(getElapsedTime(challenge.createdAt));
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [challenge?.createdAt, challenge?.status, challenge?.completedAt]);



  // Hàm xử lý khi người dùng hoàn thành học tập
  const handleLearningComplete = () => {
    setIsLearningCompleted(true);
    setShowQuestionDialog(true);
    toast.success('Bạn đã hoàn thành phần học tập! Hãy trả lời các câu hỏi để hoàn thành thử thách.', {
      id: 'learning-complete',
      duration: 5000,
    });
  };

  // Hàm xử lý khi người dùng gửi câu trả lời
  const handleSubmitAnswers = async (answers: Record<number, string>) => {
    try {
      // Tổng hợp các câu trả lời thành một chuỗi
      const combinedAnswer = Object.entries(answers)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([, value]) => value)
        .filter(value => value.trim())
        .join('\n\n');

      const success = await submitChallengeAnswer({
        challengeId: id,
        answer: combinedAnswer.trim()
      });

      if (success) {
        toast.success('Thử thách đã được hoàn thành thành công!');

        // Reload challenge data to get updated status
        const updatedChallenge = await fetchChallengeById(id);
        setChallenge(updatedChallenge);

        // Hiển thị confetti nếu điểm cao
        if (updatedChallenge &&
            updatedChallenge.selfLearningChallenge &&
            updatedChallenge.selfLearningChallenge[0] &&
            updatedChallenge.selfLearningChallenge[0].score >= 8.5) {
          fireConfetti();
        }
      } else {
        toast.error('Không thể gửi câu trả lời. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    }
  };



  // Handle back button
  const handleBack = () => {
    router.push('/dashboard/selfChallenge');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Không tìm thấy thử thách</CardTitle>
            <CardDescription>Thử thách này không tồn tại hoặc bạn không có quyền truy cập.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Vui lòng quay lại trang danh sách thử thách và thử lại.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack}>Quay lại danh sách</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const selfLearningData = challenge.selfLearningChallenge[0];
  const analyzedData = selfLearningData?.analyzedData;
  const isCompleted = challenge.status === 'completed';
  const isFailed = challenge.status === 'abandoned' || challenge.status === 'failed';
  const hasDeadline = !!analyzedData?.deadline;
  const deadlineExpired = hasDeadline && isDeadlineExpired(analyzedData.deadline);

  return (
    <div className="space-y-6">
      {/* Hiệu ứng confetti khi điểm cao */}
      <ConfettiEffect trigger={false} />
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="flex items-center gap-2">
          {selfLearningData?.selfLearningTag && (
            <Badge variant="outline" className="text-xs">
              {selfLearningData.selfLearningTag.name}
            </Badge>
          )}

          <Badge
            variant={isCompleted ? "success" : isFailed ? "destructive" : deadlineExpired ? "outline" : "secondary"}
            className="text-xs font-medium px-3 py-1"
          >
            {isCompleted ? 'Đã hoàn thành' : isFailed ? 'Không hoàn thành' : deadlineExpired ? 'Hết hạn' : 'Đang học'}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{selfLearningData?.topic || 'Thử thách tự học'}</CardTitle>
              <CardDescription className="mt-2 space-y-1">
                {/* Thời gian tạo */}
                <div className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  Tạo lúc: {new Date(challenge.createdAt).toLocaleString('vi-VN')}
                </div>

                {/* Deadline nếu có */}
                {analyzedData?.deadline && (
                  <div className="flex items-center gap-1 text-xs">
                    <Timer className="h-3 w-3" />
                    Deadline: {new Date(analyzedData.deadline).toLocaleString('vi-VN')}
                  </div>
                )}

                {/* Thời gian học (chỉ hiển thị khi đang học) */}
                {!isCompleted && !isFailed && (
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    Thời gian học: {elapsedTime}
                  </div>
                )}

                {/* Thời gian hoàn thành nếu đã hoàn thành */}
                {isCompleted && challenge.completedAt && (
                  <>
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-500">
                      <CheckCircle className="h-3 w-3" />
                      Hoàn thành lúc: {new Date(challenge.completedAt).toLocaleString('vi-VN')}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <Clock className="h-3 w-3" />
                      Tổng thời gian học: {elapsedTime}
                    </div>
                  </>
                )}

                {/* Thời gian thất bại nếu đã thất bại */}
                {isFailed && challenge.completedAt && (
                  <>
                    <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-500">
                      <XCircle className="h-3 w-3" />
                      Kết thúc lúc: {new Date(challenge.completedAt).toLocaleString('vi-VN')}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <Clock className="h-3 w-3" />
                      Tổng thời gian học: {elapsedTime}
                    </div>
                  </>
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              {isCompleted && selfLearningData?.score !== null && selfLearningData?.score !== undefined ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-green-600 dark:text-green-500">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Đã hoàn thành</span>
                  </div>
                  <div
                    className={`score-display ${selfLearningData.score < 7 ? 'score-low' :
                      selfLearningData.score < 8 ? 'score-medium' :
                      selfLearningData.score < 8.5 ? 'score-high' : 'score-excellent'}`}
                    onClick={() => selfLearningData.score !== null &&
                      selfLearningData.score !== undefined &&
                      selfLearningData.score >= 8.5 && fireConfetti()}
                    style={{
                      cursor: (selfLearningData.score !== null &&
                        selfLearningData.score !== undefined &&
                        selfLearningData.score >= 8.5) ? 'pointer' : 'default'
                    }}
                  >
                    {selfLearningData.score}
                    <span className="text-base ml-2 font-medium">điểm</span>
                  </div>
                </div>
              ) : isFailed ? (
                <div className="flex items-center text-red-600 dark:text-red-500">
                  <XCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">Không hoàn thành</span>
                </div>
              ) : (
                <Badge variant="secondary" className="text-xs py-1 px-2">
                  Đang học
                </Badge>
              )}
            </div>
          </div>

          {/* Lời khuyên của hệ thống */}
          {analyzedData?.note && (
            <div className="mt-4 flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/20 text-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] dark:shadow-[0_0_15px_rgba(var(--primary-rgb),0.25)] animate-pulse-subtle hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.25)] dark:hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.35)] transition-all duration-300 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-primary mb-1 flex items-center">
                  Lời khuyên dành cho bạn
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary ml-2 animate-ping opacity-75"></span>
                </h4>
                <p className="text-sm">{analyzedData.note}</p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mục tiêu học tập */}
          <div className="relative">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Mục tiêu học tập
            </h3>

            {/* Biểu tượng chìm */}
            <div className="absolute -right-4 -top-4 w-24 h-24 opacity-5 transform rotate-12 pointer-events-none">
              <Target className="w-full h-full text-primary" />
            </div>

            <p className="text-muted-foreground p-4 bg-secondary/10 border border-secondary/20 rounded-md relative z-10">
              {selfLearningData?.learningGoal}
            </p>
          </div>

          {/* Kiến thức học thuật */}
          {analyzedData?.academicKnowledge && (
            <div className="relative">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Kiến thức học thuật
              </h3>

              {/* Biểu tượng chìm */}
              <div className="absolute -right-4 -top-4 w-32 h-32 opacity-5 transform rotate-12 pointer-events-none">
                <GraduationCap className="w-full h-full text-primary" />
              </div>
              <div className="absolute -left-4 -bottom-4 w-24 h-24 opacity-5 transform -rotate-12 pointer-events-none">
                <BookOpen className="w-full h-full text-primary" />
              </div>

              {/* Nội dung kiến thức */}
              <div
                className="p-6 bg-secondary/20 border border-secondary/30 rounded-md prose prose-sm dark:prose-invert max-w-none relative z-10 shadow-sm"
                dangerouslySetInnerHTML={{ __html: analyzedData.academicKnowledge }}
              />

              {/* Biểu tượng chìm khác */}
              <div className="absolute right-8 bottom-8 opacity-10 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
            </div>
          )}

          {/* Câu trả lời của người dùng */}
          {(isCompleted || isFailed) && selfLearningData?.userAnswer && (
            <div className="relative">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Câu trả lời của bạn
              </h3>

              {/* Biểu tượng chìm */}
              <div className="absolute -right-4 -top-4 w-24 h-24 opacity-5 transform rotate-12 pointer-events-none">
                <MessageSquare className="w-full h-full text-primary" />
              </div>

              <div className="p-4 bg-secondary/20 border border-secondary/30 rounded-md shadow-sm relative z-10">
                <p className="whitespace-pre-wrap">{selfLearningData.userAnswer}</p>
              </div>
              {selfLearningData.score !== null && selfLearningData.score !== undefined && (
                <div className="mt-4 flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Kết quả:</span>
                    <div
                      className={`score-display ${selfLearningData.score < 7 ? 'score-low' :
                        selfLearningData.score < 8 ? 'score-medium' :
                        selfLearningData.score < 8.5 ? 'score-high' : 'score-excellent'}`}
                      onClick={() => selfLearningData.score !== null &&
                        selfLearningData.score !== undefined &&
                        selfLearningData.score >= 8.5 && fireConfetti()}
                      style={{
                        fontSize: '2rem',
                        cursor: (selfLearningData.score !== null &&
                          selfLearningData.score !== undefined &&
                          selfLearningData.score >= 8.5) ? 'pointer' : 'default'
                      }}
                    >
                      {selfLearningData.score}
                      <span className="text-xs ml-1 opacity-70 font-normal">điểm</span>
                    </div>
                  </div>

                  {selfLearningData.score >= 8.5 && (
                    <div className="flex items-center gap-2 bg-yellow-500/10 dark:bg-yellow-400/10 p-2 rounded-md border border-yellow-500/20 dark:border-yellow-400/20 mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500 dark:text-yellow-400">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                        <span className="animate-pulse">Xuất sắc!</span> Bạn đã hoàn thành thử thách này với kết quả rất tốt.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Thông tin phân tích */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyzedData?.scope && (
              <div>
                <h4 className="text-sm font-medium mb-1">Phạm vi học tập</h4>
                <p className="text-sm text-muted-foreground">{analyzedData.scope}</p>
              </div>
            )}

            {analyzedData?.context && (
              <div>
                <h4 className="text-sm font-medium mb-1">Bối cảnh</h4>
                <p className="text-sm text-muted-foreground">{analyzedData.context}</p>
              </div>
            )}

            {/* Thời gian học tập thực tế */}
            <div>
              <h4 className="text-sm font-medium mb-1">Thời gian học tập</h4>
              <p className="text-sm text-muted-foreground">
                {isCompleted || isFailed ? (
                  <>
                    <span className="font-medium">Đã học:</span> {elapsedTime}
                  </>
                ) : (
                  <>
                    <span className="font-medium">Đang học:</span> {elapsedTime}
                  </>
                )}
              </p>
            </div>

            {analyzedData?.estimatedTime && (
              <div>
                <h4 className="text-sm font-medium mb-1">Thời gian ước tính</h4>
                <p className="text-sm text-muted-foreground">
                  Cơ bản: {analyzedData.estimatedTime.basic}<br />
                  Người mới: {analyzedData.estimatedTime.newbie}
                </p>
              </div>
            )}

            {analyzedData?.relatedIssues && (
              <div>
                <h4 className="text-sm font-medium mb-1">Vấn đề liên quan</h4>
                <p className="text-sm text-muted-foreground">{analyzedData.relatedIssues}</p>
              </div>
            )}
          </div>

          {/* Nút đã học xong */}
          {!isCompleted && !isFailed && !isLearningCompleted && challenge?.status === 'in_progress' && (
            <div className="mt-6 flex flex-col items-center">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Bạn đã hoàn thành việc học chưa?</h3>
                <p className="text-sm text-muted-foreground">
                  Khi bạn đã học xong, hãy nhấn nút bên dưới để tiếp tục trả lời các câu hỏi.
                </p>
                {selfLearningData?.aiGeneratedQuestion && selfLearningData.aiGeneratedQuestion.length > 0 && (
                  <div className="mt-2 inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Bài kiểm tra gồm {selfLearningData.aiGeneratedQuestion.length} câu hỏi
                  </div>
                )}
              </div>
              <Button
                onClick={handleLearningComplete}
                className="w-full md:w-1/2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                size="lg"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Đã học xong
              </Button>
            </div>
          )}

          {/* Dialog câu hỏi */}
          {selfLearningData?.aiGeneratedQuestion && selfLearningData.aiGeneratedQuestion.length > 0 && (
            <QuestionDialog
              open={showQuestionDialog}
              onOpenChange={setShowQuestionDialog}
              questions={selfLearningData.aiGeneratedQuestion}
              onSubmit={handleSubmitAnswers}
              tabSwitchCount={tabSwitchCount}
              onTabSwitch={() => setTabSwitchCount(prev => prev + 1)}
              // Không cần truyền tabSwitchCount vì đã được xử lý trong QuestionDialog
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
