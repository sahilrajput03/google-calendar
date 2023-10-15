/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { DateRangePicker, RangeKeyDict, createStaticRanges, defaultStaticRanges } from 'react-date-range';
import { getEventsByRange } from '../api/events';
import { EventType } from '../types';
import { formatDate } from '../date-utils';
import { lastWeek, nextMonth, nextWeek, thisWeek, uptoEndOfMonth, uptoEndOfWeek } from '../utils-custom-range';
import { flushSync } from 'react-dom';

// Reference file - https://github.com/hypeserver/react-date-range/blob/222d80c0d84147d346f2676cd590824bb6782a85/src/defaultRanges.js

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
	const abortControllerRef = useRef<AbortController | null>(null);

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
		let selected: SelectionRange;

		const isSameDay = rangesByKey.selection.startDate === rangesByKey.selection.endDate;
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
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		abortControllerRef.current = new AbortController();
		const res = await getEventsByRange(
			selected.startDate!.toJSON(),
			selected.endDate!.toJSON(),
			abortControllerRef.current.signal
		)
		flushSync(() => {
			setEvents(res.data)
		});
		window.scrollTo({
			top: document.body.scrollHeight,
			left: 0,
			behavior: 'smooth'
		});

		// TODO: Make duplidate for specific dates for above calendar days
		// TODO: For this I need to multiple `event` items and then call `setEvents` with those duplicate events.
		// const recurrence = res.data.map((item: any) => item.recurrence);
		// const datesNumbers = recurrence.map((rec: string[]) => {
		// 	return rec.map((r) => {
		// 		const splitted = r?.split(';');
		// 		const found = splitted.find((r: any) => r?.startsWith('BYMONTHDAY'));
		// 		const datesNumber = found?.split('=')[1];
		// 		return datesNumber;
		// 	})
		// });
		// console.log('datesNumber?', datesNumbers); // OUTPUT: [ "5,6,7,8,9,10" ]
	}

	// DEFAULT STATIC RANGES:
	// ======================
	// Today
	// Yesterday
	// This Week
	// Last Week
	// This Month
	// Last Month
	// ? LEARN: DefaultRanges.js file = https://github.com/hypeserver/react-date-range/blob/222d80c0d84147d346f2676cd590824bb6782a85/src/defaultRanges.js
	const staticRanges = createStaticRanges([
		defaultStaticRanges.find((staticRange) => staticRange.label === 'Last Month') as any,
		lastWeek,
		defaultStaticRanges.find((staticRange) => staticRange.label === 'Yesterday') as any,
		defaultStaticRanges.find((staticRange) => staticRange.label === 'Today') as any,
		uptoEndOfWeek,
		uptoEndOfMonth,
		thisWeek,
		nextWeek,
		defaultStaticRanges.find((staticRange) => staticRange.label === 'This Month') as any,
		nextMonth,
		// My custom statis ranges:
		// NOTE: Ad other ranges as per need
	]);

	const noEvents = events.length === 0

	return (
		<div>
			<DateRangePicker
				className='any_class_i_need'
				ranges={[selectionRange]}
				onChange={handleSelect}
				staticRanges={staticRanges}
				weekStartsOn={1}
				// showPreview={false} // To disable hovering preview
				inputRanges={[]} // Disabled `Days Upto` feature because it was a bit buggy and feature also not desired.
			/>

			<div className='events-container'>
				<h1>Events</h1>
				{noEvents ? 'No events' : events?.map((event) =>
					<div key={event.id} >
						{formatDate(event.start?.dateTime)} | {event.summary}
					</div>
				)}
			</div>
		</div>
	);
}