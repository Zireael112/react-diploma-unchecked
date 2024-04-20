/* eslint-disable no-unused-expressions */
import React, { useEffect, useState, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import {
  deleteFile,
  fetchFiles,
  uploadFile,
} from "../store/filesReducer";
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
const EditableContext = React.createContext(null);
const { Title } = Typography;
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
const BASE_URL = 'http://localhost:8000'
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

export const FilesHandler = () => {
  const error = useSelector((state) => state.files.error);
  const user = useSelector((state) => state.auth.user);
  const userFiles = useSelector((state) => state.files.files);
  const dispatch = useDispatch();

  const [dataSource, setDataSource] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [fileComment, setFileComment] = useState("");

  const columns = [
    {
      title: "Название файла",
      dataIndex: "name",
      editable: true,
    },
    {
      title: "Комментарий",
      dataIndex: "comments",
      editable: true,
    },
    {
      title: "Размер файла",
      dataIndex: "size",
    },
    {
      title: "Дата загрузки файла",
      dataIndex: "date",
    },
    {
      title: "Операции",
      dataIndex: "Операции",
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <div
            style={{ display: "flex", gap: "1rem" }}
            className="file-operations"
          >
            <Popconfirm
              title="Вы уверены?"
              onConfirm={() => handleDelete(record.key)}
            >
              <a>Удалить</a>
            </Popconfirm>
            <a
              className="link-button"
              onClick={() => handleGenerateLink(record)}
            >
              Скопировать ссылку
            </a>
            <a onClick={() => handleDownload(record)}>Скачать</a>
          </div>
        ) : null,
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
              comments: file.comment,
              size: formatFileSize(file.size),
              date: format(new Date(file.upload_date), "dd/MM/yyyy HH:mm"),
            };
          })
        )
      : null;
  }, [userFiles]);

  const handleDelete = async (key) => {
    await dispatch(deleteFile({ fileID: key }));
    await dispatch(fetchFiles());
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("name", fileToUpload.name);
    formData.append("comment", fileComment);
    formData.append("user", user.username);
    setFileComment(null);
    setFileToUpload(null);

    await dispatch(uploadFile({ formData }));
    await dispatch(fetchFiles());
  };

  const handleDownload = (key) => {
    const fileDownloadLink = `${BASE_URL}/files/${key.key}`;
    if (fileDownloadLink) {
      const link = document.createElement("a");
      link.href = fileDownloadLink;
      link.download = key.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleGenerateLink = (key) => {
    const link = `${BASE_URL}/files/${key.key}/`;
    const clipboardInstance = new ClipboardJS(".link-button", {
      text: () => link,
    });
    clipboardInstance.on("success", () => {
      onCopyLink(link);
      clipboardInstance.destroy();
    });
  };

  const onCopyLink = () => {
    window.alert("Ссылка скопирована!");
  };

  const formatFileSize = (sizeInBytes) => {
    const sizeInMegabytes = sizeInBytes / (1024 * 1024);
    const formattedSize = sizeInMegabytes.toFixed(2);
    return `${formattedSize} MB`;
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
    <div className="user__files">
      <Table
        rowClassName={() => "editable-row"}
        bordered
        columns={tableColumns}
        components={components}
        dataSource={dataSource}
      />

      <div className="file-upload">
        <Title level={2}>Добавить новый файл</Title>

        <Form onFinish={handleUpload}>
          <Form.Item name="upload">
            <label class="input-file">
              <input
                onChange={(e) => {
                  setFileToUpload(e.target.files[0]);
                }}
                type="file"
                name="file"
              />
              {fileToUpload ? (
                <span>{fileToUpload.name}</span>
              ) : (
                <span>Выберите файл</span>
              )}
            </label>
          </Form.Item>
          <Form.Item style={{ width: "25%" }} name="comment">
            <Input
              onChange={(e) => setFileComment(e.target.value)}
              allowClear
              placeholder="Введите ваш комментарий"
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Принять
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
