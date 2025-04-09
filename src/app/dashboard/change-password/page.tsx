import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/app/dashboard/change-password/change-password-form";

export default function ChangePasswordPage() {
  return (
    <div className="container py-6">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Đổi mật khẩu</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChangePasswordForm />
        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn đổi mật khẩu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Yêu cầu mật khẩu:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Tối thiểu 6 ký tự</li>
                <li>Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                <li>Không nên sử dụng thông tin cá nhân dễ đoán</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Lưu ý:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Sau khi đổi mật khẩu, bạn sẽ được đăng xuất</li>
                <li>Vui lòng đăng nhập lại bằng mật khẩu mới</li>
                <li>Không chia sẻ mật khẩu với người khác</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}