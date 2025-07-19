'use client'

import FormComponent from '@/components/Form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Page() {
	return (
		<div className='space-y-6 max-w-4xl mx-auto p-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-3xl font-bold'>Super Repas</h1>
				<Button asChild>
					<Link href='/charts'>View Charts</Link>
				</Button>
			</div>
			<FormComponent />
		</div>
	)
}
