/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/img-redundant-alt */

import React from "react"
import PropTypes from "prop-types"
import Link from "next/link"

import { List, Grid } from "antd"
import { getDateTimeString } from "../../lib/datetime"

const { useBreakpoint } = Grid

function HistoryList({ items, imageUrlByKey }) {
  const screens = useBreakpoint()
  return (
    <List
      dataSource={items}
      renderItem={({ title, date, image }) => (
        <List.Item
          key={`${title}-${date}`}
          extra={
            image && screens.sm ? (
              <img
                width={200}
                alt={`uploaded image for keyword ${title}`}
                src={imageUrlByKey[image]}
              />
            ) : null
          }
        >
          <List.Item.Meta
            title={
              <Link
                href={image ? `/results?image=${image}&q=${title}` : `/results?q=${title}`}
                passHref
              >
                {title}
              </Link>
            }
            description={getDateTimeString(date)}
          />
        </List.Item>
      )}
    />
  )
}

HistoryList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      image: PropTypes.string,
    }).isRequired
  ).isRequired,
  imageUrlByKey: PropTypes.object.isRequired,
}

export default HistoryList
