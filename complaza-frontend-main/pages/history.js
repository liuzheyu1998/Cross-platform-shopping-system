import React, { useState, useEffect, useContext, useCallback } from "react"
import { API, Storage } from "aws-amplify"
import qs from "qs"
import { Typography } from "antd"
import AuthContext from "../context/auth"
import withProtectedRoute from "../components/protected-route"
import HistoryList from "../components/history/list"
import Loader from "../components/history/loader"
import SearchBar from "../components/search-bar"

const { Title } = Typography

const parseImageUrls = (imageUrls) =>
  imageUrls.reduce((memo, { url, image }) => {
    memo[image] = url
    return memo
  }, {})

function History() {
  const [items, setItems] = useState([])
  const [imageUrlByKey, setImageUrlByKey] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const { userId, token } = useContext(AuthContext)
  const [isError, setIsError] = useState(false)
  const [query, setQuery] = useState("")

  const queryFromHistory = useCallback(
    async (q) => {
      if (!userId || !token) {
        return
      }
      setIsLoading(true)
      const params = {
        q,
      }
      const link = q ? `/search/history/${userId}?${qs.stringify(params)}` : `/history/${userId}`

      const res = await API.get("default", link, {
        headers: {
          Authorization: token,
        },
      })

      if (res.statusCode !== 200) {
        return
      }

      const { items: resultItems } = res.body

      const imageUrls = await Promise.all(
        resultItems.map(({ image }) => Storage.get(image).then((url) => ({ url, image })))
      )

      setItems(resultItems)
      setImageUrlByKey(parseImageUrls(imageUrls))
      setIsLoading(false)
    },
    [token, userId]
  )

  useEffect(() => {
    queryFromHistory()
  }, [queryFromHistory, token, userId])

  const onSearch = useCallback(() => {
    setIsError(false)

    if (query === "") {
      setIsError(true)
      return
    }

    queryFromHistory(query)
  }, [queryFromHistory, query])

  const onClear = useCallback(() => {
    setQuery("")
    queryFromHistory("")
  }, [queryFromHistory])

  return (
    <div>
      <Title>History</Title>
      <SearchBar
        isError={isError}
        query={query}
        setQuery={setQuery}
        onSearch={onSearch}
        onClear={onClear}
      />
      {isLoading ? <Loader /> : <HistoryList items={items} imageUrlByKey={imageUrlByKey} />}
    </div>
  )
}

export default withProtectedRoute(History)
