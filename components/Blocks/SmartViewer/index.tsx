/*
 * This component is used to show inputs and outputs of runs.
 * It should be able to show & format:
 * - Complicated objects with many properties
 * - Messages (one or more)
 * - Simple JSON
 * - Text
 */

import { Code, Highlight, Spoiler } from "@mantine/core"
import { useMemo } from "react"
import MessageViewer from "./MessageViewer"
import { JsonView, defaultStyles } from "react-json-view-lite"
import { ChatMessage } from "./Message"
import ProtectedText from "../ProtectedText"

const checkIsMessage = (obj) => {
  return typeof obj?.text === "string" || typeof obj?.functionCall === "object"
}

export default function SmartViewer({
  data,
  error,
  compact = false,
}: {
  data: any
  error?: any
  compact?: boolean
}) {
  const parsed = useMemo(() => {
    if (!data) return null
    if (typeof data === "string" && data?.startsWith("{")) {
      try {
        return JSON.parse(data)
      } catch (e) {
        return data
      }
    }

    return data
  }, [data])

  const isObject = typeof parsed === "object"

  const isFatObject = useMemo(() => {
    if (!isObject || !parsed) return false
    if (Object.keys(parsed).length > 3) return true
    if (JSON.stringify(parsed).length > 300) return true
    return false
  }, [parsed])

  const isMessages = useMemo(() => {
    if (!parsed) return false
    return Array.isArray(parsed)
      ? parsed.every(checkIsMessage)
      : checkIsMessage(parsed)
  }, [parsed])

  return (
    <Spoiler maxHeight={500} showLabel="Show more ↓" hideLabel="Show less ↑">
      <pre className={compact ? "compact" : ""}>
        {error && (
          <ChatMessage
            data={{
              role: "error",
              text:
                typeof error.stack === "string"
                  ? compact
                    ? error.message || error.stack
                    : error.stack
                  : typeof error === "object"
                  ? JSON.stringify(error, null, 2)
                  : error,
            }}
            compact={compact}
          />
        )}

        {data && (
          <ProtectedText>
            {isObject ? (
              isMessages ? (
                <MessageViewer data={parsed} compact={compact} />
              ) : (
                <Code color="blue">
                  {isFatObject ? (
                    <JsonView
                      data={parsed}
                      shouldInitiallyExpand={(level) => level < 1}
                      style={defaultStyles}
                    />
                  ) : (
                    JSON.stringify(parsed, null, 2)
                  )}
                </Code>
              )
            ) : (
              <Code color="blue">{parsed}</Code>
            )}
          </ProtectedText>
        )}
      </pre>

      <style jsx>{`
        pre {
          white-space: pre-wrap;
          margin: 0;
        }

        pre.compact {
          max-height: 96px;
          overflow: hidden;
          width: 100%;
        }

        pre :global(code) {
          padding: 10px;
          display: block;
        }

        /* Fixes for json-view-lite */
        pre :global(code div[role="list"] > div) {
          padding-left: 8px;
        }

        /* Hide first expander btn */
        pre :global(code > div > div > span[role="button"]) {
          display: none;
        }

        pre :global(code span[role="button"]) {
          cursor: pointer;
        }
      `}</style>
    </Spoiler>
  )
}
