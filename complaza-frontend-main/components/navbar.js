import React, { useContext } from "react"
import Link from "next/link"
import { Layout, Menu, Dropdown, Button } from "antd"
import { UserSwitchOutlined } from "@ant-design/icons"
import Image from "next/image"
import styled from "styled-components"
import { useRouter } from "next/router"
import AuthContext from "../context/auth"

const { Header } = Layout

const LogoWrapper = styled.div`
  padding: 0;
  margin-right: 32px;
  display: flex;
  align-items: center;
`

const UserWrapper = styled(Menu.Item)`
  margin-left: auto;
`

const ROUTES = {
  "/": { text: "Search", key: 1 },
  "/wishlist": { text: "Wishlist", key: 2 },
  "/history": { text: "History", key: 3 },
}

function Navbar() {
  const { isLoggedIn } = useContext(AuthContext)
  const router = useRouter()

  const menu = (
    <Menu selectable>
      {isLoggedIn ? (
        <Menu.Item key={1} danger>
          <Link href="/logout">Logout</Link>
        </Menu.Item>
      ) : (
        <Menu.Item key={2}>
          <Link href="/login">Login</Link>
        </Menu.Item>
      )}
    </Menu>
  )

  const selectedKey = ROUTES[router.pathname]?.key || ""

  return (
    <Header
      style={{ position: "fixed", zIndex: 1, width: "100%", display: "flex", alignItems: "center" }}
    >
      <LogoWrapper>
        <Image src="/logo.png" alt="complaza logo" height="32" width="32" />
      </LogoWrapper>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={[selectedKey]}
        style={{ width: "100%" }}
      >
        {Object.keys(ROUTES).map((route) => (
          <Menu.Item key={ROUTES[route].key}>
            <Link href={route}>{ROUTES[route].text}</Link>
          </Menu.Item>
        ))}

        <Dropdown overlay={menu} placement="bottomLeft">
          <UserWrapper key={3}>
            <UserSwitchOutlined />
          </UserWrapper>
        </Dropdown>
      </Menu>
    </Header>
  )
}

export default Navbar
