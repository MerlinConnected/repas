'use client'

import { Line } from 'react-chartjs-2'

import {
	Chart,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Legend,
	Tooltip
} from 'chart.js'

Chart.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Legend,
	Tooltip
)

type RepasEntry = {
	id?: number
	restaurant_name: string
	reviewer_name: string
	rating: number
	comment: string
	location: string
	created_at: string
}

export default function RepasLineChart({ data }: { data: RepasEntry[] }) {
	// Get unique sorted dates (YYYY-MM-DD)
	const dates = Array.from(
		new Set(
			data.map((d) => d.created_at && d.created_at.slice(0, 10)).filter(Boolean)
		)
	).sort()

	// Get reviewers
	const reviewers = ['Gaëtan', 'Ferdinand', 'Lili-Rose']

	// Build datasets: one per reviewer
	const datasets = reviewers.map((reviewer, idx) => ({
		label: reviewer,
		data: dates.map((date) => {
			const entry = data.find(
				(d) =>
					d.reviewer_name === reviewer &&
					d.created_at &&
					d.created_at.slice(0, 10) === date
			)
			return entry ? entry.rating : null
		}),
		borderColor: ['#e11d48', '#2563eb', '#059669'][idx],
		backgroundColor: ['#fca5a5', '#93c5fd', '#6ee7b7'][idx],
		spanGaps: true
	}))

	return (
		<Line
			data={{
				labels: dates,
				datasets
			}}
			options={{
				responsive: true,
				plugins: {
					legend: { position: 'top' as const },
					title: { display: true, text: 'Repas Ratings by Reviewer' },
					tooltip: {
						callbacks: {
							label: function (context) {
								const idx = context.dataIndex
								const reviewer = context.dataset.label
								const date = context.chart.data.labels?.[idx]
								const entry = data.find(
									(d) =>
										d.reviewer_name === reviewer &&
										d.created_at &&
										d.created_at.slice(0, 10) === date
								)
								if (!entry) return `${reviewer}: no data`
								return [
									`Date: ${date}`,
									`Reviewer: ${reviewer}`,
									`Restaurant: ${entry.restaurant_name}`,
									`Location: ${entry.location}`,
									`Rating: ${entry.rating}`,
									`Comment: ${entry.comment}`
								].join('\n')
							}
						}
					}
				},
				scales: {
					y: { min: 0, max: 10, title: { display: true, text: 'Rating' } },
					x: { title: { display: true, text: 'Date' } }
				}
			}}
		/>
	)
}
