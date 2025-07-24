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
import { type RepasEntry } from '@/lib/fetch'

Chart.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Legend,
	Tooltip
)

export default function RepasLineChart({ data }: { data: RepasEntry[] }) {
	// Helper to determine meal type
	function getMealType(dateStr: string) {
		const hour = new Date(dateStr).getUTCHours()
		return hour < 17 ? 'Lunch' : 'Dinner'
	}

	// Get unique sorted meal labels (YYYY-MM-DD Lunch/Dinner)
	const mealLabels = Array.from(
		new Set(
			data
				.filter((d) => d.created_at)
				.map((d) => {
					const date = d.created_at!.slice(0, 10)
					const meal = getMealType(d.created_at!)
					return `${date} ${meal}`
				})
		)
	).sort((a, b) => {
		const [dateA, mealA] = a.split(' ')
		const [dateB, mealB] = b.split(' ')
		if (dateA !== dateB) {
			return dateA.localeCompare(dateB)
		}
		// Lunch before Dinner
		if (mealA === mealB) return 0
		if (mealA === 'Lunch') return -1
		return 1
	})

	// Get reviewers
	const reviewers = ['Gaëtan', 'Ferdinand', 'Lili-Rose']

	// Build datasets: one per reviewer
	const datasets = reviewers.map((reviewer, idx) => ({
		label: reviewer,
		data: mealLabels.map((label) => {
			const [date, meal] = label.split(' ')
			const entry = data.find((d) => {
				if (!d.created_at) return false
				const entryDate = d.created_at.slice(0, 10)
				const entryMeal = getMealType(d.created_at)
				return (
					d.reviewer_name === reviewer &&
					entryDate === date &&
					entryMeal === meal
				)
			})
			return entry ? entry.rating : null
		}),
		borderColor: ['#e11d48', '#2563eb', '#059669'][idx],
		backgroundColor: ['#fca5a5', '#93c5fd', '#6ee7b7'][idx],
		spanGaps: true
	}))

	return (
		<Line
			data={{
				labels: mealLabels,
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
								const label = context.chart.data.labels?.[idx] as string
								const [date, meal] = label.split(' ')
								const entry = data.find((d) => {
									if (!d.created_at) return false
									const entryDate = d.created_at.slice(0, 10)
									const entryMeal = getMealType(d.created_at)
									return (
										d.reviewer_name === reviewer &&
										entryDate === date &&
										entryMeal === meal
									)
								})
								if (!entry) return `${reviewer}: no data`
								return [
									`Date: ${date} (${meal})`,
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
					x: { title: { display: true, text: 'Date & Meal' } }
				}
			}}
		/>
	)
}
