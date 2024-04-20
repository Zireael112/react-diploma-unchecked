import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch} from "react-redux";
import { fetchRegisterUser, clearError } from "../store/authReducer";
import { Button, Form, Input, Breadcrumb } from "antd";
import { Link } from "react-router-dom";

export const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: {
      xs: {
        span: 16,
      },
      sm: {
        span: 8,
      },
    },
    wrapperCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 16,
      },
    },
  };
  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 8,
      },
    },
  };

  const [registerUser, setRegisterUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  const changeHandler = (e) => {
    const { name, value } = e.target;

    setRegisterUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));

  };

  const handleSubmit = () => {
    dispatch(fetchRegisterUser(registerUser)).then((action) => {
      const isRegisterUserFulfilled = fetchRegisterUser.fulfilled.match(action);
      if (isRegisterUserFulfilled) {
        dispatch(clearError());
        navigate(`/`);
      }
    });
  };

  return (
    <div className="registerForm shadow">
      <Breadcrumb
        className="back-to-login"
        items={[
          {
            title: <Link to={"/"}>Войти</Link>,
          },
        ]}
      />
      <Form
        {...formItemLayout}
        form={form}
        name="register"
        value={registerUser.username}
        onFinish={handleSubmit}
        scrollToFirstError
      >
        <Form.Item
          name="login"
          label="Логин"
          rules={[
            {
              required: true,
              message: "Введите ваш логин!",
              whitespace: true,
            },
          ]}
        >
          <Input name="username" onChange={(e) => changeHandler(e)} />
        </Form.Item>
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            {
              type: "email",
              message: "Это не похоже на E-mail!",
            },
            {
              required: true,
              message: "Введите E-mail",
            },
          ]}
        >
          <Input name="email" onChange={(e) => changeHandler(e)} />
        </Form.Item>

        <Form.Item
          name="password"
          label="Пароль"
          rules={[
            {
              required: true,
              message: "Введите пароль!",
            },
          ]}
          hasFeedback
        >
          <Input.Password name="password" onChange={(e) => changeHandler(e)} />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Повторите пароль"
          dependencies={["password"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Повторите пароль!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Пароль не совпадает!"));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            Зарегистироваться
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
