'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { UserCircle, Mail, Calendar, MapPin, Briefcase, Edit, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: 'Chưa có thông tin giới thiệu',
    location: 'Việt Nam',
    joinDate: '01/01/2023',
    occupation: 'Học sinh/Sinh viên'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Giả lập lưu thông tin
    toast.success('Cập nhật thông tin thành công!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset lại form data từ user
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} variant="default">
              <Save className="h-4 w-4 mr-2" />
              Lưu
            </Button>
            <Button onClick={handleCancel} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thông tin cá nhân */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Thông tin cơ bản về tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-32 w-32 border-4 border-primary/20">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-4xl font-medium">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{user?.name || 'Người dùng'}</h3>
              <p className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</p>
            </div>

            <div className="w-full space-y-3 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <span>ID: {user?.id || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>Tham gia: {formData.joinDate}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{formData.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <span>{formData.occupation}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin chi tiết */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin chi tiết</CardTitle>
            <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Tài khoản</TabsTrigger>
                <TabsTrigger value="preferences">Tùy chọn</TabsTrigger>
              </TabsList>
              <TabsContent value="account" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Giới thiệu</Label>
                  <Input 
                    id="bio" 
                    name="bio" 
                    value={formData.bio} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Nghề nghiệp</Label>
                  <Input 
                    id="occupation" 
                    name="occupation" 
                    value={formData.occupation} 
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </TabsContent>
              <TabsContent value="preferences" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tùy chọn thông báo</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email-notifications" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="email-notifications">Nhận thông báo qua email</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="app-notifications" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="app-notifications">Nhận thông báo trong ứng dụng</label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Quyền riêng tư</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="profile-public" className="rounded border-gray-300" />
                      <label htmlFor="profile-public">Hồ sơ công khai</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="show-activity" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="show-activity">Hiển thị hoạt động của tôi</label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-xs text-muted-foreground">Cập nhật lần cuối: Hôm nay</p>
            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">Lưu thay đổi</Button>
                <Button onClick={handleCancel} variant="outline" size="sm">Hủy</Button>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Thống kê */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Thống kê hoạt động</CardTitle>
            <CardDescription>Tổng quan về hoạt động của bạn trên hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <h3 className="text-3xl font-bold text-primary">0</h3>
                <p className="text-sm text-muted-foreground">Thử thách đã tạo</p>
              </div>
              <div className="bg-green-500/10 p-4 rounded-lg text-center">
                <h3 className="text-3xl font-bold text-green-500">0</h3>
                <p className="text-sm text-muted-foreground">Thử thách hoàn thành</p>
              </div>
              <div className="bg-yellow-500/10 p-4 rounded-lg text-center">
                <h3 className="text-3xl font-bold text-yellow-500">0</h3>
                <p className="text-sm text-muted-foreground">Đang thực hiện</p>
              </div>
              <div className="bg-red-500/10 p-4 rounded-lg text-center">
                <h3 className="text-3xl font-bold text-red-500">0</h3>
                <p className="text-sm text-muted-foreground">Thử thách thất bại</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
