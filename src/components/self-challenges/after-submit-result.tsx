'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AfterSubmitData } from '@/types/api';
import { CheckCircle, XCircle, BookOpen, Target, Lightbulb, BookMarked, AlertTriangle } from 'lucide-react';

interface AfterSubmitResultProps {
  data: AfterSubmitData;
}

export function AfterSubmitResult({ data }: AfterSubmitResultProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Xác định màu sắc dựa trên điểm câu hỏi
  const getPointColorClass = (point: number) => {
    if (point === 0) return 'text-destructive';
    if (point < 0.5) return 'text-orange-500';
    if (point < 0.8) return 'text-blue-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        Kết quả đánh giá học tập
      </h3>

      <div className="p-4 border rounded-lg bg-muted/30">
        <p className="text-base">{data.feedback}</p>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="details">Chi tiết câu hỏi</TabsTrigger>
          <TabsTrigger value="suggestions">Gợi ý cải thiện</TabsTrigger>
        </TabsList>

        {/* Tab Tổng quan */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mục tiêu đạt được */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Mục tiêu đạt được
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.learning_assessment.achieved_objectives.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {data.learning_assessment.achieved_objectives.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Chưa đạt được mục tiêu nào</p>
                )}
              </CardContent>
            </Card>

            {/* Điểm cần cải thiện */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Target className="h-4 w-4 mr-2 text-blue-500" />
                  Điểm cần cải thiện
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.learning_assessment.missing_points.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {data.learning_assessment.missing_points.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Không có điểm cần cải thiện</p>
                )}
              </CardContent>
            </Card>

            {/* Hiểu sai */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  Hiểu sai khái niệm
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.learning_assessment.misconceptions.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {data.learning_assessment.misconceptions.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Không có hiểu sai nào</p>
                )}
              </CardContent>
            </Card>

            {/* Hiệu quả thời gian */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-primary" />
                  Hiệu quả thời gian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{data.learning_assessment.time_efficiency}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Chi tiết câu hỏi */}
        <TabsContent value="details" className="space-y-4">
          {data.detail.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2 bg-muted/30">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-2">
                      {index + 1}
                    </div>
                    <span>{item.question}</span>
                  </div>
                  <Badge className={getPointColorClass(item.point)}>
                    {item.point} điểm
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">Câu trả lời của bạn:</h4>
                  <div className="p-3 bg-muted/20 rounded-md text-sm">
                    {item.answer || <span className="italic text-muted-foreground">Không có câu trả lời</span>}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
                    Nhận xét:
                  </h4>
                  <div className="p-3 bg-primary/5 rounded-md text-sm">
                    {item.comment}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    Độ chính xác: {item.accuracy}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Độ bao phủ kiến thức: {item.knowledge_coverage}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab Gợi ý cải thiện */}
        <TabsContent value="suggestions" className="space-y-4">
          {/* Gợi ý cải thiện */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-500" />
                Gợi ý cải thiện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {data.suggestions.improvement.map((item, index) => (
                  <li key={index} className="text-sm">{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Tài nguyên học tập */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <BookMarked className="h-4 w-4 mr-2 text-green-500" />
                Tài nguyên học tập
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {data.suggestions.resources.map((item, index) => (
                  <li key={index} className="text-sm">{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
