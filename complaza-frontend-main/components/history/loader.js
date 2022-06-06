import React from "react"
import styled from "styled-components"
import { List, Skeleton, Spin, Grid } from "antd"
import { LoadingOutlined } from "@ant-design/icons"

const { useBreakpoint } = Grid

const Wrapper = styled.div`
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ITEM = {
  q: "",
  date: "",
  image: "",
}

function Loader() {
  const screens = useBreakpoint()

  return (
    <List
      dataSource={[...new Array(20).keys()].map(() => ({ ...ITEM, image: Math.random() > 0.7 }))}
      renderItem={({ image }, index) => (
        <List.Item
          key={index}
          extra={
            image && screens.sm ? (
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
            ) : null
          }
        >
          <List.Item.Meta
            title={
              <Skeleton title={{ width: Math.random() * 200 + 200 }} paragraph={false} active />
            }
            description={
              <Skeleton title={{ width: Math.random() * 200 + 200 }} paragraph={false} active />
            }
          />
        </List.Item>
      )}
    />
  )
}

export default Loader
