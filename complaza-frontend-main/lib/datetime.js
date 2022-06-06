function convertDateTime(dateTime) {
  const [dateStr, timeStr] = dateTime.split(" ")
  const date = dateStr.split("-")
  const yyyy = date[0]
  const mm = date[1] - 1
  const dd = date[2]

  const time = timeStr.split(":")
  const h = time[0]
  const m = time[1]
  const s = parseInt(time[2], 10) // get rid of that 00.0;

  return new Date(yyyy, mm, dd, h, m, s)
}

function convertUTCDateToLocalDate(date) {
  const newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000)

  const offset = date.getTimezoneOffset() / 60
  const hours = date.getHours()

  newDate.setHours(hours - offset)

  return newDate
}

export const getDateTimeString = (datetime) => {
  const d = convertUTCDateToLocalDate(convertDateTime(datetime))
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}

export const getDateString = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString()
}
