"use client";

import * as React from "react";

export default function BookingSchedulePage() {
  const [date, setDate] = React.useState<Date>(new Date());
  const [type, setType] = React.useState<string>("badminton");

  const handleChange = React.useCallback(
    (filters: { date: Date; type: string }) => {
      setDate(filters.date);
      setType(filters.type);
    },
    []
  );

  return <div></div>;
}
