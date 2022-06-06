import { useState, useCallback } from "react"
import { useRouter } from "next/router"
import styled from "styled-components"
import { Row, Col, Button, Input, Spin, Typography } from "antd"
import { API, Storage } from "aws-amplify"
import { v4 as uuidv4 } from "uuid"
import Uploader from "../components/uploader"
import SearchBar from "../components/search-bar"

const { Text } = Typography

const UploaderWrapper = styled.div`
  margin-top: 24px;
`

function Home() {
  const [textQuery, setTextQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isTextSearchError, setIsTextSearchError] = useState(false)
  const [isImageSearchError, setIsImageSearchError] = useState(false)

  const router = useRouter()

  const onTextSearch = useCallback(() => {
    setIsTextSearchError(false)

    if (textQuery === "") {
      setIsTextSearchError(true)
      return
    }

    router.push(`/results?q=${textQuery}`)
  }, [router, textQuery])

  const onTextClear = useCallback(() => {
    setIsTextSearchError(false)
    setTextQuery("")
  }, [])

  const onImageSearch = useCallback(
    async (file) => {
      setIsSearching(true)
      const { type } = file
      const key = uuidv4()
      const suffix = type.split("/")[1]
      const fileName = `${key}.${suffix}`

      try {
        await Storage.put(fileName, file, {
          contentType: type,
        })

        const res = await API.get("default", `/image/${fileName}`)

        if (res.statusCode !== 200) {
          throw res
        }

        const { title } = res.body
        router.push(`/results?image=${fileName}&q=${title}`)
        setIsSearching(false)
      } catch (error) {
        console.error(error)
        setIsSearching(false)
      }
    },
    [router]
  )

  const content = (
    <div>
      <SearchBar
        isError={isTextSearchError}
        query={textQuery}
        setQuery={setTextQuery}
        onSearch={onTextSearch}
        onClear={onTextClear}
      />
      <UploaderWrapper>
        <Uploader onSearch={onImageSearch} />
        {isImageSearchError && <Text type="danger">Please upload a picture</Text>}
      </UploaderWrapper>
    </div>
  )

  return <main>{isSearching ? <Spin tip="Processing image...">{content}</Spin> : content}</main>
}

export default Home
