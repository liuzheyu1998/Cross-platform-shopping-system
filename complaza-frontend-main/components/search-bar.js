import React from "react"
import PropTypes from "prop-types"
import { Row, Col, Grid, Typography, Button, Input } from "antd"
import Dictaphone from "./dictaphone"

const { Text } = Typography
const { useBreakpoint } = Grid

function SearchBar({ isError, query, setQuery, onSearch, onClear }) {
  const screens = useBreakpoint()

  return (
    <Row gutter={16} className="tw-mb-5">
      <Col flex={screens.xs ? "100%" : "auto"} className={screens.xs ? "tw-mb-5" : ""}>
        <Input
          status={isError ? "error" : ""}
          placeholder="Search by text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={onSearch}
        />
        {isError && <Text type="danger">Please enter some text</Text>}
      </Col>
      <Col flex="24px">
        <Dictaphone setQuery={setQuery} />
      </Col>
      <Col flex="64px">
        <Button type="primary" onClick={onSearch}>
          Search
        </Button>
      </Col>
      <Col flex="64px">
        <Button type="default" onClick={onClear} disabled={query === ""}>
          Clear
        </Button>
      </Col>
    </Row>
  )
}

SearchBar.propTypes = {
  isError: PropTypes.bool.isRequired,
  query: PropTypes.string.isRequired,
  setQuery: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
}

export default SearchBar
