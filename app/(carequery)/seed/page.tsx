"use client";

import { seedDoctors } from "@/lib/seed";

export default function Seed() {
  return <button onClick={() => seedDoctors()}>Seed Doctors</button>;
}
