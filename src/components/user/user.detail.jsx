import React from 'react'
import { Button, Drawer, notification } from 'antd';
import { useState, useEffect } from 'react';
// import { handleUploadFile, updateUserAvatarAPI, getUserDetailAPI } from '../../services/api.service';

const ViewUserDetail = (props) => {

    const {
        dataDetail,
        setDataDetail,
        isDetailOpen,
        setIsDetailOpen,
        loadUser
    } = props;

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [userDetail, setUserDetail] = useState(null);

    // Fetch user detail khi drawer mở
    useEffect(() => {
        if (isDetailOpen && dataDetail?._id) {
            fetchUserDetail();
        }
    }, [isDetailOpen, dataDetail?._id]);

    const fetchUserDetail = async () => {
        try {
            const res = await getUserDetailAPI(dataDetail._id);
            
            // API trả về user object trực tiếp với smart interceptor
            if (res && res._id) {
                setUserDetail(res);
            } else {
                notification.error({
                    message: "Error",
                    description: "Không thể tải thông tin user"
                });
            }
        } catch (error) {
            console.error("Fetch user detail error:", error);
            notification.error({
                message: "Error",
                description: error?.message || "Lỗi khi tải thông tin user"
            });
        }
    };

    const handleOnChangeFile = (event) => {

        if (!event.target.files || event.target.files.length === 0) { //ko chon file hoac rong
            setSelectedFile(null);
            setPreview(null);
            return; 
        }

        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleUpdateUserAvatar = async () => {
        try {
            //step 1: upload file
            const resUpload = await handleUploadFile(selectedFile, "avatar");
            if (resUpload.data) {
                //success
                const newAvatar = resUpload.data.fileUploaded;
                
                //step 2: update user
                const resUpdateAvatar = await updateUserAvatarAPI(
                    newAvatar, 
                    dataDetail._id, 
                    dataDetail.profile?.fullName || dataDetail.fullName, 
                    dataDetail.phone
                );

                // Với smart interceptor, resUpdateAvatar là user object trực tiếp
                if (resUpdateAvatar && resUpdateAvatar._id) {
                    setIsDetailOpen(false);
                    setSelectedFile(null);
                    setPreview(null);
                    await loadUser();

                    notification.success({
                        message: "Update user avatar",
                        description: "Cập nhật avatar thành công"
                    })

                } else {
                    notification.error({
                        message: "Error update avatar",
                        description: JSON.stringify(resUpdateAvatar.message)
                    })
                }
            } else {
                //failed
                notification.error({
                    message: "Error upload file",
                    description: JSON.stringify(resUpload.message)
                })
            }
        } catch (error) {
            console.error("Update avatar error:", error);
            notification.error({
                message: "Error update avatar",
                description: error?.message || "Cập nhật avatar thất bại, vui lòng thử lại!"
            });
        }
    }

    return (
        <Drawer
            width={"40vw"}
            title="Chi tiết User"
            onClose={() => {
                setDataDetail(null);
                setUserDetail(null);
                setIsDetailOpen(false);
            }}
            open={isDetailOpen}
        >
            {userDetail ? <>
                <p>Id: {userDetail._id}</p>
                <br />
                <p>Full name: {userDetail.profile?.fullName}</p>
                <br />
                <p>Email: {userDetail.email}</p>
                <br />
                <p>Phone number: {userDetail.phone}</p>
                <br />
                <p>Role: {userDetail.role}</p>
                <br />
                <p>Status: {userDetail.status}</p>
                <br />
                <p>Created at: {new Date(userDetail.createdAt).toLocaleString()}</p>
                <br />
                <p>Avatar:</p>
                <div style={{
                    marginTop: "10px",
                    height: "100px", width: "150px",
                    border: "1px solid #ccc"
                }}>
                    {userDetail.profile?.avatar ? (
                        <img style={{ height: "100%", width: "100%", objectFit: "contain" }}
                            src={userDetail.profile.avatar.startsWith('http') 
                                ? userDetail.profile.avatar 
                                : `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${userDetail.profile.avatar}`} 
                        />
                    ) : (
                        <div style={{ 
                            height: "100%", 
                            width: "100%", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            background: "#f5f5f5"
                        }}>
                            No Avatar
                        </div>
                    )}
                </div>
                <div>
                    <label htmlFor='btnUpload' style={{
                        display: "block",
                        width: "fit-content",
                        marginTop: "15px",
                        padding: "5px 10px",
                        background: "orange",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}>
                        Upload Avatar
                    </label>
                    <input
                        type='file' hidden id='btnUpload'
                        onChange={(event) => handleOnChangeFile(event)}
                    />
                </div>

                {preview &&
                    <>
                        <div style={{
                            marginTop: "10px",
                            marginBottom: "15px",
                            height: "100px", width: "150px",
                        }}>
                            <img style={{ height: "100%", width: "100%", objectFit: "contain" }}
                                src={preview} />
                        </div>
                        <Button type='primary'
                            onClick={() => handleUpdateUserAvatar()}
                        >Save</Button>
                    </>
                }
            </>
                :
                <>
                    <p>Không có dữ liệu</p>
                </>
            }
        </Drawer>
    )
}

export default ViewUserDetail;