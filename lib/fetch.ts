import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type RepasEntry = {
	restaurant_name: string
	reviewer_name: string
	rating: number
	comment: string
	location: string
	created_at: string
	umai: boolean
}

export async function fetchRestaurants(): Promise<string[]> {
	const { data, error } = await supabase
		.from('super repas')
		.select('restaurant_name')

	if (error) {
		console.error('Error fetching restaurants:', error)
		return []
	}

	return Array.from(
		new Set(data?.map((r) => r.restaurant_name).filter(Boolean) || [])
	)
}

export async function fetchLocations(): Promise<string[]> {
	const { data, error } = await supabase.from('super repas').select('location')

	if (error) {
		console.error('Error fetching locations:', error)
		return []
	}

	return Array.from(new Set(data?.map((l) => l.location).filter(Boolean) || []))
}

export async function fetchAllRepas(): Promise<RepasEntry[]> {
	const { data, error } = await supabase.from('super repas').select()

	if (error) {
		console.error('Error fetching all repas:', error)
		return []
	}

	return data || []
}

export async function fetchAllData() {
	const [restaurants, locations, allData] = await Promise.all([
		fetchRestaurants(),
		fetchLocations(),
		fetchAllRepas()
	])

	return {
		restaurants,
		locations,
		allData
	}
}
