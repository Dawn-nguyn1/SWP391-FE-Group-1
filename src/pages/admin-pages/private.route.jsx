import React, { useContext } from 'react'
import { AuthContext } from '../../context/auth.context'; 
import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

const PrivateRoute = (props) => {
    const { user } = useContext(AuthContext);

    if (user && user.id) {
        return (
            <>
                {props.children}
            </> )
    }
    return (
         <Result
      status="404"
      title="Unaauthorize!"
      subTitle={"Bạn cần đăng nhập để truy cập nguồn tài nguyên"}
      extra={<Button type="primary">
        <Link to='/login'> <span>Back to Login page</span></Link>
      </Button>}
    />
    )


}

export default PrivateRoute