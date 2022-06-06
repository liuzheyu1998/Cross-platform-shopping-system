import React, { useEffect } from "react"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import { Button } from "antd"
import { AudioOutlined, AudioMutedOutlined } from "@ant-design/icons"

function Dictaphone({ setQuery }) {
  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition()

  useEffect(() => {
    setQuery(transcript)
  }, [transcript, setQuery])

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn&apos;t support speech recognition.</span>
  }

  return (
    <div>
      <Button
        variant="outline-secondary"
        onClick={() =>
          listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening()
        }
      >
        {listening ? (
          <span>
            <AudioMutedOutlined />
            Stop
          </span>
        ) : (
          <span>
            <AudioOutlined /> Start
          </span>
        )}
      </Button>
    </div>
  )
}
export default Dictaphone
