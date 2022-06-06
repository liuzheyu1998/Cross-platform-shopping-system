import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { API } from "aws-amplify"
import { Col, Row } from "antd"
import Detail from "../../components/product/detail"
import Loader from "../../components/product/detail-loader"
import PriceHistory from "../../components/price-history"

function ProductDetails() {
  const router = useRouter()
  const { id } = router.query
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [priceHistory, setPriceHistory] = useState(null)

  useEffect(() => {
    setIsLoading(true)

    API.get("default", `/product/${id}`).then((res) => {
      const { statusCode, body } = res

      if (statusCode !== 200) {
        return
      }

      if (!body) {
        return
      }

      setProduct(body.product)
      setPriceHistory(body.price_history)
      setIsLoading(false)
    })
  }, [id])

  if (isLoading || !product || !priceHistory) {
    return <Loader />
  }

  const { image, link, name, price, retailer } = product
  return (
    <>
      <Detail image={image} link={link} name={name} price={price} retailer={retailer} />
      <Row>
        <Col flex="auto">
          <PriceHistory prices={priceHistory} />
        </Col>
      </Row>
    </>
  )
}

export default ProductDetails
