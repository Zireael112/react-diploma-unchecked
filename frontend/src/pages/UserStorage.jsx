import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFiles } from "../store/filesReducer";
import { FilesHandler } from "../components/FilesHandler";
import { DashBoard } from "../components/DashBoard";
import Typography from "antd/es/typography/Typography";
import { Button } from "antd";

export const UserStorage = () => {
  const { Title } = Typography;
  const dispatch = useDispatch();
  const [filesBtn, setfilesBtn] = useState(true);
  const [adminBtn, setAdminBtn] = useState(false);

  const handleMyFilesClick = () => {
    setfilesBtn(true);
    setAdminBtn(false);
  };

  const handleAdminClick = () => {
    setfilesBtn(false);
    setAdminBtn(true);
  };

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchFiles());
  }, [user, dispatch]);

  if (user.is_staff) {
    return (
      <>
        <Title className="admin-panel" level={2}>Панель админа</Title>
        {adminBtn ? (
          <div style={{ display: "flex", gap: "1rem", padding: '1rem'}}>
            <Button
              onClick={handleMyFilesClick}
              type="dashed"
              htmlType="submit"
            >
              Мои файлы
            </Button>
            <Button onClick={handleAdminClick} type="primary" primary>
              Админ панель
            </Button>
          </div>
        ) : null}
        {filesBtn ? (
          <div style={{ display: "flex", gap: "1rem", padding: '1rem'}}>
            <Button
              onClick={handleMyFilesClick}
              type="primary"
              htmlType="submit"
            >
              Мои файлы
            </Button>
            <Button onClick={handleAdminClick} type="dashed" primary>
              Админ панель
            </Button>
          </div>
        ) : null}
        {filesBtn ? <FilesHandler /> : null}
        {adminBtn ? <DashBoard /> : null}
      </>
    );
  }

  return <FilesHandler />;
};
