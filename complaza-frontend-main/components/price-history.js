import React from "react"
import PropTypes from "prop-types"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { getDateString } from "../lib/datetime"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
  },
}

const BLUE = "#1890ff"

const parseData = (pricesByDate) => {
  const keys = Object.keys(pricesByDate)
  const data = keys.map((date) => pricesByDate[date])
  const labels = keys.map((date) => getDateString(date))

  return {
    labels,
    datasets: [
      {
        label: "Recent price trend",
        data,
        fill: false,
        stepped: false,
        borderColor: BLUE,
        backgroundColor: `${BLUE}20`,
      },
    ],
  }
}

function PriceHistory({ prices }) {
  return <Line data={parseData(prices)} options={options} />
}

PriceHistory.propTypes = {
  prices: PropTypes.object.isRequired,
}

export default PriceHistory
