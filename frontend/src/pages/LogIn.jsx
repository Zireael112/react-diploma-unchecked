import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Spin, Alert } from "antd";
import { fetchLoginUser } from "../store/authReducer";

export const LogIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loginError = useSelector((state) => state.auth.error);
  const loading = useSelector((state) => state.auth.loading);

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = () => {
    dispatch(fetchLoginUser(user)).then((action) => {
      if (fetchLoginUser.fulfilled.match(action)) {
        const loggedInUser = action.payload;
        navigate(`/user/${loggedInUser["id"]}`);
      }
    });
  };
  return (
    <>
      <Form
        name="normal_login"
        className="login-form shadow"
        onFinish={handleSubmit}
      >
        {loginError && (
          <Alert
            className="messsage-error"
            message="Error"
            description={loginError}
            type="error"
            showIcon
          />
        )}
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: "Введите email!",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Email"
            onChange={(e) =>
              setUser({ ...user, email: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Введите пароль!",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Пароль"
            onChange={(e) =>
              setUser({ ...user, password: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Запомнить меня</Checkbox>
          </Form.Item>

          <a className="login-form-forgot" href="">
            Забыл пароль
          </a>
        </Form.Item>

        <Form.Item>
          {loading ? (
            <Spin />
          ) : (
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Войти
            </Button>
          )}
          Или <Link to={"/register"}>зарегистрируйтесь сейчас!</Link>
        </Form.Item>
      </Form>
    </>
  );
};
