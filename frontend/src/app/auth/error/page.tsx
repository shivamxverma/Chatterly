import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function AuthError({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.message;
  const message = Array.isArray(raw) ? raw[0] : raw;

  return (
    <div className="h-screen flex justify-center items-center flex-col">
      <Image src="/images/error.svg" width={500} height={500} alt="error" />
      <p className="text-xl">{message ?? ""}</p>
      <Link href="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
