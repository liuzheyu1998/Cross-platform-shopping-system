import React from "react"
import PropTypes from "prop-types"
import { Card, Button, Row, Col, Typography } from "antd"
import { StarOutlined, StarFilled } from "@ant-design/icons"

const { Meta } = Card
const { Link } = Typography
function ProductCard({
  addToWishlist,
  image,
  link,
  name,
  price,
  removeFromWishlist,
  retailerName,
  starred,
  onClick,
}) {
  return (
    <Card
      style={{ width: 240 }}
      hoverable
      cover={<img alt={name} src={image} width={240} height="auto" style={{ maxHeight: 300 }} />}
      onClick={onClick}
    >
      <Meta
        title={`$ ${price}`}
        description={
          <div>
            <strong>{name}</strong>
            <Row>
              <Col flex="auto">
                <Link href={link} target="_blank">
                  View in {retailerName}
                </Link>
              </Col>
              <Col>
                {starred ? (
                  <Button
                    icon={<StarFilled />}
                    shape="circle"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFromWishlist()
                    }}
                  />
                ) : (
                  <Button
                    icon={<StarOutlined />}
                    shape="circle"
                    onClick={(e) => {
                      e.stopPropagation()
                      addToWishlist()
                    }}
                  />
                )}
              </Col>
            </Row>
          </div>
        }
      />
    </Card>
  )
}

ProductCard.propTypes = {
  image: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  removeFromWishlist: PropTypes.func.isRequired,
  addToWishlist: PropTypes.func.isRequired,
  retailerName: PropTypes.string.isRequired,
  onClick: PropTypes.func,
}

ProductCard.defaultProps = {
  onClick: () => {},
}

export default ProductCard
