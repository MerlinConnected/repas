'use client'

import { useState, useEffect } from 'react'
import RepasLineChart from '@/components/RepasLineChart'
import { fetchAllRepas, type RepasEntry } from '@/lib/fetch'

export default function ChartsPage() {
	const [allData, setAllData] = useState<RepasEntry[]>([])

	useEffect(() => {
		const loadData = async () => {
			const data = await fetchAllRepas()
			setAllData(data)
		}
		loadData()
	}, [])

	return (
		<div className='space-y-6 max-w-4xl mx-auto p-6'>
			<h1 className='text-3xl font-bold'>Repas Charts</h1>
			<div className='text-sm text-gray-600 mb-4'>
				Data entries: {allData.length}
			</div>
			<RepasLineChart data={allData} />
		</div>
	)
}
