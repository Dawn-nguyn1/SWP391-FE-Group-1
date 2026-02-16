__lưu ý__
khi đặt lại code mà không biết cấu trúc đi thế nào thì chạy trang admin thử là biết, nhìn tên file và component để biết nó render ra giao diện gì.


# hướng dẫn pull về và sửa code vào
1. tại file main
khi vào <CustomerLayout /> sẽ thấy <Outlet>, đấy là nơi để render các component con (giao diện mình muốn nó hiển thị bên phía customer).

2. hiện tại giao diện Long đang làm chủ yếu nằm ở folder pages và components (đã chia thành các folder nhỏ cho admin và customer).
- các giao diện dùng chung như trang login, register, reset password, forget password sẽ được làm con folder pages 
3. t đã thay đổi url mới để khỏi trùng với m, m nên cẩn thận khi đặt tên file và url