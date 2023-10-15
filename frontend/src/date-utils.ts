/* eslint-disable @typescript-eslint/no-explicit-any */
export const formatDate = (isoDate: string) => {
	const myDate = new Date(isoDate)
	// Define options for formatting
	const options = { day: 'numeric', month: 'short' };

	// Format the date using toLocaleString
	const formattedDate = myDate.toLocaleString('en-US', options as any);
	return formattedDate
}