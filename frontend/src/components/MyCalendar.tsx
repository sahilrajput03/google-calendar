/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { DateRangePicker, RangeKeyDict, createStaticRanges, defaultStaticRanges } from 'react-date-range';
import { getEventsByRange } from '../api/events';
import { EventType } from '../types';
import { formatDate } from '../date-utils';
import { endOfISOWeek, isSameDay, startOfISOWeek, subDays } from 'date-fns';

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
		const res = await getEventsByRange(selected.startDate!.toJSON(), selected.endDate!.toJSON())
		setEvents(res.data)

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
	const staticRanges = createStaticRanges([
		defaultStaticRanges.find((staticRange) => staticRange.label === 'Today') as any,
		defaultStaticRanges.find((staticRange) => staticRange.label === 'Yesterday') as any,
		{
			label: 'Last week',
			range: () => ({
				startDate: startOfISOWeek(subDays(new Date(), 7)),
				endDate: endOfISOWeek(subDays(new Date(), 7)),
				key: 'selection'
			}),
			isSelected: (range) => {
				if (range.startDate && range.endDate) {
					return (
						isSameDay(range.startDate, startOfISOWeek(subDays(new Date(), 7))) &&
						isSameDay(range.endDate, endOfISOWeek(subDays(new Date(), 7)))
					)
				}
				return false;
			}
		},
		{
			label: 'This week',
			range: () => ({
				startDate: startOfISOWeek(new Date()),
				endDate: endOfISOWeek(new Date()),
				key: 'selection'
			}),
			isSelected: (range) => {
				if (range.startDate && range.endDate) {
					return (
						isSameDay(range?.startDate, startOfISOWeek(new Date())) &&
						isSameDay(range?.endDate, endOfISOWeek(new Date()))
					)
				}
				return false;
			}
		},
		defaultStaticRanges.find((staticRange) => staticRange.label === 'This Month') as any,
		defaultStaticRanges.find((staticRange) => staticRange.label === 'Last Month') as any,
		// Ad other ranges as per need
	]);

	return (
		<div>
			<DateRangePicker
				className='any_class_i_need'
				ranges={[selectionRange]}
				onChange={handleSelect}
				staticRanges={staticRanges}
				weekStartsOn={1}
				// showPreview={false} // To disable hovering preview
				inputRanges={[]} // Disable `Days Upto` feature
			/>

			<h1>Events</h1>
			{events?.map((event) =>
				<div
					id={event.id}>
					{formatDate(event.start?.dateTime)} | {event.summary}
				</div>)}
		</div>
	);
}