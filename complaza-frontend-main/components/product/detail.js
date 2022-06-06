import React from "react"
import PropTypes from "prop-types"
import { Col, Image, Row, Typography } from "antd"

const { Text, Title, Link } = Typography

function Detail({ image, link, name, price, retailer }) {
  return (
    <Row>
      <Col span={12}>
        <Image src={image} width={480} />
      </Col>
      <Col span={12}>
        <Title>{name}</Title>
        <Text strong style={{ fontSize: 24 }}>
          ${price}
        </Text>
        <p>
          <Link href={link} target="_blank">
            Buy on {retailer}
          </Link>
        </p>
      </Col>
    </Row>
  )
}

Detail.propTypes = {
  image: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  retailer: PropTypes.string.isRequired,
}

export default Detail
