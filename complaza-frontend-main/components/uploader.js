import React from "react"
import PropTypes from "prop-types"
import { Upload } from "antd"
import { InboxOutlined } from "@ant-design/icons"

const { Dragger } = Upload

function Uploader({ onSearch }) {
  const config = {
    name: "file",
    multiple: false,
    // FIXME: add support for png
    accept: "image/jpeg,image/jpg,image/png",
    listType: "picture-card",
    beforeUpload: () => false, // disable auto upload
  }

  const onChange = (info) => {
    const originalFile = info.fileList[0].originFileObj

    onSearch(originalFile)
  }

  return (
    <Dragger {...config} onChange={onChange}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Click or drag file to this area to upload</p>
      <p className="ant-upload-hint">Upload one image with .jpeg, .jpg, or .png format</p>
    </Dragger>
  )
}

Uploader.propTypes = {
  onSearch: PropTypes.func.isRequired,
}

export default Uploader
