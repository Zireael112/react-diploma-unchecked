/* eslint-disable no-unused-expressions */
import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInspectFiles,
  AdminUpdateFile,
  AdminDeleteFile,
} from "../store/adminReducer";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { BASIC_URL } from "../settings/basic";
import ClipboardJS from "clipboard";
import {
  Table,
  Popconfirm,
  Form,
  Input,
  Button,
  Space,
  Typography,
} from "antd";

export const AdminInspectFiles = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [newFileName, setNewFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [generatedLink, setGeneratedLink] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const user = useSelector((state) => state.auth.user);
  const users = useSelector((state) => state.admin.users);
  const inspectedUser = useSelector((state) => state.admin.inspectedUser);
  const userFiles = useSelector((state) => state.admin.inspectFiles);
  const error = useSelector((state) => state.admin.error);

  const EditableContext = React.createContext(null);
  const { Title } = Typography;

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

  const handleRename = async () => {
    await dispatch(
      AdminUpdateFile({
        userID: inspectedUser,
        fileID: selectedFile.id,
        message: { name: newFileName },
      })
    );
    setSelectedFile(null);
    await dispatch(fetchInspectFiles(inspectedUser)); // Fetch the updated file list
    setLoaded(false);
  };

  const handleDelete = async () => {
    await dispatch(
      AdminDeleteFile({ userID: inspectedUser, fileID: selectedFile.id })
    );
    setSelectedFile(null);
    await dispatch(fetchInspectFiles(inspectedUser)); // Fetch the updated file list
    setLoaded(false);
  };

  const handleDownload = () => {
    const fileUUID = selectedFile.uuid;

    const fileDownloadLink = `${BASIC_URL}/files/${fileUUID}/`;

    if (fileDownloadLink) {
      const link = document.createElement("a");

      link.href = fileDownloadLink;

      link.download = selectedFile.name;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
    }
  };

  const handleGenerateLink = () => {
    const fileUUID = selectedFile.uuid;
    const link = `${BASIC_URL}/files/${fileUUID}/`;
    setGeneratedLink(link);
  };

  const onCopyLink = () => {
    window.alert("Сылка скопирована!");
  };

  const handleCopyLink = () => {
    const clipboardInstance = new ClipboardJS(".copy-link-button", {
      text: () => generatedLink,
    });
    clipboardInstance.on("success", () => {
      onCopyLink();
      clipboardInstance.destroy();
    });
  };

  const columns = [
    {
      title: "Название файла",
      dataIndex: "name",
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
    },
    {
      title: "Размер файлов",
      dataIndex: "size",
    },
    {
      title: "Дата загрузки файла",
      dataIndex: "date",
    },
    {
      title: "Дата последней загрузки",
      dataIndex: "last_date",
      render: (_, record) => {
        record.last_download_date
          ? format(new Date(record.last_download_date), "dd/MM/yyyy HH:mm")
          : "";
      },
    },
  ];

  useEffect(() => {
    if (error) return;
    Array.isArray(userFiles)
      ? setDataSource(
          userFiles.map((file) => {
            return {
              key: file.id,
              name: file.name,
              comment: file.comment,
              size: formatFileSize(file.size),
              date: format(new Date(file.upload_date), "dd/MM/yyyy HH:mm"),
              last_date: format(
                new Date(file.last_download_date),
                "dd/MM/yyyy HH:mm"
              ),
            };
          })
        )
      : null;
  }, [userFiles]);

  const formatFileSize = (sizeInBytes) => {
    const sizeInMegabytes = sizeInBytes / (1024 * 1024);
    const formattedSize = sizeInMegabytes.toFixed(2);
    return `${formattedSize} MB`;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

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

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  return (
    <div className="user-storage">
      <Title style={{ padding: "1rem" }} level={2}>
        Файлы пользователя{" "}
        {users.find((user) => user.id === inspectedUser).username.toUpperCase()}
      </Title>

      <Table
        bordered
        columns={tableColumns}
        components={components}
        dataSource={dataSource}
      />
      <div style={{ padding: "1rem" }}>
        <Button
          className="menu-btn"
          style={{ position: "relative" }}
          type="primary"
          onClick={handleGoBack}
        >
          Назад
        </Button>
      </div>
    </div>
  );
};
