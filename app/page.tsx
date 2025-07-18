'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import RepasLineChart from '../components/RepasLineChart'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

export default function SuperRepasForm({
	onSuccess
}: {
	onSuccess?: () => void
}) {
	const [form, setForm] = useState({
		restaurant_name: '',
		reviewer_name: '',
		rating: '',
		comment: '',
		location: '',
		date: new Date().toISOString().slice(0, 10) // YYYY-MM-DD
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [restaurants, setRestaurants] = useState<string[]>([])
	const [showNewRestaurant, setShowNewRestaurant] = useState(false)
	const [allData, setAllData] = useState<RepasEntry[]>([])
	const [locations, setLocations] = useState<string[]>([])
	const [showNewLocation, setShowNewLocation] = useState(false)

	// Fetch unique restaurant names on mount
	useEffect(() => {
		const fetchRestaurants = async () => {
			const { data, error } = await supabase
				.from('super repas')
				.select('restaurant_name')
			if (!error && data) {
				const unique = Array.from(
					new Set(data.map((r) => r.restaurant_name).filter(Boolean))
				)
				setRestaurants(unique)
			}
		}
		fetchRestaurants()
	}, [])

	// Fetch all reviews for the chart
	useEffect(() => {
		const fetchData = async () => {
			const { data, error } = await supabase.from('super repas').select()
			if (!error && data) setAllData(data)
		}
		fetchData()
	}, [])

	// Fetch unique locations on mount
	useEffect(() => {
		const fetchLocations = async () => {
			const { data, error } = await supabase
				.from('super repas')
				.select('location')
			if (!error && data) {
				const unique = Array.from(
					new Set(data.map((r) => r.location).filter(Boolean))
				)
				setLocations(unique)
			}
		}
		fetchLocations()
	}, [])

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		const { error } = await supabase.from('super repas').insert([
			{
				restaurant_name: form.restaurant_name,
				reviewer_name: form.reviewer_name,
				rating: parseFloat(form.rating),
				comment: form.comment,
				location: form.location, // <-- add this
				created_at: new Date(form.date).toISOString()
			}
		])

		setLoading(false)

		if (error) {
			setError(error.message)
		} else {
			// If a new restaurant was added, update the dropdown
			if (
				showNewRestaurant &&
				form.restaurant_name &&
				!restaurants.includes(form.restaurant_name)
			) {
				setRestaurants((prev) => [...prev, form.restaurant_name])
			}
			if (
				showNewLocation &&
				form.location &&
				!locations.includes(form.location)
			) {
				setLocations((prev) => [...prev, form.location])
			}
			setForm({
				restaurant_name: '',
				reviewer_name: '',
				rating: '',
				comment: '',
				location: '', // <-- add this
				date: new Date().toISOString().slice(0, 10)
			})
			setShowNewRestaurant(false)
			setShowNewLocation(false)
			if (onSuccess) onSuccess()
			// re-fetch data
			supabase
				.from('super repas')
				.select()
				.then(({ data, error }) => {
					if (!error && data) setAllData(data)
				})
		}
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-2'>
			{showNewRestaurant ? (
				<div className='flex gap-2'>
					<input
						name='restaurant_name'
						placeholder='New Restaurant Name'
						value={form.restaurant_name}
						onChange={handleChange}
						required
					/>
					<button
						type='button'
						onClick={() => {
							setShowNewRestaurant(false)
							setForm((f) => ({ ...f, restaurant_name: '' }))
						}}
					>
						Cancel
					</button>
				</div>
			) : (
				<div className='flex gap-2'>
					<select
						name='restaurant_name'
						value={form.restaurant_name}
						onChange={handleChange}
						required
					>
						<option value='' disabled>
							Select Restaurant
						</option>
						{restaurants.map((r) => (
							<option key={r} value={r}>
								{r}
							</option>
						))}
					</select>
					<button type='button' onClick={() => setShowNewRestaurant(true)}>
						Add new restaurant
					</button>
				</div>
			)}
			{showNewLocation ? (
				<div className='flex gap-2'>
					<input
						name='location'
						placeholder='New Location'
						value={form.location}
						onChange={handleChange}
						required
					/>
					<button
						type='button'
						onClick={() => {
							setShowNewLocation(false)
							setForm((f) => ({ ...f, location: '' }))
						}}
					>
						Cancel
					</button>
				</div>
			) : (
				<div className='flex gap-2'>
					<select
						name='location'
						value={form.location}
						onChange={handleChange}
						required
					>
						<option value='' disabled>
							Select Location
						</option>
						{locations.map((loc) => (
							<option key={loc} value={loc}>
								{loc}
							</option>
						))}
					</select>
					<button type='button' onClick={() => setShowNewLocation(true)}>
						Add new location
					</button>
				</div>
			)}
			<select
				name='reviewer_name'
				value={form.reviewer_name}
				onChange={handleChange}
				required
			>
				<option value='' disabled>
					Select Reviewer
				</option>
				<option value='Gaëtan'>Gaëtan</option>
				<option value='Ferdinand'>Ferdinand</option>
				<option value='Lili-Rose'>Lili-Rose</option>
			</select>
			<input
				name='rating'
				placeholder='Rating'
				type='number'
				step='0.1'
				max={10}
				value={form.rating}
				onChange={handleChange}
				required
			/>
			<input
				type='date'
				name='date'
				value={form.date}
				onChange={handleChange}
				required
				className='input'
			/>
			<textarea
				name='comment'
				placeholder='Comment'
				value={form.comment}
				onChange={handleChange}
				required
			/>
			<button type='submit' disabled={loading}>
				{loading ? 'Submitting...' : 'Submit'}
			</button>
			{error && <div style={{ color: 'red' }}>{error}</div>}
			<RepasLineChart data={allData} />
		</form>
	)
}
