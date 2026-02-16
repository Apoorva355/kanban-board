"use client";
import React from "react";
import { SortableContext } from "@dnd-kit/sortable";

export default function Board({
	children,
	id,
}: {
	children: React.ReactNode;
	id: number[];
}) {
	return (
		<div>
			<SortableContext items={id}>{children}</SortableContext>
		</div>
	);
}
