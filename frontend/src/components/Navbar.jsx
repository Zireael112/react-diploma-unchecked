import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchLogoutUser } from "../store/authReducer";
import { Button, Flex, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

const Navbar = () => {
  const user = useSelector((state) => state.auth.user);
  const [localUser, setLocalUser] = useState(user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setLocalUser(user);
  }, [user, dispatch]);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(fetchLogoutUser());
    setLocalUser(null);
    navigate("/");
  };

  return (
    <Flex gap="small" wrap="wrap" className="navigation">
      {localUser !== null ? (
        <div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <p>
              <UserOutlined />
              <Typography.Text underline strong>
                {user.username.toUpperCase()}
              </Typography.Text>
            </p>
            <Button onClick={handleLogout} type="primary">
              Выйти
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/">
            <Button type="primary">Войти</Button>
          </Link>
          <Link to="/register">
            {" "}
            <Button>Зарегистрироваться</Button>
          </Link>
        </div>
      )}
    </Flex>
  );
};

export default Navbar;
