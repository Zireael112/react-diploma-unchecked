/* eslint-disable no-unused-expressions */
import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchUsers,
  fetchAdminToggle,
  fetchDeleteUser,
  fetchInspectFiles,
  setInspectedUser,
} from "../store/adminReducer";
import { Table, Popconfirm, Form, Input, Typography, Spin } from "antd";

export const DashBoard = () => {
  const { Title } = Typography;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState([]);

  const EditableContext = React.createContext(null);
  const users = useSelector((state) => state.admin.users);
  const loading = useSelector((state) => state.admin.loading);
  const error = useSelector((state) => state.admin.error);

  const columns = [
    {
      title: "Имя пользователя",
      dataIndex: "name",
    },
    {
      title: "Почта",
      dataIndex: "email",
    },
    {
      title: "Количество файлов",
      dataIndex: "amount",
    },
    {
      title: "Размер файлов",
      dataIndex: "size",
    },
    {
      title: "Операции",
      dataIndex: "operations",
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <div
            style={{ display: "flex", gap: "1rem" }}
            className="file-operations"
          >
            <a
              className="check-link"
              onClick={() => handleInspectUser(record.id)}
            >
              Посмотреть
            </a>
            <Popconfirm
              title="Вы уверены?"
              onConfirm={() => handleDeleteUser(record.id)}
            >
              <a>Удалить</a>
            </Popconfirm>
          </div>
        ) : null,
    },
  ];

  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
      if (editing) {
        inputRef.current?.focus();
      }
    }, [editing]);
    const toggleEdit = () => {
      setEditing(!editing);

      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    };
    const save = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({
          ...record,
          ...values,
        });
      } catch (errInfo) {}
    };
    let childNode = children;
    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `${title} is required.`,
            },
          ]}
        >
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        </Form.Item>
      ) : (
        <div
          className="editable-cell-value-wrap"
          style={{
            paddingRight: 24,
          }}
          onClick={toggleEdit}
        >
          {children}
        </div>
      );
    }
    return <td {...restProps}>{childNode}</td>;
  };

  const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };

  useEffect(() => {
    if (error) return;
    Array.isArray(users)
      ? setDataSource(
          users.map((user) => {
            return {
              id: user.id,
              name: user.username,
              email: user.email,
              amount: user.num_files,
              size: formatFileSize(user.size_files),
            };
          })
        )
      : null;
  }, [users]);

  const tableColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const formatFileSize = (sizeInBytes) => {
    const sizeInMegabytes = sizeInBytes / (1024 * 1024);
    const formattedSize = sizeInMegabytes.toFixed(2);
    return `${formattedSize} MB`;
  };

  const handleToggleAdmin = async (id, is_staff) => {
    console.log(id);
    console.log(is_staff);
    try {
      await dispatch(fetchAdminToggle({ userID: id, is_staff: is_staff }));
      await dispatch(fetchUsers());
    } catch (error) {
      throw new Error(error);
    }
  };

  const handleDeleteUser = async (id) => {
    console.log(id);
    try {
      await dispatch(fetchDeleteUser({ userID: id }));
      await dispatch(fetchUsers());
    } catch (error) {
      throw new Error(error);
    }
  };

  const handleInspectUser = async (id) => {
    console.log(id);
    await dispatch(fetchInspectFiles(id));
    await dispatch(setInspectedUser(id));
    await navigate(`/inspect/${id}`);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__content">
        <Title style={{ padding: "1rem" }} level={2}>
          Пользователи
        </Title>
        <Table
          bordered
          columns={tableColumns}
          components={components}
          dataSource={dataSource}
        />
        <table style={{padding: '1rem'}}>
          <thead>
            <tr>
              <th>Выдача прав администратора</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <Spin /> : null}
            {error ? (
              <tr>
                <td>{error}</td>
              </tr>
            ) : users ? (
              users.map((user) => (
                <tr style={{ display: "flex", gap: "1rem" }} key={user.id}>
                  <td>{user.username}</td>
                  <td>&gt;</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={user.is_staff}
                      onChange={() =>
                        handleToggleAdmin(user.id, !user.is_staff)
                      }
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td>Нет пользователей</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
