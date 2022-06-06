import { API } from "aws-amplify"

export const postWishlist = ({ userId, token, item }) =>
  API.post("default", `/wishlist/${userId}`, {
    body: {
      item: {
        name: item.name,
        image: item.image,
        price: item.price,
        link: item.link,
        retailer: item.retailer,
      },
    },
    headers: {
      Authorization: token,
    },
  })

export const deleteWishlist = ({ userId, token, item }) =>
  API.del("default", `/wishlist/${userId}/${item.id}`, {
    headers: {
      Authorization: token,
    },
  })
