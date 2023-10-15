/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import { getEventsByRange } from '../api/events';
import { EventType } from '../types';
import { formatDate } from '../date-utils';

type SelectionRange = {
	startDate?: Date
	endDate?: Date
	key?: string
}

// Set the timeMin and timeMax parameters.
const now = new Date();
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
const endOfToday = new Date(startOfToday.getTime() + (24 * 60 * 60 * 1000) - 1);

export default function MyCalendar() {
	const [events, setEvents] = useState<EventType[]>([])
	const [selectionRange, setSelectionRange] = useState<SelectionRange>({
		startDate: startOfToday,
		endDate: endOfToday,
		key: 'selection',
	})

	useEffect(() => {
		async function main() {
			if (!selectionRange.startDate || !selectionRange.endDate) { return; }

			const res = await getEventsByRange(selectionRange.startDate.toJSON(), selectionRange.endDate.toJSON())
			setEvents(res.data)
		}
		main()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleSelect = async (rangesByKey: RangeKeyDict) => {
		const isSameDay = rangesByKey.selection.startDate === rangesByKey.selection.endDate;
		let selected: SelectionRange;
		if (isSameDay) {
			const endDate = rangesByKey.selection.startDate!;
			const startOfDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0, 0);
			const endOfDay = new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000) - 1);
			selected = {
				startDate: startOfDay,
				endDate: endOfDay,
				key: rangesByKey.selection.key, // This is always 'selection' as per my experience
			}
		} else {
			const endDate = rangesByKey.selection.endDate!;
			const startOfDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0, 0);
			const endOfDay = new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000) - 1);

			selected = {
				startDate: rangesByKey.selection.startDate,
				endDate: endOfDay,
				key: rangesByKey.selection.key, // This is always 'selection' as per my experience
			}
		}

		setSelectionRange(selected)
		const res = await getEventsByRange(selected.startDate!.toJSON(), selected.endDate!.toJSON())
		setEvents(res.data)

		// console.log('rangesByKey.selection.key?', rangesByKey.selection.key);
		// OUTPUT: rangesByKey
		// {
		//   selection: {
		//     startDate: [native Date Object],
		//     endDate: [native Date Object],
		//   }
		// }
	}

	return (
		<div>
			<DateRangePicker
				className='any_class_i_need'
				ranges={[selectionRange]}
				onChange={handleSelect}
				weekStartsOn={1}
			/>

			<h1>Events</h1>
			{events.map((event) =>
				<div
					id={event.id}>
					{formatDate(event.start.dateTime)} | {event.summary}
				</div>)}
		</div>
	);
}