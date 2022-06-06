import React from "react"
import styled from "styled-components"

import { Skeleton, Spin, Row, Col, Card, Button } from "antd"
import { StarOutlined, LoadingOutlined } from "@ant-design/icons"

const { Meta } = Card

const Wrapper = styled.div`
  width: 240px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
`

function ResultsLoader({ wrap = false }) {
  return (
    <Row gutter={16} wrap={wrap}>
      {[...new Array(20).keys()].map((_, index) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Col key={index} className="tw-mb-5">
            <Card
              style={{ width: 240 }}
              cover={
                <Wrapper>
                  <Spin
                    size="large"
                    indicator={
                      <LoadingOutlined
                        style={{ fontSize: 64, color: "rgba(129, 129, 129, 0.24)" }}
                        spin
                      />
                    }
                  />
                </Wrapper>
              }
            >
              <Meta
                title={<Skeleton.Input active size="small" />}
                description={
                  <Row>
                    <Col flex="auto">
                      <Skeleton.Button active size="small" />
                    </Col>
                    <Col>
                      <Button icon={<StarOutlined />} shape="circle" disabled />
                    </Col>
                  </Row>
                }
              />
            </Card>
          </Col>
        )
      })}
    </Row>
  )
}

export default ResultsLoader
