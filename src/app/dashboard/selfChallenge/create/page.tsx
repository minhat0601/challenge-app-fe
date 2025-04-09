'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CreateChallengePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedDays: '',
    learningGoals: '',
    currentKnowledge: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement API call to create self-learning challenge
      toast.success('Thử thách tự học đã được tạo thành công!');
      router.push('/dashboard/selfChallenge');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo thử thách!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tạo thử thách tự học</h2>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/selfChallenge')}
        >
          Quay lại
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin thử thách tự học</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tên thử thách</Label>
              <Input
                id="title"
                placeholder="Nhập tên thử thách"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về thử thách tự học của bạn"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learningGoals">Mục tiêu học tập</Label>
              <Textarea
                id="learningGoals"
                placeholder="Liệt kê các mục tiêu học tập cụ thể bạn muốn đạt được"
                value={formData.learningGoals}
                onChange={(e) =>
                  setFormData({ ...formData, learningGoals: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentKnowledge">Kiến thức hiện tại</Label>
              <Textarea
                id="currentKnowledge"
                placeholder="Mô tả kiến thức và kỹ năng hiện tại của bạn về chủ đề này"
                value={formData.currentKnowledge}
                onChange={(e) =>
                  setFormData({ ...formData, currentKnowledge: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDays">Thời gian dự kiến (ngày)</Label>
              <Input
                id="estimatedDays"
                type="number"
                min="1"
                placeholder="Nhập số ngày dự kiến"
                value={formData.estimatedDays}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedDays: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo thử thách'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}