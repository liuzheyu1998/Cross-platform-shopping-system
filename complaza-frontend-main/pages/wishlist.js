import React, { useState, useEffect, useContext, useCallback } from "react"
import { API } from "aws-amplify"
import { Row, Col, Typography, Empty, message } from "antd"
import { useRouter } from "next/router"
import qs from "qs"
import AuthContext from "../context/auth"
import Card from "../components/product/card"
import Loader from "../components/product/loader"
import { deleteWishlist, postWishlist } from "../lib/wishlist"
import withProtectedRoute from "../components/protected-route"
import SearchBar from "../components/search-bar"

const { Title } = Typography

function Wishlist() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { userId, token } = useContext(AuthContext)
  const [isError, setIsError] = useState(false)
  const [query, setQuery] = useState("")

  const queryFromWishlist = useCallback(
    (q) => {
      if (!userId || !token) {
        return
      }
      setIsLoading(true)
      const params = {
        q,
      }
      const link = q ? `/search/wishlist/${userId}?${qs.stringify(params)}` : `/wishlist/${userId}`

      API.get("default", link, {
        headers: {
          Authorization: token,
        },
      }).then((res) => {
        if (res.statusCode !== 200) {
          console.error("error")
        }

        setItems(res.body.items)
        setIsLoading(false)
      })
    },
    [token, userId]
  )

  useEffect(() => {
    queryFromWishlist()
  }, [queryFromWishlist, token, userId])

  const addToWishlist = useCallback(
    (item) => {
      if (!token) {
        // This shouldn't happen
        console.log("please log in")
        return
      }

      if (!item) {
        return
      }

      postWishlist({ userId, token, item }).then((res) => {
        if (res.statusCode !== 200) {
          console.error("error")
        }
      })
    },
    [token, userId]
  )

  const removeFromWishlist = useCallback(
    (item, index) => {
      if (!token) {
        // This shouldn't happen
        message.error("Please log in")
        return
      }

      if (!item) {
        return
      }

      deleteWishlist({ userId, token, item }).then((res) => {
        if (res.statusCode !== 200) {
          console.error("error")
          return
        }

        setItems((prevItems) => [...prevItems.slice(0, index), ...prevItems.slice(index + 1)])
      })
      message.success("Removed from your wishlist")
    },
    [token, userId]
  )

  const onSearch = useCallback(() => {
    setIsError(false)

    if (query === "") {
      setIsError(true)
      return
    }

    queryFromWishlist(query)
  }, [queryFromWishlist, query])

  const onClear = useCallback(() => {
    setQuery("")
    queryFromWishlist("")
  }, [queryFromWishlist])

  const onClickProduct = (id) => {
    router.push(`/products/${id}`)
  }

  return (
    <div>
      <Title>Wishlist</Title>

      <SearchBar
        isError={isError}
        query={query}
        setQuery={setQuery}
        onSearch={onSearch}
        onClear={onClear}
      />

      {isLoading ? (
        <Loader wrap />
      ) : items.length ? (
        <Row gutter={16}>
          {items?.map((item, index) => {
            const { id, link, name, image, price, retailer } = item
            return (
              <Col key={id} className="tw-mb-5">
                <Card
                  onClick={() => onClickProduct(item.id)}
                  name={name}
                  image={image}
                  price={price}
                  link={link}
                  retailerName={retailer}
                  starred
                  addToWishlist={() => addToWishlist(item, index)}
                  removeFromWishlist={() => removeFromWishlist(item, index)}
                />
              </Col>
            )
          })}
        </Row>
      ) : (
        <Empty
          description={
            <span>
              You haven&apos;t added anything to your wishlist. You can do so in the search results
              page.
            </span>
          }
        />
      )}
    </div>
  )
}

export default withProtectedRoute(Wishlist)
