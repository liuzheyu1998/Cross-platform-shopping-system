import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { notification, Spin, Typography, Col, Row } from "antd"
import { confirmSignUp, signUp, signIn } from "../../lib/auth"
import NewSession, { CONFIRM, SIGNUP, LOGIN } from "./form"

const { Title, Text } = Typography

const NOTIFICATIONS = {
  CONFIRM: "Confirm Sign Up Failed",
  SIGNUP: "Sign Up Failed",
  LOGIN: "Log In Failed",
}

const PROMPTS = {
  CONFIRM: {
    title: "Confirm Sign up",
    text: "Please check your mailbox for the verification code",
  },
  SIGNUP: {
    title: "Sign up",
    text: "Sign up to fully enjoy exciting features offered by Complaza",
  },
  LOGIN: {
    title: "Log in",
    text: "Log in to enjoy all features offered by Complaza",
  },
}

const ACTIONS = {
  CONFIRM: confirmSignUp,
  SIGNUP: signUp,
  LOGIN: signIn,
}

const KEY = "session-create-error"
const openNotification = (title, msg) => {
  notification.error({
    message: title,
    description: msg,
    duration: 0,
    key: KEY,
  })
}

function Session({ type, initialEmail, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      notification.close(KEY)
    }
  }, [])

  const onSubmit = async (values) => {
    try {
      notification.close(KEY)
      setIsSubmitting(true)
      const { user } = await ACTIONS[type](values)

      onSuccess(user)
    } catch (err) {
      openNotification(NOTIFICATIONS[type], err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const content = (
    <NewSession type={type} onSubmit={onSubmit} initialValues={{ email: initialEmail }} />
  )
  return (
    <>
      <Row className="tw-mb-4">
        <Col offset={4}>
          <Title level={2}>{PROMPTS[type].title}</Title>
          <Text>{PROMPTS[type].text}</Text>
        </Col>
      </Row>
      {isSubmitting ? <Spin>{content}</Spin> : content}
    </>
  )
}

Session.propTypes = {
  type: PropTypes.oneOf([LOGIN, SIGNUP, CONFIRM]).isRequired,
  initialEmail: PropTypes.string,
  onSuccess: PropTypes.func,
}

Session.defaultProps = {
  initialEmail: "",
  onSuccess: () => {},
}

export default Session
