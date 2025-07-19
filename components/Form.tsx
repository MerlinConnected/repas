'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@supabase/supabase-js'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover'

import { cn } from '@/lib/utils'

import { fetchAllData, type RepasEntry } from '@/lib/fetch'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type RepasFormValues = {
	restaurant_name: string
	reviewer_name: string
	rating: string
	comment: string
	location: string
	date: string
}

export default function FormComponent() {
	const [restaurants, setRestaurants] = useState<string[]>([])
	const [locations, setLocations] = useState<string[]>([])
	const [_, setAllData] = useState<RepasEntry[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showNewRestaurant, setShowNewRestaurant] = useState(false)
	const [newRestaurant, setNewRestaurant] = useState('')
	const [showNewLocation, setShowNewLocation] = useState(false)
	const [newLocation, setNewLocation] = useState('')

	const form = useForm<RepasFormValues>({
		defaultValues: {
			restaurant_name: '',
			reviewer_name: '',
			rating: '',
			comment: '',
			location: '',
			date: new Date().toISOString().slice(0, 10)
		}
	})

	// Fetch restaurants and locations
	useEffect(() => {
		const loadData = async () => {
			const { restaurants, locations, allData } = await fetchAllData()
			setRestaurants(restaurants)
			setLocations(locations)
			setAllData(allData)
		}
		loadData()
	}, [])

	const onSubmit = async (values: RepasFormValues) => {
		setLoading(true)
		setError(null)

		const insertData = {
			restaurant_name: values.restaurant_name,
			reviewer_name: values.reviewer_name,
			rating: parseFloat(values.rating),
			comment: values.comment,
			location: values.location,
			created_at: new Date(values.date).toISOString()
		}

		const { data, error } = await supabase
			.from('super repas')
			.insert([insertData])

		setLoading(false)
		if (error) {
			setError(error.message)
		} else {
			form.reset()
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
				<FormField
					control={form.control}
					name='restaurant_name'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nom du plat</FormLabel>
							{showNewRestaurant ? (
								<div className='flex gap-2'>
									<Input
										value={newRestaurant}
										onChange={(e) => setNewRestaurant(e.target.value)}
										placeholder='Nouveau plat'
									/>
									<Button
										type='button'
										onClick={() => {
											if (
												newRestaurant.trim() &&
												!restaurants.includes(newRestaurant.trim())
											) {
												setRestaurants((prev) => [
													...prev,
													newRestaurant.trim()
												])
												field.onChange(newRestaurant.trim())
											}
											setShowNewRestaurant(false)
											setNewRestaurant('')
										}}
									>
										Ajouter
									</Button>
									<Button
										type='button'
										variant='secondary'
										onClick={() => {
											setShowNewRestaurant(false)
											setNewRestaurant('')
										}}
									>
										Annuler
									</Button>
								</div>
							) : (
								<div className='flex gap-2'>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder='Nom du plat' />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{restaurants.map((r) => (
												<SelectItem key={r} value={r}>
													{r}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										type='button'
										onClick={() => setShowNewRestaurant(true)}
									>
										Ajouter un plat
									</Button>
								</div>
							)}
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='location'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Lieu</FormLabel>
							{showNewLocation ? (
								<div className='flex gap-2'>
									<Input
										value={newLocation}
										onChange={(e) => setNewLocation(e.target.value)}
										placeholder='Nouveau lieu'
									/>
									<Button
										type='button'
										onClick={() => {
											if (
												newLocation.trim() &&
												!locations.includes(newLocation.trim())
											) {
												setLocations((prev) => [...prev, newLocation.trim()])
												field.onChange(newLocation.trim())
											}
											setShowNewLocation(false)
											setNewLocation('')
										}}
									>
										Ajouter
									</Button>
									<Button
										type='button'
										variant='secondary'
										onClick={() => {
											setShowNewLocation(false)
											setNewLocation('')
										}}
									>
										Annuler
									</Button>
								</div>
							) : (
								<div className='flex gap-2'>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder='Lieu' />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{locations.map((loc) => (
												<SelectItem key={loc} value={loc}>
													{loc}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										type='button'
										onClick={() => setShowNewLocation(true)}
									>
										Ajouter un lieu
									</Button>
								</div>
							)}
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='reviewer_name'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Reviewer</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder='Reviewer' />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value='Gaëtan'>Gaëtan</SelectItem>
									<SelectItem value='Ferdinand'>Ferdinand</SelectItem>
									<SelectItem value='Lili-Rose'>Lili-Rose</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='rating'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Note</FormLabel>
							<FormControl>
								<Input
									type='number'
									step='0.1'
									max={10}
									placeholder='Note'
									inputMode='decimal'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='date'
					render={({ field }) => (
						<FormItem className='flex flex-col'>
							<FormLabel>Date</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={'outline'}
											className={cn(
												'w-[240px] pl-3 text-left font-normal',
												!field.value && 'text-muted-foreground'
											)}
										>
											{field.value ? (
												format(
													typeof field.value === 'string'
														? new Date(field.value)
														: field.value,
													'PPP'
												)
											) : (
												<span>Choisir une date</span>
											)}
											<CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className='w-auto p-0' align='start'>
									<Calendar
										mode='single'
										selected={
											typeof field.value === 'string'
												? new Date(field.value)
												: field.value
										}
										onSelect={(date) => {
											if (date) {
												const iso = date.toISOString().slice(0, 10)
												field.onChange(iso)
											}
										}}
										captionLayout='dropdown'
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='comment'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Commentaire</FormLabel>
							<FormControl>
								<Textarea {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type='submit' disabled={loading}>
					{loading ? 'Envoi...' : 'Envoyer'}
				</Button>
				{error && <div className='text-red-500'>{error}</div>}
			</form>
		</Form>
	)
}
