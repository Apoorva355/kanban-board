import React from "react";
export default function TestingLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="h-[700] bg-gray-200 flex justify-center items-center">
			{children}
		</div>
	);
}
