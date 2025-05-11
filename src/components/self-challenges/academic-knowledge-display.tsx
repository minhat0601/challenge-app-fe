'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink, BookOpen, ListChecks, Lightbulb, Video, FileText, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

interface AcademicKnowledgeResource {
  type: string;
  title: string;
  description: string;
  url: string;
}

interface AcademicKnowledgeSection {
  title: string;
  content: string;
  examples?: string[];
  practiceExercises?: string[];
}

interface AcademicKnowledgeDetailedContent {
  [key: string]: AcademicKnowledgeSection;
}

interface AcademicKnowledge {
  overview: string;
  keyPoints: string[];
  detailedContent: AcademicKnowledgeDetailedContent;
  additionalResources: AcademicKnowledgeResource[];
  practicalTips: string[];
}

interface AcademicKnowledgeDisplayProps {
  data: string | AcademicKnowledge;
}

export default function AcademicKnowledgeDisplay({ data }: AcademicKnowledgeDisplayProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Kiểm tra xem data có phải là chuỗi hay đối tượng
  const isJsonData = typeof data !== 'string';
  
  // Nếu là chuỗi, hiển thị theo cách cũ
  if (!isJsonData) {
    return (
      <div
        className="p-6 bg-secondary/20 border border-secondary/30 rounded-md prose prose-sm dark:prose-invert max-w-none relative z-10 shadow-sm"
        dangerouslySetInnerHTML={{ __html: data as string }}
      />
    );
  }

  // Nếu là đối tượng JSON, hiển thị theo cấu trúc mới
  const knowledgeData = data as AcademicKnowledge;

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Tổng quan</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <ListChecks className="h-4 w-4" />
            <span className="hidden sm:inline">Nội dung chi tiết</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-1">
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Tài liệu tham khảo</span>
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Mẹo thực hành</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Tổng quan */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tổng quan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{knowledgeData.overview}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Điểm chính</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {knowledgeData.keyPoints.map((point, index) => (
                  <li key={index} className="text-sm">{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Nội dung chi tiết */}
        <TabsContent value="content" className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(knowledgeData.detailedContent).map(([key, section], index) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="text-base font-medium hover:no-underline">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="text-sm">
                    <p>{section.content}</p>
                  </div>

                  {section.examples && section.examples.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-2">Ví dụ:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {section.examples.map((example, i) => (
                          <li key={i} className="text-sm">{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.practiceExercises && section.practiceExercises.length > 0 && (
                    <div className="mt-3 p-3 bg-primary/5 rounded-md border border-primary/10">
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-1 text-primary" />
                        Bài tập thực hành:
                      </h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {section.practiceExercises.map((exercise, i) => (
                          <li key={i} className="text-sm">{exercise}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        {/* Tab Tài liệu tham khảo */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeData.additionalResources.map((resource, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{resource.title}</CardTitle>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {resource.type === 'video' ? 'Video' : 'Bài viết'}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                      {resource.type === 'video' ? (
                        <Video className="h-4 w-4 mr-2" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Xem {resource.type === 'video' ? 'video' : 'bài viết'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab Mẹo thực hành */}
        <TabsContent value="tips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mẹo thực hành</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {knowledgeData.practicalTips.map((tip, index) => (
                  <li key={index} className="text-sm">{tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
