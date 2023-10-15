/* eslint-disable @typescript-eslint/no-explicit-any */
import { startOfDay, endOfISOWeek, isSameDay, startOfISOWeek, endOfMonth, addMonths, startOfMonth, subDays, addDays } from "date-fns";

export const lastWeek = {
	label: 'Last week',
	range: () => ({
		startDate: startOfISOWeek(subDays(new Date(), 7)),
		endDate: endOfISOWeek(subDays(new Date(), 7)),
		key: 'selection'
	}),
	isSelected: (range: any) => {
		if (range.startDate && range.endDate) {
			return (
				isSameDay(range.startDate, startOfISOWeek(subDays(new Date(), 7))) &&
				isSameDay(range.endDate, endOfISOWeek(subDays(new Date(), 7)))
			)
		}
		return false;
	}
}

export const thisWeek = {
	label: 'This Week',
	range: () => ({
		startDate: startOfISOWeek(new Date()),
		endDate: endOfISOWeek(new Date()),
		key: 'selection'
	}),
	isSelected: (range: any) => {
		if (range.startDate && range.endDate) {
			return (
				isSameDay(range?.startDate, startOfISOWeek(new Date())) &&
				isSameDay(range?.endDate, endOfISOWeek(new Date()))
			)
		}
		return false;
	}
}

export const nextWeek = {
	label: 'Next Week',
	range: () => ({
		startDate: startOfISOWeek(addDays(new Date(), 7)),
		endDate: endOfISOWeek(addDays(new Date(), 7)),
		key: 'selection'
	}),
	isSelected: (range: any) => {
		if (range.startDate && range.endDate) {
			return (
				isSameDay(range?.startDate, startOfISOWeek(addDays(new Date(), 7))) &&
				isSameDay(range?.endDate, endOfISOWeek(addDays(new Date(), 7)))
			)
		}
		return false;
	}
}

export const uptoEndOfWeek = {
	label: 'Upto end of week',
	range: () => ({
		startDate: startOfDay(new Date()),
		endDate: endOfISOWeek(new Date()),
		key: 'selection'
	}),
	isSelected: (range: any) => {
		if (range.startDate && range.endDate) {
			return (
				isSameDay(range?.startDate, startOfDay(new Date())) &&
				isSameDay(range?.endDate, endOfISOWeek(new Date()))
			)
		}
		return false;
	}
}

export const uptoEndOfMonth = {
	label: 'Upto end of month',
	range: () => ({
		startDate: startOfDay(new Date()),
		endDate: endOfMonth(new Date()),
		key: 'selection'
	}),
	isSelected: (range: any) => {
		if (range.startDate && range.endDate) {
			return (
				isSameDay(range?.startDate, startOfDay(new Date())) &&
				isSameDay(range?.endDate, endOfMonth(new Date()))
			)
		}
		return false;
	}
}

const defineds = {
	startOfNextMonth: startOfMonth(addMonths(new Date(), 1)),
	endOfNextMonth: endOfMonth(addMonths(new Date(), 1)),
};

export const nextMonth = {
	label: 'Next Month',
	range: () => ({
		startDate: defineds.startOfNextMonth,
		endDate: defineds.endOfNextMonth,
	}),
}