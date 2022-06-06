import React, { useEffect, useMemo, useState, useCallback, useContext } from "react"
import { useRouter } from "next/router"
import { Row, Col, Grid, Image, Typography, message, Radio } from "antd"
import { API, Storage } from "aws-amplify"
import qs from "qs"
import ExpandableRow from "../components/product/expandable-row"
import AuthContext from "../context/auth"
import { deleteWishlist, postWishlist } from "../lib/wishlist"

const { Title } = Typography
const { useBreakpoint } = Grid

const RETAILERS = [
  // { name: "Amazon", url: "https://amazon.com" },
  { name: "Ebay", url: "https://ebay.com" },
  { name: "Shopee", url: "https://shopee.com" },
  { name: "Alibaba", url: "https://alibaba.com" },
]

const SORTBY_PRICE = "Price"
const SORTBY_RELEVANCE = "Relevance"
const SORTBY_OPTIONS = [
  { label: SORTBY_PRICE, value: SORTBY_PRICE },
  { label: SORTBY_RELEVANCE, value: SORTBY_RELEVANCE },
]

const sortItemsByPrice = (itemsByRetailer) => {
  const sortedByPrice = {}
  Object.keys(itemsByRetailer).forEach((retailer) => {
    sortedByPrice[retailer] = [...itemsByRetailer[retailer]].sort((a, b) => a.price - b.price)
  })

  return sortedByPrice
}

function Result() {
  const screens = useBreakpoint()

  const [itemsByRetailer, setItemsByRetailer] = useState({})
  const [sortBy, setSortBy] = useState(SORTBY_RELEVANCE)
  const [isSearching, setIsSearching] = useState(true)
  const [imageLink, setImageLink] = useState("")
  const { userId, token } = useContext(AuthContext)

  const router = useRouter()
  const { q, image } = router.query

  useEffect(() => {
    setIsSearching(true)

    if (!q) {
      return
    }

    const params = {
      q,
      sort_by: "price",
      uid: userId,
      img: image,
    }
    const link = `/search?${qs.stringify(params)}`

    API.get("default", link).then((res) => {
      if (res.statusCode !== 200) {
        console.error("error", res)
        return
      }

      setItemsByRetailer(res.body.items)
      setIsSearching(false)
    })
  }, [image, q, userId])

  useEffect(() => {
    if (!image) {
      return
    }

    Storage.get(image).then(setImageLink)
  }, [image])

  const addToWishlist = useCallback(
    (item) => {
      if (!token) {
        message.error("Please log in")
        return
      }

      if (!item) {
        return
      }

      postWishlist({ userId, token, item }).then((res) => {
        if (res.statusCode !== 200) {
          console.error("error")
          return
        }

        const { retailer } = item

        setItemsByRetailer((prevRetailers) => {
          const items = prevRetailers[retailer]
          const index = items.findIndex((i) => i.id === item.id)

          return {
            ...prevRetailers,
            [item.retailer]: [
              ...items.slice(0, index),
              { ...item, starred: true },
              ...items.slice(index + 1),
            ],
          }
        })
        message.success("Added to your wishlist")
      })
    },
    [token, userId]
  )

  const removeFromWishlist = useCallback(
    (item) => {
      if (!token) {
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

        const { retailer } = item
        setItemsByRetailer((prevRetailers) => {
          const items = prevRetailers[retailer]
          const index = items.findIndex((i) => i.id === item.id)

          return {
            ...prevRetailers,
            [item.retailer]: [
              ...items.slice(0, index),
              { ...item, starred: false },
              ...items.slice(index + 1),
            ],
          }
        })
        message.success("Removed from your wishlist")
      })
    },
    [token, userId]
  )

  const itemsToDisplay = useMemo(
    () => (sortBy === SORTBY_PRICE ? sortItemsByPrice(itemsByRetailer) : itemsByRetailer),
    [itemsByRetailer, sortBy]
  )

  return (
    <div>
      <Row wrap={!screens.sm} gutter={32}>
        <Col flex="300px" className="tw-mb-5">
          <Title level={3}>Results for...</Title>
          <p>
            <strong>&ldquo;{q}&rdquo;</strong>
          </p>
          {imageLink && (
            <Image
              src={imageLink}
              alt="image uploaded for search"
              height={screens.sm ? "auto" : 200}
            />
          )}
          <p className="tw-mt-5">Sort by</p>
          <Radio.Group
            options={SORTBY_OPTIONS}
            onChange={(e) => setSortBy(e.target.value)}
            value={sortBy}
            optionType="button"
            buttonStyle="solid"
          />
        </Col>
        <Col flex="auto">
          {RETAILERS.map(({ name }) => (
            <ExpandableRow
              key={name}
              isSearching={isSearching}
              retailerName={name}
              items={itemsToDisplay[name]}
              addToWishlist={addToWishlist}
              removeFromWishlist={removeFromWishlist}
            />
          ))}
        </Col>
      </Row>
    </div>
  )
}

export default Result
