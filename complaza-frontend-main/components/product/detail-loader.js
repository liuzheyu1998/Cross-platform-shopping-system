import React from "react"
import styled from "styled-components"
import { Skeleton, Col, Spin, Row, Typography } from "antd"
import { LoadingOutlined } from "@ant-design/icons"

const { Text, Title } = Typography

const Wrapper = styled.div`
  width: 480px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
`

function DetailLoader() {
  return (
    <Row>
      <Col span={12}>
        <Wrapper>
          <Spin
            size="large"
            indicator={
              <LoadingOutlined style={{ fontSize: 64, color: "rgba(129, 129, 129, 0.24)" }} spin />
            }
          />
        </Wrapper>
      </Col>
      <Col span={12}>
        <Title>
          <Skeleton.Button active size="large" />
        </Title>
        <Text strong style={{ fontSize: 24 }}>
          <Skeleton.Input active size="small" />
        </Text>
        <p>
          <Skeleton.Button active size="small" />
        </p>
      </Col>
    </Row>
  )
}

export default DetailLoader
